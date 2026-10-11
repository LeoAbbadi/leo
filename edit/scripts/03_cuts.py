"""Edit decision list -> pieces (RMS-refined), J-cuts, tail fades, assembled voice + output word map."""
import json, re, numpy as np, soundfile as sf
W = "/home/user/leo/edit/work"; SR = 48000; FPS = 60
x, _ = sf.read(f"{W}/voice_src48.wav")
db = np.load(f"{W}/rms_db_norm.npy")                 # 10 ms RMS of the loudness-normalised voice (-14 LUFS)
PK = json.load(open(f"{W}/pk_words.json"))           # [text, start] parakeet (chunk runs)
# kept word ranges (inclusive). Removed ranges are earlier takes / restarts / asides (see report).
KEEP = [(0, 13), (14, 33), (38, 40), (41, 47), (57, 63), (64, 66), (69, 100), (102, 156), (162, 162), (165, 175),
        (176, 178), (182, 189), (200, 219), (220, 227), (228, 237), (241, 243), (244, 249), (254, 261), (264, 283),
        (287, 290), (291, 296), (305, 315), (319, 338), (339, 387), (388, 397), (398, 408), (414, 446), (447, 452),
        (455, 458), (462, 467), (468, 487), (488, 527)]
REMOVED = {"34-37": "quanto que eu ganhei, (autocorreção → 'quanto eu recebi')",
           "48-56": "E agora fechou o primeiro mês de agosto, né? (tomada anterior de 'fechou o primeiro mês…')",
           "67-68": "muito esse mês, (repetição)", "101": "Basicamente. (comentário solto após a tomada)",
           "157-161": "Essas coisas assim, geralmente, né? (comentário após a tomada)", "163-164": "quanto que (reinício)",
           "179-181": "vou botar aqui (aparte)", "190-199": "E eu gastei, o maior gasto foi lazer e porcaria, tá? (tomada anterior)",
           "238-240": "Então assim, ó, (preparação)", "250-253": "essas latinhas de Monster, (repetição)",
           "262-263": "Então assim, (preparação)", "284-286": "vivi muito bem, (repetição)",
           "297-304": "que eu não estou vendo a foto, tá? (aparte)", "316-318": "Gastei pra Paris, (reinício)",
           "409-413": "O que eu quero é. (reinício)", "453-454": "questão de. (reinício)", "459-461": "comer fora, né? (repetição)"}
t = lambda i: PK[i][1]
def quiet_runs(a, b, thr=-35):
    i0, i1 = max(0, int(a * 100)), min(len(db), int(b * 100)); runs = []; s = None
    for i in range(i0, i1):
        if db[i] < thr:
            if s is None: s = i
        elif s is not None: runs.append((s, i)); s = None
    if s is not None: runs.append((s, i1))
    return runs
def boundary(i):
    """split point between word i and i+1: (end of i, start of i+1) in seconds"""
    a = t(i) + 0.12; b = t(i + 1) + 0.35 if i + 1 < len(PK) else len(db) / 100
    runs = quiet_runs(a, b)
    if runs:
        s, e = max(runs, key=lambda r: r[1] - r[0])
        if e - s >= 3: return s / 100, e / 100
    i0, i1 = int(a * 100), int(b * 100); m = i0 + int(np.argmin(db[i0:i1]))
    return m / 100, m / 100
# kept spans in SOURCE seconds (verified per span with Parakeet + Whisper; see probe.py). tight=True: continuous splice, no gap.
KEEP_T = [(0.00, 3.73, "Quanto eu recebi no meu primeiro mês de Irlanda e quanto que eu gastei."),
  (4.33, 8.74, "Pessoal, então, como eu falei, acabou de dar meu primeiro mês aqui de Irlanda e eu vou falar pra vocês"),
  (9.47, 10.12, "quanto eu recebi."), (10.95, 12.96, "Eu cheguei aqui dia 10 de julho."),
  (15.20, 17.58, "Então fechou o primeiro mês totalmente cheio."), (18.01, 18.65, "Bom, eu gastei"),
  (19.60, 30.41, "muito esse mês, mas porque eu viajei pra Paris de última hora, eu comprei bolinho, besteira, isso todos os dias, tá? Então esses gastos não são os gastos se você não se descontrolar."),
  (32.28, 35.72, "Era todo dia a gente na escola, dois, três brownie,"),
  (37.18, 55.78, "na loja de conveniência, café, Monster, energéticos, enfim, Coca-Cola, botei muita comida fora também, porque, infelizmente, eu, como sou novo aqui, às vezes esqueço que a comida aqui estraga rápido, deixei estragar rápido, ou fiquei tão cansado que não quis comer e estragou a comida, sabe?"),
  (59.78, 63.40, "Quanto que eu ganhei e quanto que sobrou nesse mês, tá?"), (64.26, 64.65, "Bom, eu ganhei"),
  (66.15, 68.91, "mais ou menos 3.100 euros nesse mês, tá?"),
  (74.745, 79.52, "Então o maior gasto, tirando aluguel, né? Foi essas porcarias, essas coisas que não são"),
  (80.30, 82.51, "necessárias gastar, que eu gastei."), (82.98, 86.88, "Gente, era todos os dias kebab, hambúrguer."),
  (87.22, 89.61, "Se eu mostrar aqui, ó, tem até um hambúrguer aqui."), (90.98, 91.69, "Olha ali, ó."),
  (92.28, 93.58, "Isso aqui não é do mês,"), (94.66, 96.53, "essas latinhas de Monster é da semana, tá?"),
  (97.89, 106.82, "É um nível de gasto muito, muito alto e desnecessário, tá? Não foi algo controlado, não comprei só o essencial,"),
  (107.61, 108.63, "vivi muito bem mesmo."), (109.11, 111.09, "Gastei mais ou menos, de cabeça,"),
  (112.60, 117.04, "foi 650 e pouco do aluguel, mais a taxa da faxineira."),
  (120.09, 124.97, "Eu fui pra Paris de última hora, então quando eu fui para Paris, eu comprei a passagem de último minuto."),
  (125.51, 136.46, "E tive que pagar três vezes o valor da passagem e gastei bastante em Paris, tá? Eu fui pra Paris pra ver o jogo da FURIA, então é um gasto também que não é pra ter todos os meses, a não ser que você vá viajar todos os meses."),
  (136.98, 139.95, "Gastei com comida, em média, cento e poucos euros, tá?"),
  (140.46, 144.48, "Enfim, aqui tá os gastos, vocês conseguem ver os gastos aqui."),
  (145.94, 156.14, "O tópico que eu quero dizer é: vocês anotam o que vocês gastam aqui? Se sim, vocês acham que dá pra guardar dinheiro? Porque foi isso aqui que sobrou esse mês pra mim."),
  (156.35, 159.60, "E eu me descontrolei financeiramente em"), (161.24, 163.41, "questão de comida fora,"),
  (164.11, 166.00, "comer muito fora, muito fora mesmo."),
  (166.31, 176.00, "Viajei pra outro país pra ver um jogo presencial de esportes. Comprei roupa, fiz gastos burros que não eram necessários."),
  (176.51, 179.45, "E, enfim, o que vocês acham? Vocês acham que esse valor"),
  (179.775, 187.48, "é um bom valor para guardar todo mês? Vocês gostariam de guardar isso? Vocês conseguem guardar isso no Brasil? E aqui, como é que está a situação de vocês?")]
TIGHT_BEFORE = {len(KEEP_T) - 1}                      # splice removing the stutter "é um bom, é um bom valor"
spans = [{"s": a_, "e": b_, "text": tx, "i": i, "w0": i, "w1": i} for i, (a_, b_, tx) in enumerate(KEEP_T)]
# split spans at internal long silences (> 250 ms below -35 dB) -> pieces
pieces = []
for sp in spans:
    cur = sp["s"]
    for rs, re_ in quiet_runs(sp["s"], sp["e"]):
        if (re_ - rs) > 25 and rs / 100 > cur + 0.05 and re_ / 100 < sp["e"] - 0.05:
            pieces.append({"s": cur, "e": rs / 100, "span": sp}); cur = re_ / 100
    pieces.append({"s": cur, "e": sp["e"], "span": sp})
for k, p in enumerate(pieces):
    p["k"] = k
    if p["span"]["i"] in TIGHT_BEFORE and p["s"] == p["span"]["s"]: p["tight"] = True
def floor_time(e, limit):
    i = int(round(e * 100))
    while i < len(db) - 2 and not (db[i] < -48 and db[i + 1] < -48) and i / 100 < limit: i += 1
    return min(i / 100, limit)
GAP, PRE, JC, FADE = 0.120, 0.040, 0.050, 0.170
for k, p in enumerate(pieces):
    if k == 0: p.update(O=0.0, A=0.0, V=0.0)
    else:
        q = pieces[k - 1]
        if p.get("tight"):
            O = q["O"] + (q["e"] - q["s"]); p.update(O=O, A=O, V=round(O * FPS) / FPS)
        else:
            O_raw = q["O"] + (q["e"] - q["s"]) + GAP
            V = round((O_raw - PRE + JC) * FPS) / FPS; p.update(V=V, A=V - JC, O=V - JC + PRE)
for k, p in enumerate(pieces):
    last = k == len(pieces) - 1
    room = 10.0 if last else (pieces[k + 1]["O"] - p["O"]) - (p["e"] - p["s"])
    if not last and pieces[k + 1].get("tight"):
        p["fade"] = 0.008; p["src_end"] = p["e"] + 0.004              # 8 ms crossfade into the splice
    else:
        tf = floor_time(p["e"], p["e"] + room - 0.030)
        p["fade"] = FADE if last else min(FADE, max(0.03, p["e"] + room - tf)); p["src_end"] = tf + p["fade"]
    p["src_start"] = max(0.0, p["s"] - (0 if k == 0 else (0.004 if p.get("tight") else PRE)))
END = pieces[-1]["O"] + (pieces[-1]["src_end"] - pieces[-1]["s"]); END = int(np.ceil(END * FPS - 1e-9)) / FPS
N = int(round(END * SR)); voice = np.zeros(N)
for k, p in enumerate(pieces):
    a = int(round(p["src_start"] * SR)); b = int(round(p["src_end"] * SR)); seg = x[a:b].copy()
    nf = int(round(p["fade"] * SR)); seg[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    if k > 0: ni = int((0.008 if p.get("tight") else 0.003) * SR); seg[:ni] *= np.linspace(0, 1, ni)
    o = int(round((p["O"] - (p["s"] - p["src_start"])) * SR)); voice[o:o + len(seg)] += seg[:max(0, min(len(seg), N - o))]
sf.write(f"{W}/voice_raw.wav", voice.astype(np.float32), SR, subtype="FLOAT")
out = {"END": END, "frames": int(round(END * FPS)), "keep_spans": KEEP_T, "removed": REMOVED,
       "pieces": [{k2: v for k2, v in p.items() if k2 != "span"} | {"span": p["span"]["i"]} for p in pieces]}
json.dump(out, open(f"{W}/plan.json", "w"), indent=1, ensure_ascii=False)
print("pieces", len(pieces), "END", END, "frames", out["frames"], "removed src time", round(len(x) / SR - END, 2))
for p in pieces: print("P%-3d src %7.2f-%7.2f  out %7.3f  fade %3.0fms  span%d%s" % (p["k"], p["s"], p["e"], p["O"], p["fade"] * 1000, p["span"]["i"], " TIGHT" if p.get("tight") else ""))
