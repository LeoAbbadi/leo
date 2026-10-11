"""Cut plan + assembled voice track (J-cuts, tail fades), all times in seconds."""
import json, re, numpy as np, soundfile as sf
W = "/home/user/leo/edit/work"; SR = 48000; FPS = 60
x, _ = sf.read(f"{W}/voice_src48.wav")
db = np.load(f"{W}/rms_db.npy")            # 10 ms windows
pk = json.load(open(f"{W}/pk_words.json"))  # parakeet words [text, t0, t1]

# corrected transcript (parakeet index -> caption text); None = drop token (merged)
fix = {2: "tamanhinho", 12: "body", 38: "justinhos", 42: "peguei", 68: "visto", 69: None, 70: None,
       73: "peguei", 78: "e", 101: "carrinho", 103: "pra", 104: "te", 115: "numerações."}
words = []
for i, (t, t0, t1) in enumerate(pk):
    txt = fix.get(i, t)
    if txt is None: continue
    words.append({"i": i, "text": txt, "pk0": t0})

# pieces decided from the -35 dB gap analysis + ASR verification (see report)
# (s, e) = first / last 10 ms window >= -35 dB; word index ranges are parakeet indices
TEXT = ["Olha o tamanhinho disso daqui.",
        "Chegou pra mim aqui em casa esse body e eu tava muito ansiosa. Eu vou abrir junto com vocês.",
        "Ele é um daqueles body de compressão, sabe? Que servem pra ficar realmente bem justinhos no corpo. Eu peguei o menor tamanho e vou experimentar ele com vocês.",
        "E no corpo ele ficou assim, olha, gente. Ele realmente comprime bastante, viu? Olha aqui.",
        "Eu visto 36 e peguei logo o menor tamanho, e ele tem a alcinha regulável, então não",
        "fica apertando nada, tá?",
        "Eu vou deixar o link de onde eu comprei aqui no carrinho laranja pra te conseguir comprar o teu também, porque ele atende a várias numerações."]
P = [(None, None, 0, 0)] * len(TEXT)
gaps = [(1.38, 1.91), (6.77, 7.58), (14.79, 15.38), (19.74, 20.35), (24.76, 25.02), (25.95, 26.25)]
def last_loud_before(t):
    i = int(round(t * 100)) - 1
    while db[i] < -35: i -= 1
    return (i + 1) / 100
def first_loud_after(t):
    i = int(round(t * 100))
    while db[i] < -35: i += 1
    return i / 100
pieces = []
for k, (s, e, w0, w1) in enumerate(P):
    s = 0.0 if k == 0 else first_loud_after(gaps[k - 1][0] + 0.05)
    e = last_loud_before(gaps[k][1] - 0.05) if k < len(gaps) else last_loud_before(31.30)
    pieces.append({"k": k, "s": s, "e": e, "w0": w0, "w1": w1})

def floor_time(e, limit):
    """time after e where the tail reaches the background (<= -48 dB for 2 windows)"""
    i = int(round(e * 100))
    while i < len(db) - 2 and not (db[i] < -48 and db[i + 1] < -48) and i / 100 < limit: i += 1
    return min(i / 100, limit)

GAP = 0.120; PRE = 0.040; JC = 0.050; FADE = 0.170
O = 0.0
for k, p in enumerate(pieces):
    if k == 0:
        p["O"] = 0.0; p["A"] = 0.0; p["V"] = 0.0
    else:
        q = pieces[k - 1]
        O_raw = q["O"] + (q["e"] - q["s"]) + GAP
        V = round((O_raw - PRE + JC) * FPS) / FPS          # image cut on a frame boundary
        p["V"] = V; p["A"] = V - JC; p["O"] = p["A"] + PRE
    p["gap_out_before"] = None if k == 0 else p["O"] - (pieces[k-1]["O"] + pieces[k-1]["e"] - pieces[k-1]["s"])
# tails
for k, p in enumerate(pieces):
    last = k == len(pieces) - 1
    room = 10.0 if last else (pieces[k + 1]["O"] - p["O"]) - (p["e"] - p["s"])   # output time after e until next onset
    tf = floor_time(p["e"], p["e"] + room - 0.030)
    fade = FADE if last else min(FADE, p["e"] + room - tf)
    p["tail_floor"] = tf; p["fade"] = fade; p["src_end"] = tf + fade
    p["src_start"] = max(0.0, p["s"] - (0 if k == 0 else PRE))

# assemble voice
END = pieces[-1]["O"] + (pieces[-1]["src_end"] - pieces[-1]["s"])
END = int(np.ceil(END * FPS - 1e-9)) / FPS
N = int(round(END * SR)); voice = np.zeros(N)
for k, p in enumerate(pieces):
    a = int(round(p["src_start"] * SR)); b = int(round(p["src_end"] * SR))
    seg = x[a:b].copy()
    nf = int(round(p["fade"] * SR)); seg[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    ni = int(0.003 * SR)
    if k > 0: seg[:ni] *= np.linspace(0, 1, ni)            # declick at clip start (inside 40 ms pre-roll)
    o = int(round((p["O"] - (p["s"] - p["src_start"])) * SR))
    voice[o:o + len(seg)] += seg[:max(0, min(len(seg), N - o))]
sf.write(f"{W}/voice_raw.wav", voice.astype(np.float32), SR, subtype="FLOAT")

def src2out(t, p): return p["O"] + (t - p["s"])
# word times: parakeet run per piece (first token = piece onset), aligned to the corrected text
import difflib
pkp = json.load(open(f"{W}/pk_pieces.json"))
norm = lambda w: re.sub(r"[^\wà-ú]", "", w.lower())
out_words = []
for p in pieces:
    mine = TEXT[p["k"]].split(); theirs = pkp[f"0.0_{p['k']}"]
    t = [None] * len(mine)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in mine], b=[norm(w[0]) for w in theirs], autojunk=False)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size): t[blk.a + j] = theirs[blk.b + j][1]
    for op, i1, i2, j1, j2 in sm.get_opcodes():          # replaced words: take times in order
        if op == "replace":
            for q in range(i2 - i1):
                if j1 + q < j2: t[i1 + q] = theirs[j1 + q][1]
    t[0] = p["s"]
    for j in range(len(t)):                               # interpolate gaps
        if t[j] is None:
            nxt = next((t[m] for m in range(j + 1, len(t)) if t[m] is not None), p["e"])
            t[j] = (t[j - 1] + nxt) / 2
    for j in range(1, len(t)): t[j] = min(max(t[j], t[j - 1] + 0.06), p["e"] - 0.08 * (len(t) - j))
    for j, w in enumerate(mine):
        t1 = t[j + 1] if j + 1 < len(t) else p["e"]
        out_words.append({"text": w, "src0": round(t[j], 3), "src1": round(t1, 3),
                          "t0": round(src2out(t[j], p), 3), "t1": round(src2out(t1, p), 3), "piece": p["k"]})
plan = {"END": END, "frames": int(round(END * FPS)), "pieces": pieces, "words": out_words}
json.dump(plan, open(f"{W}/plan.json", "w"), indent=1, ensure_ascii=False)
for p in pieces:
    print("P%d src %.2f-%.2f (end+tail %.3f fade %.0fms) -> out O=%.3f V=%.3f A=%.3f  gap_before=%s" % (p["k"], p["s"], p["e"], p["src_end"], p["fade"]*1000, p["O"], p["V"], p["A"], None if p["gap_out_before"] is None else round(p["gap_out_before"]*1000)))
print("END", END, "frames", plan["frames"])
print(" ".join("%s@%.2f" % (w["text"], w["t0"]) for w in out_words))
