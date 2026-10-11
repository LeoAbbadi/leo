import json, sys, numpy as np, soundfile as sf
from scipy.signal import correlate
W = "/home/user/leo/edit/work"
M = "/home/user/leo/edit/models"
cam, sr = sf.read(f"{W}/cam16.wav"); cln, _ = sf.read(f"{W}/clean16.wav")
a = (cam - cam.mean()) / (cam.std() + 1e-9); b = (cln - cln.mean()) / (cln.std() + 1e-9)
c = correlate(a, b, mode="full", method="fft") / len(a)
lags = np.arange(-len(b) + 1, len(a))
i = int(np.argmax(np.abs(c))); peak = abs(c[i])
mask = np.abs(lags - lags[i]) > sr * 0.05
second = np.max(np.abs(c[mask]))
sync = {"lag_samples_16k": int(lags[i]), "offset_ms": 1000 * lags[i] / sr, "peak": float(peak),
        "second_peak": float(second), "peak_ratio": float(peak / second)}
print("SYNC", sync)

import sherpa_onnx
samples = cln.astype(np.float32)
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx",
    joiner=f"{P}/joiner.int8.onnx", tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)
s = rec.create_stream(); s.accept_waveform(sr, samples); rec.decode_stream(s)
r = s.result
print("PARAKEET:", r.text)
toks = list(zip(r.tokens, r.timestamps, getattr(r, "durations", [0]*len(r.tokens)) or [0]*len(r.tokens)))
T = f"{M}/sherpa-onnx-whisper-turbo"
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx", decoder=f"{T}/turbo-decoder.int8.onnx",
    tokens=f"{T}/turbo-tokens.txt", language="pt", task="transcribe", num_threads=4)
# whisper handles <=30 s; split on the silence at ~14.8-15.4 s
texts = []
for a0, a1 in [(0, 15.08), (15.08, len(samples) / sr)]:
    ws = wr.create_stream(); ws.accept_waveform(sr, samples[int(a0*sr):int(a1*sr)]); wr.decode_stream(ws); texts.append(ws.result.text)
print("WHISPER:", " | ".join(texts))
json.dump({"sync": sync, "parakeet_text": r.text, "parakeet_tokens": [[t, float(ts), float(d)] for t, ts, d in toks],
           "whisper_text": texts}, open(f"{W}/asr_raw.json", "w"), ensure_ascii=False, indent=1)
