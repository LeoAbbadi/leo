"""Final compositor: camera / split / full-visual layouts, captions, CTA card, cover; pipes to FFmpeg."""
import json, subprocess, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.ndimage import gaussian_filter
E = "/home/user/leo/edit"; W_, H_ = 1080, 1920; FPS = 60
plan = json.load(open(f"{E}/work/plan.json")); caps = json.load(open(f"{E}/work/captions.json"))
gaze = json.load(open(f"{E}/work/gaze.json"))
SEGS = plan["segments"]; PIECES = plan["pieces"]; NF = plan["frames"]; END = plan["END"]
GEO = plan["geometry"]; SC = GEO["scale"]
FONT = f"{E}/graphics/shared/fonts"
ONLY = None if len(sys.argv) < 2 else [int(x) for x in sys.argv[1].split(",")]   # optional frame list for checks
OUT = sys.argv[2] if len(sys.argv) > 2 else f"{E}/final.mp4"

# ---------------- source camera frames + mattes
cap = cv2.VideoCapture(f"{E}/input/camera.mp4"); SRC = []
while True:
    ok, f = cap.read()
    if not ok: break
    SRC.append(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))
NSRC = len(SRC)
MAT = [cv2.imread(f"{E}/work/matte/{i:04d}.png", 0) for i in range(NSRC)]
valid = [i for i, g in enumerate(gaze) if g.get("face")]
BBOX = [gaze[min(valid, key=lambda j: abs(j - i))]["bbox"] for i in range(len(gaze))]   # nearest real detection
def head_top_src(idx, fcx, fw):
    a = MAT[idx]; xa, xb = int(max(0, fcx - 0.5 * fw)), int(min(576, fcx + 0.5 * fw))
    rows = np.where((a[:, xa:xb] > 128).sum(1) > 0.25 * max(1, xb - xa))[0]
    return int(rows[0]) if len(rows) else 0

def piece_at(t):
    k = 0
    for i, p in enumerate(PIECES):
        if t + 1e-9 >= p["V"]: k = i
    return PIECES[k]
def src_index(t):
    p = piece_at(t); st = t - p["O"] + p["s"]
    return min(NSRC - 1, max(0, int(st * 30 + 1e-6))), st
def shot_of(st):
    return "A" if st < 1.87 else "B" if st < 7.40 else "C" if st < 15.10 else "D"

# ---------------- static masks for the split layout
cx0, cy0, cw, ch, cr = -65, 1200, 1210, 864, 200
def superellipse_mask(pad=0, n=5.0):
    Hh, Ww = H_ + 2 * pad, W_ + 2 * pad
    ys, xs = np.mgrid[0:Hh, 0:Ww].astype(np.float32) + 0.5
    xs -= pad; ys -= pad
    x0, y0, x1, y1 = cx0, cy0, cx0 + cw, cy0 + ch
    dx = np.maximum(np.maximum(x0 + cr - xs, xs - (x1 - cr)), 0); dy = np.maximum(np.maximum(y0 + cr - ys, ys - (y1 - cr)), 0)
    corner = (dx > 0) & (dy > 0)
    v = ((dx / cr) ** n + (dy / cr) ** n) ** (1 / n)
    a_corner = np.clip(0.5 + (1 - v) * cr, 0, 1)
    a_edge = np.clip(0.5 + np.minimum.reduce([xs - x0, x1 - xs, ys - y0, y1 - ys]), 0, 1)
    return np.where(corner, np.minimum(a_corner, a_edge), a_edge).astype(np.float32)
CARD = superellipse_mask()
PADM = superellipse_mask(pad=400)
sh = np.zeros((H_, W_), np.float32); keep = np.ones((H_, W_), np.float32)
for dy, blur, a in [(60, 120, 0.16), (24, 48, 0.10), (4, 10, 0.06)]:
    m = np.roll(PADM, dy, axis=0); m = gaussian_filter(m, blur / 2)[400:400 + H_, 400:400 + W_] * a
    keep *= 1 - m
SHADOW = (1 - keep)[..., None]; SHC = np.array([24, 24, 32], np.float32) / 255
VFEATH = np.clip((1240 - (np.arange(H_) + 0.5)) / 40, 0, 1).astype(np.float32)   # 40 px soft edge into the card
VF = np.where(np.arange(H_)[:, None] < 1200, 1.0, VFEATH[:, None] * CARD).astype(np.float32)

# ---------------- graphics readers (60 fps, tmix'ed)
GFILE = {1: "g1", 2: "g2", 4: "g4", 5: "g5", 7: "g7", 8: "g8"}
class GReader:
    def __init__(self, seg):
        self.cap = cv2.VideoCapture(f"{E}/graphics/out/{GFILE[seg]}_60.mp4"); self.i = -1; self.f = None
    def get(self, idx):
        if idx < self.i: self.cap.set(cv2.CAP_PROP_POS_FRAMES, idx); self.i = idx - 1
        while self.i < idx:
            ok, f = self.cap.read(); self.i += 1
            if ok: self.f = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        return self.f
READERS = {}

# ---------------- caption rendering
FB = ImageFont.truetype(f"{FONT}/Poppins-Bold.ttf", 74); FS = ImageFont.truetype(f"{FONT}/InstrumentSerif-Italic.ttf", 74)
CAP_Y = {"B": (941, 1114), "A": (1267, 1536), "C": (1267, 1536), "CTA": (1037, 1306), "TOP": (365, 634)}
def render_caption(words, hl):
    S = 2; pad = 30 * S
    asc_b, desc_b = FB.getmetrics()
    fb = ImageFont.truetype(f"{FONT}/Poppins-Bold.ttf", 74 * S); fs = ImageFont.truetype(f"{FONT}/InstrumentSerif-Italic.ttf", 74 * S)
    sp = fb.getlength(" ")
    widths = [(fs if j in hl else fb).getlength(w) for j, w in enumerate(words)]
    tw = sum(widths) + sp * (len(words) - 1)
    im = Image.new("RGBA", (int(tw + 2 * pad), int((asc_b + desc_b) * S + 2 * pad)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base = pad + asc_b * S; x = pad
    for j, w in enumerate(words):
        f = fs if j in hl else fb; asc = f.getmetrics()[0]
        if j in hl:   # serif accent, bold+italic: synthetic bold via a thin same-colour stroke
            d.text((x, base - asc), w, font=f, fill=(255, 255, 0, 255), stroke_width=10 * S + 2 * S, stroke_fill=(0, 0, 0, 255))
            d.text((x, base - asc), w, font=f, fill=(255, 255, 0, 255), stroke_width=int(1.6 * S), stroke_fill=(255, 255, 0, 255))
        else:
            d.text((x, base - asc), w, font=f, fill=(255, 255, 255, 255), stroke_width=10 * S, stroke_fill=(0, 0, 0, 255))
        x += widths[j] + sp
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255
CAPIMG = [render_caption(c["words"], set(c["hl"])) for c in caps]

def overlay(canvas, rgba, x, y):
    h, w = rgba.shape[:2]; x0, y0 = max(0, x), max(0, y); x1, y1 = min(W_, x + w), min(H_, y + h)
    if x1 <= x0 or y1 <= y0: return
    s = rgba[y0 - y:y1 - y, x0 - x:x1 - x]; a = s[..., 3:4]
    canvas[y0:y1, x0:x1] = canvas[y0:y1, x0:x1] * (1 - a) + s[..., :3] * a

# ---------------- CTA comment card (single comment box, transparent surroundings)
CTA = next(s for s in SEGS if s["n"] == 9)
cta_t = {"in0": CTA["t0"] + 0.10, "in1": CTA["t0"] + 0.45}
LINK_T = next(w["t0"] for w in plan["words"] if w["text"] == "link")
WORD = "link"; TYPE_T = [LINK_T + 0.02 + 0.09 * i for i in range(len(WORD))]
CLICK_T = TYPE_T[-1] + 0.75
def ease_out3(p): p = min(max(p, 0), 1); return 1 - (1 - p) ** 3
_cta_cache = {}
def cta_rgba(t):
    typed = sum(1 for tt in TYPE_T if t >= tt)
    blink_on = True if (typed and t - TYPE_T[min(typed, len(TYPE_T)) - 1] < 0.5) else (int((t - CTA["t0"]) / 0.53) % 2 == 0)
    if t >= CLICK_T: blink_on = False
    pc = (t - CLICK_T)
    press = 1.0 if pc < 0 else (1 - 0.12 * np.sin(np.pi * min(pc / 0.24, 1))) if pc < 0.24 else 1.0
    ripple = None if not (0 <= pc < 0.55) else pc / 0.55
    sent = pc >= 0.24
    key = (typed, blink_on, round(press, 3), None if ripple is None else round(ripple, 3), sent)
    if key in _cta_cache: return _cta_cache[key]
    S = 2; bw, bh = 994, 196; pad = 140
    im = Image.new("RGBA", ((bw + 2 * pad) * S, (bh + 2 * pad) * S), (0, 0, 0, 0))
    # 3-layer shadow
    sh_im = Image.new("L", im.size, 0); shd = ImageDraw.Draw(sh_im)
    layers = Image.new("RGBA", im.size, (0, 0, 0, 0))
    for dy, blur, a in [(60, 120, 0.16), (24, 48, 0.10), (4, 10, 0.06)]:
        m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle([pad * S, (pad + dy) * S, (pad + bw) * S, (pad + bh + dy) * S], radius=bh // 2 * S, fill=int(255 * a))
        m = m.filter(ImageFilter.GaussianBlur(blur / 2 * S))
        col = Image.new("RGBA", im.size, (24, 24, 32, 0)); col.putalpha(m); layers = Image.alpha_composite(layers, col)
    im = Image.alpha_composite(im, layers); d = ImageDraw.Draw(im)
    d.rounded_rectangle([pad * S, pad * S, (pad + bw) * S, (pad + bh) * S], radius=bh // 2 * S, fill=(255, 255, 255, 255))
    # generic avatar
    ax, ay, ar = (pad + 34 + 64) * S, (pad + bh // 2) * S, 64 * S
    d.ellipse([ax - ar, ay - ar, ax + ar, ay + ar], fill=(232, 230, 225, 255))
    d.ellipse([ax - 24 * S, ay - 38 * S, ax + 24 * S, ay + 10 * S], fill=(196, 193, 186, 255))
    d.pieslice([ax - 46 * S, ay + 14 * S, ax + 46 * S, ay + 100 * S], 180, 360, fill=(196, 193, 186, 255))
    # input pill
    ix0, ix1, iy0, iy1 = pad + 190, pad + bw - 200, pad + 38, pad + bh - 38
    d.rounded_rectangle([ix0 * S, iy0 * S, ix1 * S, iy1 * S], radius=60 * S, fill=(243, 243, 240, 255))
    f = ImageFont.truetype(f"{FONT}/Poppins-SemiBold.ttf", 52 * S)
    txt = WORD[:typed]; tx = (ix0 + 34) * S; ty = (pad + bh // 2) * S
    if txt: d.text((tx, ty), txt, font=f, fill=(17, 17, 17, 255), anchor="lm")
    cx = tx + (f.getlength(txt) if txt else 0) + 6 * S
    if blink_on: d.rounded_rectangle([cx, ty - 32 * S, cx + 5 * S, ty + 32 * S], radius=2 * S, fill=(217, 119, 87, 255))
    # publish button
    bx, by, br = (pad + bw - 34 - 64) * S, (pad + bh // 2) * S, 64 * S
    if ripple is not None:
        rr = br * (1 + 0.6 * ripple); al = int(110 * (1 - ripple))
        d.ellipse([bx - rr, by - rr, bx + rr, by + rr], outline=(217, 119, 87, al), width=6 * S)
    rb = br * press
    col = (217, 119, 87, 255) if typed == len(WORD) else (240, 213, 202, 255)
    d.ellipse([bx - rb, by - rb, bx + rb, by + rb], fill=col)
    if sent:
        d.line([(bx - 24 * S, by + 2 * S), (bx - 6 * S, by + 20 * S), (bx + 26 * S, by - 18 * S)], fill=(255, 255, 255, 255), width=11 * S, joint="curve")
    else:   # send arrow
        s_ = press
        d.line([(bx, by + 26 * S * s_), (bx, by - 24 * S * s_)], fill=(255, 255, 255, 255), width=11 * S)
        d.line([(bx - 22 * S * s_, by - 2 * S * s_), (bx, by - 26 * S * s_), (bx + 22 * S * s_, by - 2 * S * s_)], fill=(255, 255, 255, 255), width=11 * S, joint="curve")
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    arr = np.asarray(im).astype(np.float32) / 255
    _cta_cache[key] = arr
    return arr
CTA_X, CTA_Y = 43, 1344 + (276 - 196) // 2

# ---------------- cover (frame 0 only)
def cover_rgba():
    S = 2; f = ImageFont.truetype(f"{FONT}/Poppins-Bold.ttf", 110 * S)
    lines = ["O tamanhinho", "desse body!"]
    tw = max(f.getlength(l) for l in lines) / S; bw = int(tw + 100); by0, by1 = 262, 603; bh = by1 - by0
    bx0 = (W_ - bw) // 2; pad = 160
    im = Image.new("RGBA", (W_ * S, (by1 + pad) * S), (0, 0, 0, 0))
    for dy, blur, a in [(24, 60, 0.14), (6, 16, 0.08)]:
        m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle([bx0 * S, (by0 + dy) * S, (bx0 + bw) * S, (by1 + dy) * S], radius=int(0.028 * bw * S), fill=int(255 * a))
        m = m.filter(ImageFilter.GaussianBlur(blur / 2 * S)); col = Image.new("RGBA", im.size, (24, 24, 32, 0)); col.putalpha(m)
        im = Image.alpha_composite(im, col)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([bx0 * S, by0 * S, (bx0 + bw) * S, by1 * S], radius=int(0.028 * bw * S), fill=(255, 255, 255, 255))
    lh = 128
    y = by0 + (bh - lh * len(lines)) / 2 + lh / 2
    for l in lines:
        d.text((W_ * S / 2, y * S), l, font=f, fill=(0, 0, 0, 255), anchor="mm"); y += lh
    im = im.resize((W_, by1 + pad), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255
COVER = cover_rgba()

# ---------------- per-frame composition
_resA = {}
def cam_full(idx):
    if idx not in _resA:
        _resA.clear(); _resA[idx] = cv2.resize(SRC[idx], (W_, H_), interpolation=cv2.INTER_LANCZOS4).astype(np.float32) / 255
    return _resA[idx]
SW, SH = 1210, int(round(1024 * SC))
def split_layer(canvas, idx, st):
    Y = int(round(GEO["Y_by_shot"][shot_of(st)]))
    big = cv2.resize(SRC[idx], (SW, SH), interpolation=cv2.INTER_LANCZOS4).astype(np.float32) / 255
    mat = cv2.resize(MAT[idx], (SW, SH), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255
    # head band (x) from the face box of the SAME source frame, soft 30 px edges
    bx = BBOX[idx]; fcx = (bx[0] + bx[2]) / 2 * 576; fw = (bx[2] - bx[0]) * 576
    xs = np.arange(SW) / SC
    band = np.clip(np.minimum(xs - (fcx - 0.75 * fw), (fcx + 0.75 * fw) - xs) / 14 + 0.5, 0, 1).astype(np.float32)
    ht = head_top_src(idx, fcx, fw)                                       # nothing above the head (hands, straps) is cut out
    ysrc = np.arange(SH) / SC
    topf = np.clip(np.minimum(ysrc / 10, (ysrc - (ht - 8)) / 6), 0, 1).astype(np.float32)
    # place onto canvas rows 900..1920
    r0 = 900
    sub = np.zeros((H_ - r0, W_, 3), np.float32); suba = np.zeros((H_ - r0, W_), np.float32)
    ys0 = max(r0, Y); ys1 = min(H_, Y + SH)
    xa0 = max(0, cx0); xa1 = min(W_, cx0 + SW)
    sub[ys0 - r0:ys1 - r0, xa0:xa1] = big[ys0 - Y:ys1 - Y, xa0 - cx0:xa1 - cx0]
    suba[ys0 - r0:ys1 - r0, xa0:xa1] = (mat * band[None, :] * topf[:, None])[ys0 - Y:ys1 - Y, xa0 - cx0:xa1 - cx0]
    # keep only the blob connected to the head at the card edge (drops stray finger / strap fragments)
    from scipy.ndimage import label
    top_rows = slice(0, 1200 - r0)
    lab, nlab = label(suba[top_rows] > 0.06)
    if nlab:
        fc = int(cx0 + fcx * SC); half = int(0.5 * fw * SC)
        edge = lab[-1, max(0, fc - half):min(W_, fc + half)]
        keep_ids = np.setdiff1d(np.unique(edge), [0])
        suba[top_rows] *= np.isin(lab, keep_ids)
    reg = canvas[r0:]
    reg[:] = reg * (1 - SHADOW[r0:]) + SHC * SHADOW[r0:]
    cm = CARD[r0:, :, None]
    reg[:] = reg * (1 - cm) + sub * cm
    ca = (suba * VF[r0:, :, 0] if VF.ndim == 3 else suba * VF[r0:])[..., None]
    reg[:] = reg * (1 - ca) + sub * ca

def seg_at(f):
    for s in SEGS:
        if s["f0"] <= f < s["f1"]: return s
    return SEGS[-1]

def compose(f):
    t = f / FPS; s = seg_at(f); L = s["layout"]
    if L == "A":
        idx, st = src_index(t); canvas = cam_full(idx).copy()
    else:
        if s["n"] not in READERS: READERS[s["n"]] = GReader(s["n"])
        canvas = READERS[s["n"]].get(f - s["f0"]).astype(np.float32) / 255
        if L == "B":
            idx, st = src_index(t); split_layer(canvas, idx, st)
    # captions
    pos = "CTA" if s["n"] == 9 else L
    for ci, c in enumerate(caps):
        if c["t0"] - 1e-3 <= t < c["t1"] - 1e-3 and f >= 1:
            img = CAPIMG[ci]; y0, y1 = CAP_Y[pos]
            overlay(canvas, img, (W_ - img.shape[1]) // 2, int((y0 + y1) / 2 - img.shape[0] / 2))
    # CTA card
    if s["n"] == 9 and t >= cta_t["in0"]:
        p = ease_out3((t - cta_t["in0"]) / (cta_t["in1"] - cta_t["in0"]))
        img = cta_rgba(t).copy(); img[..., 3] *= p
        overlay(canvas, img, CTA_X - 140, CTA_Y - 140 + int(round(40 * (1 - p))))
    if f == 0: overlay(canvas, COVER, 0, 0)
    return (np.clip(canvas, 0, 1) * 255 + 0.5).astype(np.uint8)

if ONLY is not None:
    for f in ONLY:
        Image.fromarray(compose(f)).save(f"{E}/work/check/f{f:04d}.png")
    sys.exit(0)

cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W_}x{H_}", "-r", str(FPS), "-i", "-",
       "-i", f"{E}/work/master.wav", "-map", "0:v", "-map", "1:a",
       "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-profile:v", "high", "-pix_fmt", "yuv420p",
       "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart",
       "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-frames:v", str(NF), OUT]
pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for f in range(NF):
    pr.stdin.write(compose(f).tobytes())
    if f % 120 == 0: print("frame", f, flush=True)
pr.stdin.close(); pr.wait(); print("done", OUT)
