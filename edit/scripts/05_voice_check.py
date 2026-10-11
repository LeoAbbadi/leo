import json, re, difflib, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss
W = "/home/user/leo/edit/work"; M = "/home/user/leo/edit/models"
plan = json.load(open(f"{W}/plan.json")); g = json.load(open(f"{W}/norm.json"))["gain_db"]
v, sr = sf.read(f"{W}/voice_raw.wav"); n = 480; m = len(v) // n
db = 20 * np.log10(np.sqrt((v[:m * n].reshape(m, n) ** 2).mean(1)) + 1e-12) + g
P = plan["pieces"]; worst = []
for k in range(1, len(P)):
    q, p = P[k - 1], P[k]; e_out = q["O"] + (q["e"] - q["s"]); run = best = 0
    for i in range(int(e_out * 100) - 2, int(p["O"] * 100) + 2):
        run = run + 1 if db[i] < -35 else 0; best = max(best, run)
    worst.append((best * 10, round(p["O"], 2)))
print("junction silence ms: max", max(worst), " >150:", [w for w in worst if w[0] > 150])
T = f"{M}/sherpa-onnx-whisper-turbo"
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx", decoder=f"{T}/turbo-decoder.int8.onnx", tokens=f"{T}/turbo-tokens.txt", language="pt", task="transcribe", num_threads=4)
x16 = ss.resample_poly(v, 1, 3).astype(np.float32)
# chunks at junctions, <= 26 s
cuts = [0.0]
for p in P[1:]:
    if p["O"] - cuts[-1] > 22: cuts.append(p["O"] - 0.06)
cuts.append(len(v) / sr)
hyp = []
for a, b in zip(cuts[:-1], cuts[1:]):
    s = wr.create_stream(); s.accept_waveform(16000, np.concatenate([np.zeros(4000, np.float32), x16[int(a * 16000):int(b * 16000)], np.zeros(8000, np.float32)])); wr.decode_stream(s)
    print(f"[{a:6.1f}-{b:6.1f}] {s.result.text}"); hyp.append(s.result.text)
norm = lambda s: re.sub(r"[^\wà-ú0-9 ]", " ", s.lower()).split()
ref = norm(" ".join(t for _, _, t in plan["keep_spans"])); h = norm(" ".join(hyp))
sm = difflib.SequenceMatcher(a=ref, b=h, autojunk=False)
print("word match ratio %.3f" % sm.ratio())
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != "equal": print(f"  {op}: ref[{' '.join(ref[i1:i2])}] -> hyp[{' '.join(h[j1:j2])}]")
