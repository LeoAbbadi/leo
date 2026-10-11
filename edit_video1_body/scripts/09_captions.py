"""Caption blocks (1-3 words) from the FINAL voice word timings, with a highlight cadence
of one highlight after every 2-3 normal blocks (never two in a row)."""
import json, re
from PIL import ImageFont
E = "/home/user/leo/edit"
plan = json.load(open(f"{E}/work/plan.json"))
SEGS = plan["segments"]; END = plan["END"]
FB = ImageFont.truetype(f"{E}/graphics/shared/fonts/Poppins-Bold.ttf", 74)
FS = ImageFont.truetype(f"{E}/graphics/shared/fonts/InstrumentSerif-Italic.ttf", 74)

def seg_of(t):
    for s in SEGS:
        if s["t0"] <= t < s["t1"]: return s["n"]
    return SEGS[-1]["n"]
clean = lambda w: re.sub(r"[.,]", "", w)
norm = lambda w: re.sub(r"[^\wà-ú0-9]", "", w.lower())
CAND = {"tamanhinho", "body", "ansiosa", "abrir", "compressão", "justinhos", "menor", "tamanho", "experimentar", "corpo",
        "comprime", "bastante", "36", "alcinha", "regulável", "apertando", "link", "carrinho", "laranja", "várias", "numerações", "comprar"}
PAIRS = {("carrinho", "laranja"), ("menor", "tamanho"), ("várias", "numerações"), ("alcinha", "regulável"), ("comprime", "bastante")}
DANGLE = {"o", "a", "um", "uma", "de", "em", "no", "na", "com", "pra", "e", "que", "porque", "te", "esse", "daqueles"}

W = []
for w in plan["words"]:
    W.append({**w, "seg": seg_of(w["t0"] + 0.10), "disp": clean(w["text"]), "n": norm(w["text"]),
              "stop": w["text"][-1] in ".?", "comma": w["text"].endswith(",")})
nW = len(W)

def width(words, hl):
    x = 0
    for j, w in enumerate(words):
        f = FS if j in hl else FB
        x += f.getlength(w["disp"]) + (FB.getlength(" ") if j else 0)
    return x + 20

# DP over (word index, normals since last highlight)
INF = 1e9; best = {}
def solve(i, g):
    if i == nW: return (0, [])
    key = (i, g)
    if key in best: return best[key]
    res = (INF, [])
    for k in (1, 2, 3):
        blk = W[i:i + k]
        if len(blk) < k or any(b["seg"] != blk[0]["seg"] for b in blk): break
        if any(b["stop"] for b in blk[:-1]): break
        cost = {1: 0.7, 2: 0.0, 3: 0.25}[k]
        dur = (W[i + k]["t0"] if i + k < nW else blk[-1]["t1"]) - blk[0]["t0"]
        if dur < 0.30: cost += 1.6
        elif dur < 0.40: cost += 0.6
        if any(b["comma"] for b in blk[:-1]): cost += 2
        nxt = W[i + k] if i + k < nW else None
        if nxt and (blk[-1]["n"], nxt["n"]) in PAIRS: cost += 3          # never split these word pairs
        if blk[-1]["n"] in DANGLE and nxt and nxt["seg"] == blk[-1]["seg"] and not blk[-1]["stop"]: cost += 3
        # normal block
        if g + 1 <= 3:
            if width(blk, set()) <= 940:
                c, path = solve(i + k, g + 1)
                if c + cost < res[0]: res = (c + cost, [(i, k, ())] + path)
        # highlight block
        hl = tuple(j for j, b in enumerate(blk) if b["n"] in CAND)
        if hl and len(hl) <= 2 and g >= 2:
            if width(blk, set(hl)) <= 940:
                c, path = solve(i + k, 0)
                bonus = 0.3 + (0.5 if len(hl) == 2 and hl[1] == hl[0] + 1 else 0)
                if nxt and nxt["seg"] == blk[0]["seg"] and nxt["n"] in CAND and hl[-1] == k - 1: bonus -= 1.0   # don't split a highlight pair
                if c + cost - bonus < res[0]: res = (c + cost - bonus, [(i, k, hl)] + path)
    best[key] = res
    return res

# Hand-checked grouping: (first word, last word, highlighted word indices). Cadence H n n (n) H ...
GROUPS = [(0, 2, [2]), (3, 4, []), (5, 7, []), (8, 10, []), (11, 12, [12]), (13, 15, []), (16, 17, []),
          (18, 20, [20]), (21, 23, []), (24, 25, []), (26, 28, []), (29, 31, [30]), (32, 33, []), (34, 35, []),
          (36, 38, [38]), (39, 40, []), (41, 42, []), (43, 45, [44, 45]), (46, 48, []), (49, 51, []),
          (52, 54, [54]), (55, 56, []), (57, 59, []), (60, 61, []), (62, 63, [62, 63]), (64, 64, []), (65, 66, []),
          (67, 69, [69]), (70, 71, []), (72, 73, []), (74, 75, [74, 75]), (76, 78, []), (79, 81, []), (82, 83, []),
          (84, 85, [85]), (86, 87, []), (88, 90, []), (91, 92, [92]), (93, 95, []), (96, 97, []), (98, 100, [99, 100]),
          (101, 102, []), (103, 103, []), (104, 106, [104]), (107, 108, []), (109, 110, []), (111, 113, [112, 113])]
path = [(a, b - a + 1, tuple(h - a for h in hl)) for a, b, hl in GROUPS]
assert sum(k for _, k, _ in path) == nW and all(W[i]["seg"] == W[i + k - 1]["seg"] for i, k, _ in path)
blocks = []
for bi, (i, k, hl) in enumerate(path):
    ws = W[i:i + k]; sg = ws[0]["seg"]; S = next(s for s in SEGS if s["n"] == sg)
    t0 = max(ws[0]["t0"], S["t0"]); t0 = max(t0, 1 / 60)
    blocks.append({"words": [w["disp"] for w in ws], "hl": list(hl), "seg": sg, "t0": round(t0, 4),
                   "last_t1": ws[-1]["t1"]})
for bi, b in enumerate(blocks):
    S = next(s for s in SEGS if s["n"] == b["seg"])
    if bi + 1 < len(blocks):
        nb = blocks[bi + 1]
        end = nb["t0"] if nb["seg"] == b["seg"] else S["t1"]
        end = min(end, max(b["last_t1"] + 0.35, b["t0"] + 0.25)) if nb["seg"] == b["seg"] else min(end, b["last_t1"] + 0.6)
    else:
        end = END
    b["t1"] = round(end, 4)
json.dump(blocks, open(f"{E}/work/captions.json", "w"), indent=1, ensure_ascii=False)
seq = "".join("H" if b["hl"] else "n" for b in blocks)
print(seq)
for b in blocks:
    print("%6.3f-%6.3f seg%d %s" % (b["t0"], b["t1"], b["seg"], " ".join(("[" + w + "]") if j in b["hl"] else w for j, w in enumerate(b["words"]))))
