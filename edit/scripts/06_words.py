"""Output-timeline word timings: per-piece Parakeet tokens aligned to the corrected span texts."""
import json, re, difflib
W = "/home/user/leo/edit/work"
plan = json.load(open(f"{W}/plan.json")); pk = json.load(open(f"{W}/pk_pieces.json"))
norm = lambda w: re.sub(r"[^\wà-ú0-9]", "", w.lower())
words = []
for si, (s0, s1, text) in enumerate(plan["keep_spans"]):
    ps = [p for p in plan["pieces"] if p["span"] == si]
    toks = []                                   # (word, src time, piece)
    for p in ps:
        for w, t in pk[str(p["k"])]:
            if norm(w): toks.append((w, max(t, p["s"]), p))
    mine = text.split(); tt = [None] * len(mine); tp = [None] * len(mine)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in mine], b=[norm(w[0]) for w in toks], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op in ("equal", "replace"):
            for q in range(min(i2 - i1, j2 - j1)): tt[i1 + q] = toks[j1 + q][1]; tp[i1 + q] = toks[j1 + q][2]
    tt[0] = ps[0]["s"]; tp[0] = ps[0]
    for j in range(len(tt)):
        if tt[j] is None:
            nxt = next((tt[m] for m in range(j + 1, len(tt)) if tt[m] is not None), ps[-1]["e"])
            tt[j] = (tt[j - 1] + nxt) / 2
    for j in range(1, len(tt)): tt[j] = max(tt[j], tt[j - 1] + 0.05)
    for j, w in enumerate(mine):
        t = tt[j]; p = next((p for p in ps if p["s"] - 0.02 <= t <= p["e"] + 0.02), min(ps, key=lambda p: min(abs(t - p["s"]), abs(t - p["e"]))))
        t = min(max(t, p["s"]), p["e"] - 0.04)
        words.append({"text": w, "span": si, "piece": p["k"], "src": round(t, 3), "t0": round(p["O"] + (t - p["s"]), 3)})
for i, w in enumerate(words):
    nxt = words[i + 1]["t0"] if i + 1 < len(words) else plan["END"]
    p = next(p for p in plan["pieces"] if p["k"] == w["piece"]); pend = p["O"] + (p["e"] - p["s"])
    w["t1"] = round(min(nxt, pend), 3)
plan["words"] = words
json.dump(plan, open(f"{W}/plan.json", "w"), indent=1, ensure_ascii=False)
print(len(words), "words"); print(" ".join(f"{i}:{w['text']}@{w['t0']:.2f}" for i, w in enumerate(words)))
