"""Verification of the rendered final.mp4: format, cut frames, camera sync, head/card alignment, sheets, audio."""
import json, subprocess, cv2, numpy as np, soundfile as sf
from PIL import Image, ImageDraw
E = "/home/user/leo/edit"; W = f"{E}/work"
plan = json.load(open(f"{W}/plan.json")); SEGS = plan["segments"]; PIECES = plan["pieces"]; NF = plan["frames"]
rep = {}

# ---- format
pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", f"{E}/final.mp4"]))
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next(s for s in pr["streams"] if s["codec_type"] == "audio")
rep["format"] = {"video": f'{v["codec_name"]} {v["width"]}x{v["height"]} {v["r_frame_rate"]} frames={v["nb_read_frames"]} pix={v["pix_fmt"]} bitrate={int(v.get("bit_rate", 0))//1000} kb/s',
                 "audio": f'{a["codec_name"]} {a["sample_rate"]} Hz ch={a["channels"]} {int(a.get("bit_rate", 0))//1000} kb/s',
                 "duration": pr["format"]["duration"], "END": plan["END"]}

# ---- decode final frames
cap = cv2.VideoCapture(f"{E}/final.mp4"); FR = []
while True:
    ok, f = cap.read()
    if not ok: break
    FR.append(f)
src = cv2.VideoCapture(f"{E}/input/camera.mp4"); SRC = []
while True:
    ok, f = src.read()
    if not ok: break
    SRC.append(f)
rep["decoded_frames"] = len(FR)

def piece_at(t):
    k = 0
    for i, p in enumerate(PIECES):
        if t + 1e-9 >= p["V"]: k = i
    return PIECES[k]
def expected_src(f):
    t = f / 60; p = piece_at(t); return int((t - p["O"] + p["s"]) * 30 + 1e-6), p["k"]
def match_src(f, region):
    """best matching source frame for final frame f within +-6 of expected (A: full frame; B: card window)"""
    exp, k = expected_src(f)
    y0, y1 = region
    tgt = cv2.cvtColor(cv2.resize(FR[f][y0:y1], (108, (y1 - y0) // 10)), cv2.COLOR_BGR2GRAY).astype(np.float32)
    best = None
    for c in range(max(0, exp - 6), min(len(SRC), exp + 7)):
        if region == (0, 1920):
            cand = cv2.resize(SRC[c], (1080, 1920))
        else:
            g = plan["geometry"]; st = c / 30
            Y = int(round(g["Y_by_shot"]["A" if st < 1.87 else "B" if st < 7.40 else "C" if st < 15.10 else "D"]))
            big = cv2.resize(SRC[c], (1210, int(round(1024 * g["scale"]))))
            canvas = np.zeros((1920, 1080, 3), np.uint8); ys0 = max(0, Y); ys1 = min(1920, Y + big.shape[0])
            canvas[ys0:ys1, :] = big[ys0 - Y:ys1 - Y, 65:65 + 1080]
            cand = canvas
        cg = cv2.cvtColor(cv2.resize(cand[y0:y1], (108, (y1 - y0) // 10)), cv2.COLOR_BGR2GRAY).astype(np.float32)
        err = float(np.mean((cg - tgt) ** 2))
        if best is None or err < best[1]: best = (c, err)
    return exp, best[0], best[1]

cutchecks = []
bounds = sorted(set([s["f0"] for s in SEGS[1:]] + [int(round(p["V"] * 60)) for p in PIECES[1:]]))
for b in bounds:
    for f in (b - 1, b):
        s = next(x for x in SEGS if x["f0"] <= f < x["f1"])
        if s["layout"] == "C":
            cutchecks.append({"frame": f, "seg": s["n"], "layout": "C", "check": "graphics (no camera)"}); continue
        region = (0, 1920) if s["layout"] == "A" else (1250, 1900)
        exp, got, err = match_src(f, region)
        cutchecks.append({"frame": f, "seg": s["n"], "layout": s["layout"], "expected_src": exp, "best_src": got, "ok": abs(exp - got) <= 1, "mse": round(err, 1)})
rep["cut_checks"] = cutchecks

# ---- board with both sides of every cut
tiles = []
for b in [s["f0"] for s in SEGS[1:]]:
    for f in (b - 1, b):
        im = Image.fromarray(cv2.cvtColor(FR[f], cv2.COLOR_BGR2RGB)).resize((216, 384)); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 120, 20], fill="black"); d.text((4, 4), f"f{f} {'antes' if f < b else 'depois'}", fill="yellow"); tiles.append(im)
cols = 8; rows = (len(tiles) + cols - 1) // cols; board = Image.new("RGB", (216 * cols, 384 * rows))
for i, im in enumerate(tiles): board.paste(im, ((i % cols) * 216, (i // cols) * 384))
board.save(f"{E}/verificacao/cortes.png")

# ---- full contact sheet (every 0.5 s)
tiles = []
for f in list(range(0, NF, 30)) + [NF - 1]:
    im = Image.fromarray(cv2.cvtColor(FR[f], cv2.COLOR_BGR2RGB)).resize((180, 320)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 70, 16], fill="black"); d.text((3, 3), f"{f/60:.2f}s", fill="yellow"); tiles.append(im)
cols = 10; rows = (len(tiles) + cols - 1) // cols; sheet = Image.new("RGB", (180 * cols, 320 * rows))
for i, im in enumerate(tiles): sheet.paste(im, ((i % cols) * 180, (i // cols) * 320))
sheet.save(f"{E}/verificacao/prancha_completa.png")

# ---- head/card alignment in the fastest head motion of each split segment
gaze = json.load(open(f"{W}/gaze.json"))
_valid = [i for i, g in enumerate(gaze) if g.get("face")]
for i, g in enumerate(gaze):
    if not g.get("face"): g["bbox"] = gaze[min(_valid, key=lambda j: abs(j - i))]["bbox"]
align = []; crops = []
for s in [x for x in SEGS if x["layout"] == "B"]:
    best = None
    for f in range(s["f0"] + 1, s["f1"]):
        e1, _ = expected_src(f); e0, _ = expected_src(f - 1)
        g1, g0 = gaze[min(e1, len(gaze) - 1)], gaze[min(e0, len(gaze) - 1)]
        if g1.get("face") and g0.get("face"):
            mv = abs(g1["bbox"][0] - g0["bbox"][0]) + abs(g1["bbox"][1] - g0["bbox"][1])
            if best is None or mv > best[1]: best = (f, mv)
    for f in (s["f0"], best[0]):
        # seam test: rows just above/below the card edge inside the head column must be continuous
        fr = FR[f].astype(np.float32); bx = gaze[min(expected_src(f)[0], len(gaze) - 1)]["bbox"]
        cx = int(-65 + (bx[0] + bx[2]) / 2 * 576 * plan["geometry"]["scale"]); x0, x1 = max(0, cx - 60), min(1080, cx + 60)
        jump = float(np.abs(fr[1196, x0:x1] - fr[1204, x0:x1]).mean()); ref = float(np.abs(fr[1204, x0:x1] - fr[1212, x0:x1]).mean())
        align.append({"seg": s["n"], "frame": f, "kind": "primeiro quadro" if f == s["f0"] else "movimento mais rápido", "seam_step": round(jump, 1), "inside_step": round(ref, 1)})
        im = Image.fromarray(cv2.cvtColor(FR[f][880:1500], cv2.COLOR_BGR2RGB)).resize((540, 310)); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 200, 16], fill="black"); d.text((3, 3), f"seg{s['n']} f{f} {'1º quadro' if f == s['f0'] else 'mov. rápido'}", fill="yellow"); crops.append(im)
rep["head_alignment"] = align
board = Image.new("RGB", (540 * 2, 310 * ((len(crops) + 1) // 2)))
for i, im in enumerate(crops): board.paste(im, ((i % 2) * 540, (i // 2) * 310))
board.save(f"{E}/verificacao/cabeca_cartao.png")

# ---- audio
def ebu(path):
    out = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = out[out.rfind("Summary:"):]
    I = float(summ.split("I:")[1].split("LUFS")[0]); TP = float(summ.split("Peak:")[1].split("dBFS")[0])
    return {"I_LUFS": I, "TP_dBTP": TP}
rep["loudness"] = {n: ebu(f"{E}/stems/{n}.wav") for n in ["voice", "sfx", "riser", "music"]}
rep["loudness"]["master_wav"] = ebu(f"{W}/master.wav"); rep["loudness"]["final_mp4"] = ebu(f"{E}/final.mp4")
ev = json.load(open(f"{W}/graphic_events.json")); sfx, sr = sf.read(f"{E}/stems/sfx.wav")
env = np.abs(sfx).max(1)
wh = []
for e in [e for e in ev if e["kind"] == "whoosh"]:
    i0, i1 = int((e["t"] - 0.4) * sr), int((e["t"] + 0.4) * sr)
    sm = np.convolve(env[i0:i1] ** 2, np.ones(480) / 480, mode="same")
    wh.append({"motion_mid_s": e["t"], "whoosh_peak_s": round((i0 + int(np.argmax(sm))) / sr, 4)})
rep["whoosh_alignment"] = wh
r, _ = sf.read(f"{E}/stems/riser.wav"); nz = np.where(np.abs(r).max(1) > 1e-5)[0]
rep["riser"] = {"audible_end_s": round((nz[-1] + 1) / sr, 4), "hook_junction_s": round(SEGS[0]["t1"], 4)}
vv, _ = sf.read(f"{E}/stems/voice.wav"); n = 480; m = len(vv) // n
db = 20 * np.log10(np.sqrt((vv[:m * n, 0].reshape(m, n) ** 2).mean(1)) + 1e-12) - 20 * np.log10(10 ** (10.82 / 20))  # back to source scale
junc = []
for p in PIECES[1:]:
    q = PIECES[p["k"] - 1]; e_out = q["O"] + (q["e"] - q["s"])
    i0, i1 = int(e_out * 100) - 2, int(p["O"] * 100) + 2; run = best = 0
    for i in range(i0, i1):
        run = run + 1 if db[i] < -35 else 0; best = max(best, run)
    junc.append({"junction_s": round(p["O"], 3), "silence_ms": best * 10})
rep["junction_silence"] = junc
vend = np.where(np.abs(vv).max(1) > 10 ** (-60 / 20))[0][-1] / sr
rep["voice_last_audible_s"] = round(vend, 3)
json.dump(rep, open(f"{E}/verificacao/verificacao.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(rep, indent=1, ensure_ascii=False))
