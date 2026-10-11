import json, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss
W="/home/user/leo/edit/work"; M="/home/user/leo/edit/models"
x,_=sf.read(f"{W}/voice_src48.wav"); x16=ss.resample_poly(x,1,3).astype(np.float32)
P=f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
rec=sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx",decoder=f"{P}/decoder.int8.onnx",joiner=f"{P}/joiner.int8.onnx",tokens=f"{P}/tokens.txt",model_type="nemo_transducer",num_threads=4)
plan=json.load(open(f"{W}/plan.json"))
res={}
for pad in (0.0, 0.08):
  for p in plan["pieces"]:
    a=max(0,p["s"]-pad); b=p["e"]+0.12
    s=rec.create_stream(); s.accept_waveform(16000,x16[int(a*16000):int(b*16000)]); rec.decode_stream(s); r=s.result
    ws=[];cur=None
    for t,ts in zip(r.tokens,r.timestamps):
        if t.startswith(" ") or cur is None:
            if cur: ws.append(cur)
            cur=[t.strip(),ts+a]
        else: cur[0]+=t
    ws.append(cur)
    res[(pad,p["k"])]=ws
    print(pad,"P%d s=%.2f"%(p["k"],p["s"])," ".join("%s@%.2f"%(w[0],w[1]) for w in ws))
json.dump({f"{k[0]}_{k[1]}":v for k,v in res.items()},open(f"{W}/pk_pieces.json","w"),ensure_ascii=False)
