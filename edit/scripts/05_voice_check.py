import json, numpy as np, soundfile as sf, sherpa_onnx, scipy.signal as ss
W="/home/user/leo/edit/work"; M="/home/user/leo/edit/models"
plan=json.load(open(f"{W}/plan.json")); v,sr=sf.read(f"{W}/voice_raw.wav")
n=480; m=len(v)//n; db=20*np.log10(np.sqrt((v[:m*n].reshape(m,n)**2).mean(1))+1e-12)
for p in plan["pieces"][1:]:
    q=plan["pieces"][p["k"]-1]; e_out=q["O"]+(q["e"]-q["s"]); i0=int(e_out*100)-30; i1=int(p["O"]*100)+30
    sil=0;best=0
    for i in range(i0,i1):
        sil = sil+1 if db[i] < -35 else 0; best=max(best,sil)
    print("junction P%d->P%d at %.3f: longest <-35dB run = %d ms (image cut %.3f, audio in %.3f)"%(q["k"],p["k"],p["O"],best*10,p["V"],p["A"]))
T=f"{M}/sherpa-onnx-whisper-turbo"
wr=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx",decoder=f"{T}/turbo-decoder.int8.onnx",tokens=f"{T}/turbo-tokens.txt",language="pt",task="transcribe",num_threads=4)
x16=ss.resample_poly(v,1,3).astype(np.float32)
for a,b in [(0,13.80),(13.80,len(x16)/16000)]:
    s=wr.create_stream(); s.accept_waveform(16000,x16[int(a*16000):int(b*16000)]); wr.decode_stream(s); print("%.2f-%.2f:"%(a,b), s.result.text)
