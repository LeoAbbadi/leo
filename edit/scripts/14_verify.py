"""Verification of final.mp4 (video 2): format, both sides of every cut (source-frame match), boards/sheets,
background fluidity, audio (loudness per stem/master/final, SFX & whoosh alignment, riser end, junction silences)."""
import json, os, subprocess, numpy as np, soundfile as sf, cv2
from PIL import Image, ImageDraw
E = "/home/user/leo/edit"; W = f"{E}/work"; V = f"{E}/verificacao"; os.makedirs(V, exist_ok=True)
plan = json.load(open(f"{W}/plan.json")); SEGS = plan["segments"]; PIECES = plan["pieces"]; NF = plan["frames"]
import importlib.util
spec = importlib.util.spec_from_file_location("comp", f"{E}/scripts/13_compose.py"); C = importlib.util.module_from_spec(spec)
import sys; sys.argv = ["x", "-"]; spec.loader.exec_module(C)          # geometry (window, crops) from the compositor itself
DEC = "scale=in_color_matrix=bt709:in_range=tv,format=rgb24"
def frames(path, w, h, keep):
    """stream a video once, return {idx: frame} for idx in keep"""
    pr = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", DEC, "-f", "rawvideo", "-"], stdout=subprocess.PIPE, bufsize=w * h * 3 * 4)
    out = {}; i = 0; mx = max(keep) if keep else -1
    while i <= mx:
        b = pr.stdout.read(w * h * 3)
        if len(b) < w * h * 3: break
        if i in keep: out[i] = np.frombuffer(b, np.uint8).reshape(h, w, 3).copy()
        i += 1
    pr.kill(); return out
rep = {}

# ---- format
pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", f"{E}/final.mp4"]))
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next(s for s in pr["streams"] if s["codec_type"] == "audio")
rep["format"] = {"video": f'{v["codec_name"]} {v["profile"]} {v["width"]}x{v["height"]} {v["r_frame_rate"]} frames={v["nb_read_frames"]} {v["pix_fmt"]} {v.get("color_space")}/{v.get("color_primaries")}/{v.get("color_transfer")} {int(v.get("bit_rate", 0))//1000} kb/s',
                 "audio": f'{a["codec_name"]} {a["sample_rate"]} Hz ch={a["channels"]} ({a.get("channel_layout")}) {int(a.get("bit_rate", 0))//1000} kb/s',
                 "duration_s": float(pr["format"]["duration"]), "END_s": plan["END"], "expected_frames": NF}

# ---- which frames are needed
bounds = sorted(set([s["f0"] for s in SEGS[1:]] + [int(round(p["V"] * 60)) for p in PIECES[1:]]))
check_f = sorted(set(f for b in bounds for f in (b - 1, b)))
sheet_f = list(range(0, NF, 30)) + [NF - 1]
seg_of = lambda f: next(s for s in SEGS if s["f0"] <= f < s["f1"])
bg_f = [f for f in range(NF) if seg_of(f)["layout"] != "A"]
need_src = set(); need_g = {}
for f in check_f:
    s = seg_of(f)
    if s["layout"] in "AB":
        e = C.src_index(f / 60); need_src |= set(range(max(0, e - 6), e + 7))
    else:
        need_g.setdefault(s["n"], set()).update({f - s["f0"] - 1, f - s["f0"], f - s["f0"] + 1})
# stream final once: keep full frames for checks/sheets, background patches for every graphics frame
keepF = set(check_f) | set(sheet_f) | {s["f0"] for s in SEGS}
pr = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{E}/final.mp4", "-vf", DEC, "-f", "rawvideo", "-"], stdout=subprocess.PIPE, bufsize=1080 * 1920 * 12)
FR = {}; BG = {}; nfr = 0; bgset = set(bg_f)
while True:
    b = pr.stdout.read(1080 * 1920 * 3)
    if len(b) < 1080 * 1920 * 3: break
    fr = np.frombuffer(b, np.uint8).reshape(1920, 1080, 3)
    if nfr in keepF: FR[nfr] = fr.copy()
    if nfr in bgset: BG[nfr] = fr[4:36].reshape(-1, 3).mean(0)
    nfr += 1
rep["decoded_frames"] = nfr
SRC = frames(f"{E}/input/camera.mp4", 576, 1024, need_src)
GF = {n: frames(f"{E}/graphics/out/g{n:02d}_60.mp4", 1080, 1920, ks) for n, ks in need_g.items()}

def small(img, w, h): return cv2.cvtColor(cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA), cv2.COLOR_RGB2GRAY).astype(np.float32)
cut = []
for f in check_f:
    s = seg_of(f); L = s["layout"]; side = "antes" if (f + 1) in bounds else "depois"
    if L == "C":
        k = f - s["f0"]; tgt = small(FR[f], 108, 192)
        errs = {d: float(np.mean((small(GF[s["n"]][k + d], 108, 192) - tgt) ** 2)) for d in (-1, 0, 1) if (k + d) in GF[s["n"]]}
        best = min(errs, key=errs.get)
        cut.append({"frame": f, "lado": side, "seg": s["n"], "layout": L, "esperado": f"g{s['n']:02d}#{k}", "melhor": f"g{s['n']:02d}#{k + best}", "ok": best == 0, "mse": round(errs[0], 2)})
        continue
    e = C.src_index(f / 60)
    if L == "A": tgt = small(FR[f], 108, 192)
    else: tgt = small(FR[f][C.WY + 20:C.WY + C.WH - 20, C.WX + 20:C.WX + C.WW - 20], 92, 68)
    errs = {}
    for c in range(max(0, e - 6), e + 7):
        if c not in SRC: continue
        if L == "A": cand = small(SRC[c], 108, 192)
        else:
            x, y, w = C.CROP.get(s["n"], C.CROP_DEF); h = int(round(w * 0.75))
            win = cv2.resize(SRC[c][y:y + h, x:x + w], (C.WW, C.WH), interpolation=cv2.INTER_AREA)
            cand = small(win[20:-20, 20:-20], 92, 68)
        errs[c] = float(np.mean((cand - tgt) ** 2))
    best = min(errs, key=errs.get)
    # identical neighbours (frozen source frames) are equivalent matches
    ok = abs(best - e) <= 1 or errs[e] - errs[best] < 1.0
    cut.append({"frame": f, "lado": side, "seg": s["n"], "layout": L, "esperado": e, "melhor": best, "ok": bool(ok), "mse": round(errs[e], 2)})
rep["cut_checks"] = {"n": len(cut), "ok": sum(c["ok"] for c in cut), "falhas": [c for c in cut if not c["ok"]], "todos": cut}

# ---- board: both sides of every layout cut
tiles = []
for s in SEGS[1:]:
    for f in (s["f0"] - 1, s["f0"]):
        im = Image.fromarray(FR[f]).resize((216, 384)); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 150, 20], fill="black"); d.text((4, 4), f"f{f} {'antes' if f < s['f0'] else 'depois'} s{s['n']}{s['layout']}", fill="yellow"); tiles.append(im)
cols = 8; board = Image.new("RGB", (216 * cols, 384 * ((len(tiles) + cols - 1) // cols)))
for i, im in enumerate(tiles): board.paste(im, ((i % cols) * 216, (i // cols) * 384))
board.save(f"{V}/cortes.png")
# ---- full contact sheet (every 0.5 s), first frame of every segment
tiles = []
for f in sheet_f:
    im = Image.fromarray(FR[f]).resize((180, 320)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 92, 16], fill="black"); d.text((3, 3), f"{f/60:.2f}s s{seg_of(f)['n']}", fill="yellow"); tiles.append(im)
cols = 12; sheet = Image.new("RGB", (180 * cols, 320 * ((len(tiles) + cols - 1) // cols)))
for i, im in enumerate(tiles): sheet.paste(im, ((i % cols) * 180, (i // cols) * 320))
sheet.save(f"{V}/prancha_completa.png")
tiles = [Image.fromarray(FR[s["f0"]]).resize((270, 480)) for s in SEGS]
sheet = Image.new("RGB", (270 * 9, 480 * 4))
for i, im in enumerate(tiles): sheet.paste(im, ((i % 9) * 270, (i // 9) * 480))
sheet.save(f"{V}/primeiros_quadros.png")
Image.fromarray(FR[0]).save(f"{V}/capa_quadro0.png")

# ---- background fluidity: per-frame change of the background-only strip at the top (y 4-36, above all content)
d_in, d_cut = [], []
for f in bg_f:
    if f - 1 in BG:
        dd = float(np.abs(BG[f] - BG[f - 1]).max())
        (d_cut if seg_of(f)["f0"] == f else d_in).append((dd, f))
rep["background"] = {"max_step_within_segments_rgb": round(max(d_in)[0], 3), "mean_step_within_segments_rgb": round(float(np.mean([x[0] for x in d_in])), 4),
                     "frame_of_max": max(d_in)[1], "steps_at_B_C_cuts": [{"frame": f, "step": round(dd, 3)} for dd, f in d_cut]}

# ---- audio
def ebu(path):
    out = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = out[out.rfind("Summary:"):]
    return {"I_LUFS": float(summ.split("I:")[1].split("LUFS")[0]), "LRA_LU": float(summ.split("LRA:")[1].split("LU")[0]), "TP_dBTP": float(summ.split("Peak:")[1].split("dBFS")[0])}
rep["loudness"] = {n: ebu(f"{E}/stems/{n}.wav") for n in ["voice", "sfx", "riser", "music"]}
rep["loudness"]["master_wav"] = ebu(f"{W}/master.wav"); rep["loudness"]["final_mp4"] = ebu(f"{E}/final.mp4")
alog = json.load(open(f"{W}/audio_log.json")); sfx, sr = sf.read(f"{E}/stems/sfx.wav"); env = np.abs(sfx).max(1)
vpk = alog["voice_peak_dbfs"]; al = []
for e in alog["sfx"]:
    i0, i1 = int((e["t"] - 0.45) * sr), int((e["t"] + 0.45) * sr); seg = env[i0:i1]
    if "whoosh" in e["desc"]:
        sm = np.convolve(seg ** 2, np.ones(480) / 480, mode="same"); m = (i0 + int(np.argmax(sm))) / sr
        al.append({"t": e["t"], "tipo": e["desc"], "medido": "pico de energia", "medido_s": round(m, 4), "erro_ms": round((m - e["t"]) * 1000, 1), "rel_voz_db": round(e["peak_dbfs"] - vpk, 1)})
    else:
        thr = 10 ** ((e["peak_dbfs"] - 30) / 20); on = np.where(seg[int(0.40 * sr):] > thr)[0]
        m = (i0 + int(0.40 * sr) + int(on[0])) / sr if len(on) else None
        al.append({"t": e["t"], "tipo": e["desc"], "medido": "início", "medido_s": None if m is None else round(m, 4), "erro_ms": None if m is None else round((m - e["t"]) * 1000, 1), "rel_voz_db": round(e["peak_dbfs"] - vpk, 1)})
rep["sfx_alignment"] = al
r, _ = sf.read(f"{E}/stems/riser.wav"); nz = np.where(np.abs(r).max(1) > 10 ** (-80 / 20))[0]
rep["riser"] = {"start_s": round(nz[0] / sr, 4), "audible_end_s": round((nz[-1] + 1) / sr, 4), "hook_junction_s": round(SEGS[0]["t1"], 4),
                "peak_rel_voice_db": round(20 * np.log10(np.abs(r).max()) - vpk, 1)}
mu, _ = sf.read(f"{E}/stems/music.wav"); nz = np.where(np.abs(mu).max(1) > 10 ** (-80 / 20))[0]
rep["music"] = {"first_audible_s": round(nz[0] / sr, 4), "frame1_s": round(1 / 60, 4), "last_audible_s": round((nz[-1] + 1) / sr, 4), "END_s": plan["END"]}
g = json.load(open(f"{W}/norm.json"))["gain_db"]; vr, _ = sf.read(f"{W}/voice_raw.wav"); n = 480; m = len(vr) // n
db = 20 * np.log10(np.sqrt((vr[:m * n].reshape(m, n) ** 2).mean(1)) + 1e-12) + g
junc = []
for k in range(1, len(PIECES)):
    q, p = PIECES[k - 1], PIECES[k]; e_out = q["O"] + (q["e"] - q["s"]); run = best = 0
    for i in range(int(e_out * 100) - 2, int(p["O"] * 100) + 2):
        run = run + 1 if db[i] < -35 else 0; best = max(best, run)
    junc.append({"junction_s": round(p["O"], 3), "silence_ms": best * 10})
rep["junction_silence"] = {"max_ms": max(j["silence_ms"] for j in junc), "over_150": [j for j in junc if j["silence_ms"] > 150], "all": junc}
vv, _ = sf.read(f"{E}/stems/voice.wav"); rep["voice_last_audible_s"] = round(np.where(np.abs(vv).max(1) > 10 ** (-60 / 20))[0][-1] / sr, 3)
json.dump(rep, open(f"{V}/verificacao.json", "w"), indent=1, ensure_ascii=False)
short = {k: v for k, v in rep.items() if k not in ("cut_checks", "junction_silence", "sfx_alignment")}
short["cut_checks"] = {k: rep["cut_checks"][k] for k in ("n", "ok", "falhas")}
short["junction_silence"] = {k: rep["junction_silence"][k] for k in ("max_ms", "over_150")}
short["sfx_alignment_max_abs_err_ms"] = max(abs(x["erro_ms"]) for x in al if x["erro_ms"] is not None)
print(json.dumps(short, indent=1, ensure_ascii=False))
