"""Clean voice from the camera track, sync check by cross-correlation (mono 16 kHz), ASR with timestamps."""
import json, subprocess, numpy as np, soundfile as sf, scipy.signal as ss, sherpa_onnx
E = "/home/user/leo/edit"; W = f"{E}/work"; M = f"{E}/models"
run = lambda *a: subprocess.run(list(a), check=True)
run("ffmpeg", "-v", "error", "-y", "-i", f"{E}/input/camera.mp4", "-vn", "-ac", "1", "-ar", "48000", "-c:a", "pcm_f32le", f"{W}/cam48.wav")
run("ffmpeg", "-v", "error", "-y", "-i", f"{W}/cam48.wav", "-af", "highpass=f=70,afftdn=nr=10:nf=-45:tn=1,lowpass=f=16000", "-c:a", "pcm_f32le", f"{W}/clean48_raw.wav")
cam, sr = sf.read(f"{W}/cam48.wav"); cln, _ = sf.read(f"{W}/clean48_raw.wav")
def xcorr(a, b):
    a16 = ss.resample_poly(a, 1, 3); b16 = ss.resample_poly(b, 1, 3)
    a16 = (a16 - a16.mean()) / a16.std(); b16 = (b16 - b16.mean()) / b16.std()
    c = ss.correlate(a16, b16, mode="full", method="fft") / len(a16); lags = np.arange(-len(b16) + 1, len(a16))
    i = int(np.argmax(np.abs(c))); m = np.abs(lags - lags[i]) > 800
    return {"offset_ms": 1000 * lags[i] / 16000, "peak": float(abs(c[i])), "second_peak": float(np.abs(c[m]).max()), "ratio": float(abs(c[i]) / np.abs(c[m]).max())}
sync0 = xcorr(cam, cln)
shift = int(round(-sync0["offset_ms"] / 1000 * sr))            # positive lag => clean is late
clean = np.concatenate([cln[shift:], np.zeros(shift)]) if shift > 0 else np.concatenate([np.zeros(-shift), cln[:len(cln) + shift]])
sf.write(f"{W}/voice_src48.wav", clean.astype(np.float32), sr, subtype="FLOAT")
sync1 = xcorr(cam, clean)
print("SYNC raw", sync0, "\nSYNC compensated", sync1)
x16 = ss.resample_poly(clean, 1, 3).astype(np.float32)
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx",
    joiner=f"{P}/joiner.int8.onnx", tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)
# chunk on silences (<= ~25 s) so both models see manageable windows
n = 480; m = len(clean) // n; db = 20 * np.log10(np.sqrt((clean[:m * n].reshape(m, n) ** 2).mean(1)) + 1e-12)
np.save(f"{W}/rms_db.npy", db)
cuts = [0.0]; t = 0.0; dur = len(clean) / sr
while t + 25 < dur:
    lo, hi = int((t + 12) * 100), int((t + 25) * 100)
    # longest quiet run inside the window
    q = db[lo:hi] < -40; best = (0, lo)
    run_ = 0
    for j, v in enumerate(q):
        run_ = run_ + 1 if v else 0
        if run_ > best[0]: best = (run_, lo + j - run_ // 2)
    t = best[1] / 100; cuts.append(t)
cuts.append(dur)
T = f"{M}/sherpa-onnx-whisper-turbo"
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx", decoder=f"{T}/turbo-decoder.int8.onnx",
    tokens=f"{T}/turbo-tokens.txt", language="pt", task="transcribe", num_threads=4)
chunks = []
for a, b in zip(cuts[:-1], cuts[1:]):
    seg = x16[int(a * 16000):int(b * 16000)]
    s = rec.create_stream(); s.accept_waveform(16000, seg); rec.decode_stream(s); r = s.result
    words = []; cur = None
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith(" ") or cur is None:
            if cur: words.append(cur)
            cur = [tok.strip(), round(ts + a, 3)]
        else: cur[0] += tok
    if cur: words.append(cur)
    ws = wr.create_stream(); ws.accept_waveform(16000, np.concatenate([np.zeros(4000, np.float32), seg, np.zeros(8000, np.float32)])); wr.decode_stream(ws)
    chunks.append({"t0": a, "t1": b, "parakeet": r.text, "whisper": ws.result.text, "words": words})
    print(f"[{a:7.2f}-{b:7.2f}] W: {ws.result.text}\n                  P: {r.text}")
json.dump({"sync_raw": sync0, "sync": sync1, "chunks": chunks}, open(f"{W}/asr_raw.json", "w"), ensure_ascii=False, indent=1)
