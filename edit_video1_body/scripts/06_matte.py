# Robust Video Matting (ResNet50, ONNX) over the whole camera clip; writes 8-bit alpha PNGs per source frame.
import cv2, numpy as np, onnxruntime as ort, os
W = "/home/user/leo/edit/work"; out = f"{W}/matte"; os.makedirs(out, exist_ok=True)
sess = ort.InferenceSession("/home/user/leo/edit/models/rvm_resnet50_fp32.onnx", providers=["CPUExecutionProvider"])
cap = cv2.VideoCapture("/home/user/leo/edit/input/camera.mp4")
rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
dr = np.array([0.4], np.float32); i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    src = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB).astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    fgr, pha, *rec = sess.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
    cv2.imwrite(f"{out}/{i:04d}.png", (pha[0, 0] * 255).clip(0, 255).astype(np.uint8))
    i += 1
    if i % 100 == 0: print(i, flush=True)
print("frames", i)
