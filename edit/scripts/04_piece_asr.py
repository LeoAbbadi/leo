import json, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss, sys
W = "/home/user/leo/edit/work"; M = "/home/user/leo/edit/models"
x, _ = sf.read(f"{W}/voice_src48.wav"); x16 = ss.resample_poly(x, 1, 3).astype(np.float32)
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx",
    joiner=f"{P}/joiner.int8.onnx", tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)
plan = json.load(open(f"{W}/plan.json")); PK = json.load(open(f"{W}/pk_words.json")); res = {}
for p in plan["pieces"]:
    a, b = p["s"], p["e"] + 0.06
    s = rec.create_stream(); s.accept_waveform(16000, x16[int(a * 16000):int(b * 16000)]); rec.decode_stream(s); r = s.result
    ws = []; cur = None
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith(" ") or cur is None:
            if cur: ws.append(cur)
            cur = [tok.strip(), round(ts + a, 3)]
        else: cur[0] += tok
    if cur: ws.append(cur)
    res[p["k"]] = ws
    if "-q" not in sys.argv: print("P%-3d %7.2f-%7.2f | %s" % (p["k"], p["s"], p["e"], r.text))
json.dump(res, open(f"{W}/pk_pieces.json", "w"), ensure_ascii=False)
