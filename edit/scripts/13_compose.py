"""Final compositor (video 2): A = full camera, B = floating camera window over the Liquid Glass graphics, C = graphics.
Cover on frame 0, single glass comment box as CTA. No new captions (the recording already carries burned-in ones).
Decodes/encodes through FFmpeg pipes with explicit BT.709 matrices; pipes rawvideo to libx264 + the master."""
import json, os, subprocess, sys, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
E = "/home/user/leo/edit"; W_, H_ = 1080, 1920; FPS = 60; SW, SH = 576, 1024
plan = json.load(open(f"{E}/work/plan.json"))
SEGS = plan["segments"]; PIECES = plan["pieces"]; NF = plan["frames"]
FONT = f"{E}/graphics/shared/fonts"
ONLY = None if len(sys.argv) < 2 or sys.argv[1] == "-" else [int(x) for x in sys.argv[1].split(",")]   # frame list for checks
OUT = sys.argv[2] if len(sys.argv) > 2 else f"{E}/final.mp4"
DEC = "scale=in_color_matrix=bt709:in_range=tv,format=rgb24"

# ---------------- source mapping (piece-wise: src = t - O + s), forward-only decoder
def piece_at(t):
    k = 0
    for i, p in enumerate(PIECES):
        if t + 1e-9 >= p["V"]: k = i
    return PIECES[k]
def src_index(t):
    p = piece_at(t); st = t - p["O"] + p["s"]
    return max(0, int(st * 30 + 1e-6))
class Pipe:
    """Sequential rawvideo reader; seeks by restarting FFmpeg only when asked to go backwards (check mode)."""
    def __init__(self, path, w, h, fps_in):
        self.path, self.w, self.h, self.fps = path, w, h, fps_in; self.pr = None; self.i = -1; self.f = None
    def _open(self, start):
        if self.pr: self.pr.kill()
        ss = [] if start == 0 else ["-ss", f"{start / self.fps:.6f}"]
        self.pr = subprocess.Popen(["ffmpeg", "-v", "error", *ss, "-i", self.path, "-vf", DEC, "-f", "rawvideo", "-"], stdout=subprocess.PIPE, bufsize=self.w * self.h * 3 * 4)
        self.i = start - 1
    def get(self, idx):
        if self.pr is None or idx < self.i or idx - self.i > 300: self._open(idx)
        while self.i < idx:
            buf = self.pr.stdout.read(self.w * self.h * 3)
            if len(buf) < self.w * self.h * 3: break                 # past the end: hold the last frame
            self.f = np.frombuffer(buf, np.uint8).reshape(self.h, self.w, 3); self.i += 1
        return self.f
    def close(self):
        if self.pr: self.pr.kill(); self.pr = None
SRC = Pipe(f"{E}/input/camera.mp4", SW, SH, 30)
GR = {}

# ---------------- helpers
def rrect_mask(w, h, r, ss=4):
    """Anti-aliased rounded rectangle (supersampled)."""
    im = Image.new("L", (w * ss, h * ss), 0); ImageDraw.Draw(im).rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=r * ss, fill=255)
    return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
def shadow_alpha(mask_full, layers):
    """Multi-layer drop shadow alpha from a full-frame mask: [(dy, blur_css_px, alpha), ...]; CSS blur radius = 2 sigma."""
    keep = np.ones_like(mask_full)
    for dy, blur, a in layers:
        m = np.roll(mask_full, dy, axis=0); m = cv2.GaussianBlur(m, (0, 0), blur / 2) * a; keep *= 1 - m
    return 1 - keep
def over(dst, rgb, a):
    a = a[..., None] if a.ndim == 2 else a
    return dst * (1 - a) + rgb * a
def ease_out3(p): p = min(max(p, 0.0), 1.0); return 1 - (1 - p) ** 3

# ---------------- B: floating camera window (no keying, no AI cut-out), rounded 80 px, soft wide dark-blue shadow
WX, WY, WW, WH, WR = 60, 1000, 960, 720, 80
CROP = {1: (48, 248, 480), 8: (0, 130, 576)}; CROP_DEF = (0, 105, 576)   # (x, y, w) in source px; h = 0.75 w (4:3, no distortion)
RY0, RY1 = WY - 120, min(H_, WY + WH + 260)                              # working band of the frame for the window
WMASK = np.zeros((H_, W_), np.float32); WMASK[WY:WY + WH, WX:WX + WW] = rrect_mask(WW, WH, WR)
WSH = shadow_alpha(WMASK, [(60, 120, 0.30), (24, 48, 0.18), (4, 10, 0.10)])[RY0:RY1]
WSHC = np.array([0, 30, 80], np.float32)
inner = np.zeros((H_, W_), np.float32); inner[WY + 3:WY + WH - 3, WX + 3:WX + WW - 3] = rrect_mask(WW - 6, WH - 6, WR - 3)
WRIM = np.clip(WMASK - inner, 0, 1)[RY0:RY1] * 0.55                     # thin glass rim
WM = WMASK[RY0:RY1]
def window_layer(canvas, n, idx):
    x, y, w = CROP.get(n, CROP_DEF); h = int(round(w * 0.75))
    win = cv2.resize(SRC.get(idx)[y:y + h, x:x + w], (WW, WH), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    band = canvas[RY0:RY1].astype(np.float32)
    band = over(band, WSHC, WSH)
    full = np.zeros_like(band); full[WY - RY0:WY - RY0 + WH, WX:WX + WW] = win
    band = over(band, full, WM)
    band = over(band, np.float32(255), WRIM)
    canvas[RY0:RY1] = np.clip(band + 0.5, 0, 255).astype(np.uint8)

# ---------------- cover (frame 0 only): pure-white Poppins Bold 110 on translucent blue-tinted glass, soft blue shadow
COVER_LINES = ["Dá pra guardar", "na Irlanda?"]
def apply_cover(canvas):
    S = 2; f = ImageFont.truetype(f"{FONT}/Poppins-Bold.ttf", 110 * S)
    tw = max(f.getlength(l) for l in COVER_LINES) / S; bw = int(round(tw + 2 * 50)); by0, by1 = 262, 603; bh = by1 - by0
    bx0 = (W_ - bw) // 2; r = int(round(0.028 * W_))
    m = np.zeros((H_, W_), np.float32); m[by0:by1, bx0:bx0 + bw] = rrect_mask(bw, bh, r)
    img = canvas.astype(np.float32)
    img = over(img, np.array([0, 40, 120], np.float32), shadow_alpha(m, [(30, 90, 0.30), (10, 28, 0.16)]))
    glass = cv2.GaussianBlur(img, (0, 0), 24)                                         # backdrop blur
    glass = glass * 0.55 + np.array([18, 74, 196], np.float32) * 0.45                 # blue tint (keeps white text legible)
    sheen = np.linspace(0.16, 0.04, H_, dtype=np.float32)[:, None, None]; sheen[:by0] = 0
    glass = glass * (1 - sheen) + 255 * sheen
    img = over(img, glass, m)
    inner = np.zeros((H_, W_), np.float32); inner[by0 + 2:by1 - 2, bx0 + 2:bx0 + bw - 2] = rrect_mask(bw - 4, bh - 4, r - 2)
    img = over(img, np.float32(255), np.clip(m - inner, 0, 1) * 0.5)
    t = Image.new("L", (W_ * S, H_ * S), 0); d = ImageDraw.Draw(t); lh = 128
    y = by0 + (bh - lh * len(COVER_LINES)) / 2 + lh / 2
    for l in COVER_LINES:
        d.text((W_ * S / 2, y * S), l, font=f, fill=255, anchor="mm"); y += lh
    ta = np.asarray(t.resize((W_, H_), Image.LANCZOS)).astype(np.float32) / 255
    img = over(img, np.array([0, 30, 90], np.float32), cv2.GaussianBlur(ta, (0, 0), 6) * 0.22)   # faint legibility shadow
    img = over(img, np.float32(255), ta)
    canvas[:] = np.clip(img + 0.5, 0, 255).astype(np.uint8)

# ---------------- CTA: one elegant glass comment box in x43 y1344 w994 h276; generic avatar, typed word + blinking cursor, publish click
CTA = SEGS[-1]; C0 = CTA["t0"]
CX, CW, CH = 43, 994, 220; CY = 1344 + (276 - CH) // 2; CR = 72
WORD = "Consigo!"; T_IN = (C0 + 0.12, C0 + 0.52); TYPE_T = [C0 + 0.75 + 0.085 * i for i in range(len(WORD))]
CLICK = TYPE_T[-1] + 0.62; PRESS = 0.24
CMASK = rrect_mask(CW, CH, CR)
CSH_FULL = np.zeros((H_, W_), np.float32); CSH_FULL[CY:CY + CH, CX:CX + CW] = CMASK
CSH = shadow_alpha(CSH_FULL, [(60, 120, 0.16), (24, 48, 0.10), (4, 10, 0.06)])
CRIM = np.zeros((CH, CW), np.float32); CRIM[2:-2, 2:-2] = rrect_mask(CW - 4, CH - 4, CR - 2); CRIM = np.clip(CMASK - CRIM, 0, 1)
FT = ImageFont.truetype(f"{FONT}/Poppins-SemiBold.ttf", 54 * 2)
_fg = {}
def cta_fg(t):
    typed = sum(1 for tt in TYPE_T if t >= tt); pc = t - CLICK
    if pc >= 0: cur = False
    elif typed and typed < len(WORD): cur = True
    elif typed == len(WORD) and t - TYPE_T[-1] < 0.25: cur = True
    else: cur = int((t - C0) / 0.53) % 2 == 0
    press = 1 - 0.12 * np.sin(np.pi * min(pc / PRESS, 1)) if 0 <= pc < PRESS else 1.0
    rip = pc / 0.6 if 0 <= pc < 0.6 else None; sent = pc >= PRESS / 2
    key = (typed, cur, round(float(press), 3), None if rip is None else round(rip, 2), sent)
    if key in _fg: return _fg[key]
    S = 2; im = Image.new("RGBA", (CW * S, CH * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); cy = CH // 2
    # generic avatar (no real person, no platform marks)
    ax, ar = 34 + 66, 66
    av = Image.new("RGBA", (2 * ar * S, 2 * ar * S)); ad = ImageDraw.Draw(av)
    for k in range(2 * ar * S):                                                    # cyan -> blue vertical gradient
        u = k / (2 * ar * S); ad.line([(0, k), (2 * ar * S, k)], fill=(int(0 + 47 * u), int(229 - 105 * u), 255, 255))
    ad.ellipse([(ar - 26) * S, 30 * S, (ar + 26) * S, 82 * S], fill=(255, 255, 255, 235))
    ad.ellipse([(ar - 48) * S, 90 * S, (ar + 48) * S, 186 * S], fill=(255, 255, 255, 235))
    cm = Image.new("L", av.size, 0); ImageDraw.Draw(cm).ellipse([0, 0, av.size[0] - 1, av.size[1] - 1], fill=255)
    im.paste(av, ((ax - ar) * S, (cy - ar) * S), cm)
    # input field
    fx0, fx1, fy0, fy1 = 34 + 132 + 26, CW - 34 - 120 - 26, cy - 56, cy + 56
    d.rounded_rectangle([fx0 * S, fy0 * S, fx1 * S, fy1 * S], radius=56 * S, fill=(29, 29, 31, 14), outline=(29, 29, 31, 26), width=2 * S)
    txt = WORD[:typed]; tx = (fx0 + 40) * S
    if txt: d.text((tx, cy * S), txt, font=FT, fill=(29, 29, 31, 255), anchor="lm")
    if cur:
        cx = tx + (FT.getlength(txt) if txt else 0) + 5 * S
        d.rounded_rectangle([cx, (cy - 34) * S, cx + 5 * S, (cy + 34) * S], radius=3 * S, fill=(47, 124, 255, 255))
    # publish button: gradient circle, arrow -> check after the click
    bx, br = CW - 34 - 60, 60
    if rip is not None:
        rr = br * (1 + 0.55 * rip); al = int(120 * (1 - rip))
        d.ellipse([(bx - rr) * S, (cy - rr) * S, (bx + rr) * S, (cy + rr) * S], outline=(0, 200, 255, al), width=5 * S)
    rb = br * press; ready = typed == len(WORD)
    bt = Image.new("RGBA", (2 * br * S, 2 * br * S)); bd = ImageDraw.Draw(bt)
    for k in range(2 * br * S):
        u = k / (2 * br * S)
        col = (52, 199, 89) if sent else (int(0 + 47 * u), int(229 - 105 * u), 255)
        bd.line([(0, k), (2 * br * S, k)], fill=(*col, 255 if (ready or sent) else 110))
    bm = Image.new("L", bt.size, 0); ImageDraw.Draw(bm).ellipse([0, 0, bt.size[0] - 1, bt.size[1] - 1], fill=255)
    bt.putalpha(Image.fromarray(np.minimum(np.asarray(bt.getchannel("A")), np.asarray(bm))))
    bt = bt.resize((max(2, int(2 * rb * S)),) * 2, Image.LANCZOS)
    im.alpha_composite(bt, (int((bx - rb) * S), int((cy - rb) * S)))
    s_ = press; w_ = int(9 * S)
    if sent:
        d.line([((bx - 22 * s_) * S, (cy + 2 * s_) * S), ((bx - 6 * s_) * S, (cy + 18 * s_) * S), ((bx + 24 * s_) * S, (cy - 16 * s_) * S)], fill=(255, 255, 255, 255), width=w_, joint="curve")
    else:
        d.line([(bx * S, (cy + 24 * s_) * S), (bx * S, (cy - 22 * s_) * S)], fill=(255, 255, 255, 255), width=w_)
        d.line([((bx - 20 * s_) * S, (cy - 2 * s_) * S), (bx * S, (cy - 24 * s_) * S), ((bx + 20 * s_) * S, (cy - 2 * s_) * S)], fill=(255, 255, 255, 255), width=w_, joint="curve")
    a = np.asarray(im.resize((CW, CH), Image.LANCZOS)).astype(np.float32)
    _fg[key] = (a[..., :3], a[..., 3] / 255); return _fg[key]
def apply_cta(canvas, t):
    if t < T_IN[0]: return
    p = ease_out3((t - T_IN[0]) / (T_IN[1] - T_IN[0])); dy = int(round(36 * (1 - p)))
    y0 = CY + dy; m0, m1 = max(0, y0 - 140), min(H_, y0 + CH + 160)
    reg = canvas[m0:m1].astype(np.float32)
    shm = np.roll(CSH, dy, axis=0)[m0:m1] * p
    reg = over(reg, np.array([0, 30, 80], np.float32), shm)
    # frosted glass: backdrop blur + saturate 1.6, then 85% white
    win = canvas[max(0, y0 - 60):y0 + CH + 60].astype(np.float32); bl = cv2.GaussianBlur(win, (0, 0), 24)
    lu = bl @ np.array([0.2126, 0.7152, 0.0722], np.float32); bl = np.clip(lu[..., None] + 1.6 * (bl - lu[..., None]), 0, 255)
    bl = bl[y0 - max(0, y0 - 60):][:CH, CX:CX + CW]
    bl = bl * 0.7 + 255 * 0.3                                                      # backdrop brightness (glass scatters light)
    glass = bl * 0.15 + 255 * 0.85
    hl = np.zeros((CH, CW), np.float32); hl[:3] = 0.9                               # inset top highlight
    glass = over(glass, np.float32(255), hl * CMASK)
    fg, fa = cta_fg(t); glass = over(glass, fg, fa)
    gy = y0 - m0; sub = reg[gy:gy + CH, CX:CX + CW]
    sub[:] = over(sub, glass, CMASK * p)
    sub[:] = over(sub, np.float32(255), CRIM * 0.6 * p)
    canvas[m0:m1] = np.clip(reg + 0.5, 0, 255).astype(np.uint8)

# ---------------- per-frame composition
def seg_at(f):
    for s in SEGS:
        if s["f0"] <= f < s["f1"]: return s
    return SEGS[-1]
def compose(f):
    t = f / FPS; s = seg_at(f); L = s["layout"]
    if L == "A":
        canvas = cv2.resize(SRC.get(src_index(t)), (W_, H_), interpolation=cv2.INTER_LANCZOS4)
    else:
        n = s["n"]
        if n not in GR:
            for k in list(GR): GR.pop(k).close()
            GR[n] = Pipe(f"{E}/graphics/out/g{n:02d}_60.mp4", W_, H_, 60)
        canvas = GR[n].get(f - s["f0"]).copy()
        if L == "B": window_layer(canvas, n, src_index(t))
    if s is CTA: apply_cta(canvas, t)
    if f == 0: apply_cover(canvas)
    return canvas

if __name__ == "__main__":
    if ONLY is not None:
        import os; os.makedirs(f"{E}/work/check", exist_ok=True)
        for f in ONLY:
            Image.fromarray(compose(f)).save(f"{E}/work/check/f{f:04d}.png")
        sys.exit(0)
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", str(FPS), "-i", "-",
           "-i", f"{E}/work/master.wav", "-map", "0:v", "-map", "1:a", "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
           "-c:v", "libx264", "-preset", "slow", "-crf", os.environ.get("CRF", "17"),   # CRF 17 keeps the file < 100 MB (GitHub limit)
            "-profile:v", "high", "-pix_fmt", "yuv420p",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart",
           "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-frames:v", str(NF), OUT]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(NF):
        pr.stdin.write(compose(f).tobytes())
        if f % 600 == 0: print("frame", f, flush=True)
    pr.stdin.close(); pr.wait(); print("done", OUT)
