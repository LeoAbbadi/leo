# Per-frame gaze metrics with MediaPipe FaceLandmarker blendshapes + head pose.
import cv2, json, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
W = "/home/user/leo/edit/work"
opts = vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path="/home/user/leo/edit/models/face_landmarker.task"),
    output_face_blendshapes=True, output_facial_transformation_matrixes=True, running_mode=vision.RunningMode.VIDEO, num_faces=1)
lm = vision.FaceLandmarker.create_from_options(opts)
cap = cv2.VideoCapture("/home/user/leo/edit/input/camera.mp4")
rows = []; i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB))
    r = lm.detect_for_video(img, int(i * 1000 / 30))
    row = {"f": i, "t": i / 30}
    if r.face_blendshapes:
        b = {c.category_name: c.score for c in r.face_blendshapes[0]}
        m = np.array(r.facial_transformation_matrixes[0])
        R = m[:3, :3]
        yaw = np.degrees(np.arctan2(R[0, 2], R[2, 2])); pitch = np.degrees(np.arcsin(-R[1, 2])); 
        lx = r.face_landmarks[0]
        xs = [p.x for p in lx]; ys = [p.y for p in lx]
        row.update(face=1, yaw=float(yaw), pitch=float(pitch),
            down=(b["eyeLookDownLeft"] + b["eyeLookDownRight"]) / 2, up=(b["eyeLookUpLeft"] + b["eyeLookUpRight"]) / 2,
            # horizontal: left eye in vs out
            hor=((b["eyeLookOutLeft"] - b["eyeLookInLeft"]) + (b["eyeLookInRight"] - b["eyeLookOutRight"])) / 2,
            blink=(b["eyeBlinkLeft"] + b["eyeBlinkRight"]) / 2,
            bbox=[min(xs), min(ys), max(xs), max(ys)])
    else:
        row["face"] = 0
    rows.append(row); i += 1
json.dump(rows, open(f"{W}/gaze.json", "w"))
for r in []:
    if r["f"] % 3 == 0:
        if r["face"]:
            print("%5.2f yaw%6.1f pit%6.1f dn%.2f up%.2f hor%5.2f bl%.2f" % (r["t"], r["yaw"], r["pitch"], r["down"], r["up"], r["hor"], r["blink"]))
        else: print("%5.2f noface" % r["t"])
