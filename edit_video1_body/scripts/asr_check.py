import numpy as np, soundfile as sf, sherpa_onnx, sys
M="/home/user/leo/edit/models"; T=f"{M}/sherpa-onnx-whisper-turbo"
x,sr=sf.read("clean16.wav"); x=x.astype(np.float32)
for lang in ["pt",""]:
  wr=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{T}/turbo-encoder.int8.onnx",decoder=f"{T}/turbo-decoder.int8.onnx",tokens=f"{T}/turbo-tokens.txt",language=lang,task="transcribe",num_threads=4)
  for a,b in [(26.1,32.0),(27.4,30.0),(19.9,22.9),(1.9,5.7),(7.4,12.4)]:
    s=wr.create_stream(); s.accept_waveform(sr,x[int(a*sr):int(b*sr)]); wr.decode_stream(s); print(lang or "auto",a,b,s.result.text)
