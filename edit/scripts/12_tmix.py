"""240 fps HyperFrames renders -> 60 fps with 4-frame accumulation (tmix) = shutter motion blur; checks frame counts."""
import json, os, subprocess, sys
E = "/home/user/leo/edit"; plan = json.load(open(f"{E}/work/plan.json"))
for s in plan["segments"]:
    if s["layout"] == "A": continue
    n = s["f1"] - s["f0"]; src = f"{E}/graphics/out/g{s['n']:02d}_240.mp4"; dst = f"{E}/graphics/out/g{s['n']:02d}_60.mp4"
    if not os.path.exists(src) or os.path.exists(f"{E}/graphics/out/.g{s['n']:02d}_240.hf-transaction") : continue
    if os.path.exists(dst) and "-f" not in sys.argv: continue
    n240 = int(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
    if n240 < 4 * n: print(f"g{s['n']:02d}: render incomplete ({n240} < {4*n})"); continue
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\\,4)\\,3)',setpts=N/(60*TB)",
                    "-frames:v", str(n), "-r", "60", "-c:v", "libx264", "-qp", "4", "-pix_fmt", "yuv420p",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", dst], check=True)
    n60 = int(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", dst], capture_output=True, text=True).stdout)
    print(f"g{s['n']:02d}: 240fps {n240} -> 60fps {n60} (expected {n})", "OK" if n60 == n else "MISMATCH")
