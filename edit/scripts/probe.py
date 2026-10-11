import sys, json, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss
W = "/home/user/leo/edit/work"; M = "/home/user/leo/edit/models"
x, _ = sf.read(f"{W}/voice_src48.wav"); x16 = ss.resample_poly(x, 1, 3).astype(np.float32); db = np.load(f"{W}/rms_db_norm.npy")
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx", joiner=f"{P}/joiner.int8.onnx", tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)
T = f"{M}/sherpa-onnx-whisper-turbo"
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx", decoder=f"{T}/turbo-decoder.int8.onnx", tokens=f"{T}/turbo-tokens.txt", language="pt", task="transcribe", num_threads=4)
def asr(a, b):
    seg = x16[int(a * 16000):int(b * 16000)]
    s = rec.create_stream(); s.accept_waveform(16000, seg); rec.decode_stream(s); r = s.result
    toks = " ".join(f"{t.strip()}@{ts + a:.2f}" for t, ts in zip(r.tokens, r.timestamps) if t.startswith(" ") or True)
    w = wr.create_stream(); w.accept_waveform(16000, np.concatenate([np.zeros(4000, np.float32), seg, np.zeros(8000, np.float32)])); wr.decode_stream(w)
    return r.text, w.result.text, toks
for arg in sys.argv[1:]:
    if arg.startswith("r"):
        a, b = map(float, arg[1:].split(":"))
        prof = "".join("#" if v >= -25 else "=" if v >= -35 else "-" if v >= -45 else "." for v in db[int(a * 100):int(b * 100):2])
        print(f"RMS {a:.2f}-{b:.2f} (20ms/char): {prof}")
    else:
        a, b = map(float, arg.split(":"))
        p, w, toks = asr(a, b); print(f"{a:.2f}-{b:.2f} PK: {p} | WH: {w}\n      tokens: {toks}")
