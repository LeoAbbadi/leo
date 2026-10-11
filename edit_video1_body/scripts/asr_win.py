import numpy as np, soundfile as sf, sherpa_onnx, sys
M="/home/user/leo/edit/models"; T=f"{M}/sherpa-onnx-whisper-turbo"
x,sr=sf.read("voice_src48.wav"); 
import scipy.signal as ss
x=ss.resample_poly(x,1,3).astype(np.float32)
wr=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx",decoder=f"{T}/turbo-decoder.int8.onnx",tokens=f"{T}/turbo-tokens.txt",language="pt",task="transcribe",num_threads=4)
for arg in sys.argv[1:]:
    a,b=map(float,arg.split(":"))
    seg=np.concatenate([np.zeros(4000,np.float32),x[int(a*16000):int(b*16000)],np.zeros(8000,np.float32)])
    s=wr.create_stream(); s.accept_waveform(16000,seg); wr.decode_stream(s); print(f"{a:6.2f}-{b:6.2f}: {s.result.text}")
