"""Voice stem, synthesized SFX / riser / music (NumPy + SciPy) and the master."""
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal as ss
from scipy.ndimage import minimum_filter1d, uniform_filter1d
E = "/home/user/leo/edit"; SR = 48000
plan = json.load(open(f"{E}/work/plan.json")); ev = json.load(open(f"{E}/work/graphic_events.json"))
END = plan["END"]; N = int(round(END * SR)); rng = np.random.default_rng(11); meter = pyln.Meter(SR)
db2a = lambda d: 10 ** (d / 20)
def place(buf, x, t0):
    i = int(round(t0 * SR)); a = max(0, i); b = min(N, i + len(x))
    if b > a: buf[a:b] += x[a - i:b - i]
def norm_peak(x, target_db): return x * (db2a(target_db) / (np.abs(x).max() + 1e-12))
def lp(x, f, o=2): return ss.sosfilt(ss.butter(o, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return ss.sosfilt(ss.butter(o, f, btype="high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return ss.sosfilt(ss.butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)
st = lambda x, pan=0.0: np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], 1)

# ---------------- voice: assembled track (J-cuts, tails), stereo, -14 LUFS integrated
v, _ = sf.read(f"{E}/work/voice_raw.wav"); voice = np.stack([v, v], 1)
voice *= db2a(-14 - meter.integrated_loudness(voice))
# gentle voice leveller (cleaning, before the final -14 LUFS): soft-knee 2.5:1 on a 3 ms RMS detector,
# 1.5 ms look-ahead attack, 90 ms release. Tames shouted words/plosives so the master limiter stays transparent.
def leveller(x, thr_db=-10.0, ratio=2.5, knee=6.0, la_s=0.0015, rel_s=0.09):
    m = x[:, 0]; r = np.sqrt(uniform_filter1d(m * m, size=int(0.003 * SR)) + 1e-12); L = 20 * np.log10(r)
    o = L - thr_db; gr = np.where(o <= -knee / 2, 0.0, np.where(o >= knee / 2, o * (1 - 1 / ratio), (1 - 1 / ratio) * (o + knee / 2) ** 2 / (2 * knee)))
    la = int(la_s * SR); gr = np.maximum.reduce([np.roll(gr, -k) for k in range(0, la + 1, 8)])
    rel = np.exp(-1 / (rel_s * SR)); out = np.empty_like(gr); cur = 0.0
    for i in range(len(gr)):
        cur = gr[i] if gr[i] > cur else gr[i] + (cur - gr[i]) * rel; out[i] = cur
    return x * db2a(-out)[:, None], out
for _ in range(2):
    voice, VGR = leveller(voice); voice *= db2a(-14 - meter.integrated_loudness(voice))
VLEV = {"thr_dbfs_rms3ms": -10.0, "ratio": 2.5, "max_gr_db": round(float(VGR.max()), 2), "pct_samples_gr_over_1db": round(float((VGR > 1).mean() * 100), 2)}
sf.write(f"{E}/stems/voice.wav", voice.astype(np.float32), SR, subtype="FLOAT")
VPEAK = 20 * np.log10(np.abs(voice).max())

# ---------------- UI-style SFX
def click():                         # soft, crystalline
    n = int(0.06 * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.0025) * 0.6 + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.012) * 0.5
    return st(x)
def bubble(f0=1800):                 # short glassy tick
    n = int(0.05 * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.35 * np.exp(-t / 0.01)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.009)
    x[:24] *= np.linspace(0, 1, 24); return x
def impact():                        # soft, muffled
    n = int(0.40 * SR); t = np.arange(n) / SR
    f = 52 + 58 * np.exp(-t / 0.03); body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.10)
    thud = lp(rng.standard_normal(n), 700, 4) * np.exp(-t / 0.016) * 0.3
    x = lp(body + thud, 1500); x[:48] *= np.linspace(0, 1, 48); return st(x)
def chime():                         # delicate, high two-note
    n = int(0.8 * SR); out = np.zeros(n)
    for f0, t0 in [(1760.0, 0.0), (2637.0, 0.075)]:   # A6 -> E7
        i = int(t0 * SR); t = np.arange(n - i) / SR
        out[i:] += (np.sin(2 * np.pi * f0 * t) + 0.12 * np.sin(2 * np.pi * 2 * f0 * t)) * np.exp(-t / 0.22) * np.minimum(1, t / 0.003)
    return st(out)
def whoosh(rise=0.36, fall=0.5, lo=600, hi=3200, pan=(-0.3, 0.3)):
    n = int((rise + fall) * SR); t = np.arange(n) / SR
    env = np.where(t < rise, (t / rise) ** 2.2, (1 - (t - rise) / fall).clip(0) ** 1.6)
    noise = rng.standard_normal(n); out = np.zeros(n); zi = None; blk = 256
    for k in range(0, n, blk):
        pk = np.exp(-(((k + blk / 2) / SR - rise) / 0.22) ** 2); fc = lo + (hi - lo) * pk
        sos = ss.butter(2, [fc / 1.7, min(fc * 1.7, 20000)], btype="band", fs=SR, output="sos")
        if zi is None: zi = ss.sosfilt_zi(sos) * 0
        y, zi = ss.sosfilt(sos, noise[k:k + blk], zi=zi); out[k:k + blk] = y
    out *= env; pp = np.linspace(pan[0], pan[1], n)
    s2 = np.stack([out * np.sqrt(0.5 * (1 - pp)), out * np.sqrt(0.5 * (1 + pp))], 1)
    e = np.convolve(np.abs(s2).max(1) ** 2, np.ones(480) / 480, mode="same")
    return s2, int(np.argmax(e))

sfx = np.zeros((N, 2)); log = []
ticks = {}
for e in ev:
    if e["kind"] == "ticks": ticks.setdefault(e["comp"], []).append(e["t"])
for e in sorted(ev, key=lambda e: e["t"]):
    k, t = e["kind"], e["t"]
    if k == "impact":
        place(sfx, norm_peak(impact(), VPEAK - 10), t); log.append((t, "impacto macio e abafado — chegada de cartão/objeto", VPEAK - 10, e["comp"]))
    elif k == "chime":
        place(sfx, norm_peak(chime(), VPEAK - 10), t); log.append((t, "sinal agudo de duas notas (Lá6→Mi7) — confirmação", VPEAK - 10, e["comp"]))
    elif k == "whoosh":
        x, pk = whoosh(); place(sfx, norm_peak(x, VPEAK - 9), t - pk / SR); log.append((t, "passagem sutil (ruído filtrado) — pico no meio do movimento rápido", VPEAK - 9, e["comp"]))
    elif k == "click":
        place(sfx, norm_peak(click(), VPEAK - 10), t); log.append((t, "clique cristalino — botão pressionado", VPEAK - 10, e["comp"]))
for comp, (t0, t1) in ((c, sorted(v)) for c, v in ticks.items()):
    tt = t0; i = 0
    while tt <= t1 + 1e-6:
        b = bubble(1700 + 260 * ((i * 7) % 5)); place(sfx, norm_peak(st(b, 0.15 * np.sin(i)), VPEAK - 16 - 2.5 * rng.random()), tt)   # peak per channel after panning
        tt += 0.055 + 0.012 * rng.random(); i += 1
    log.append((t0, f"sequência leve de pequenos sons (dados/contagem) {t0:.3f}–{t1:.3f} s", VPEAK - 16, comp))

# ---------------- riser: ends exactly at the hook junction
hook_end = plan["segments"][0]["t1"]; RL = 2.6
n = int(round(RL * SR)); t = np.arange(n) / SR; p = t / RL
f = 40 * (150 / 40) ** (p ** 1.6)
tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
air = np.zeros(n); zi = None; noise = rng.standard_normal(n)
for k in range(0, n, 512):
    sos = ss.butter(2, 120 + 1400 * (k / n) ** 2, btype="low", fs=SR, output="sos")
    if zi is None: zi = ss.sosfilt_zi(sos) * 0
    y, zi = ss.sosfilt(sos, noise[k:k + 512], zi=zi); air[k:k + 512] = y
r = (tone * 0.8 + air * 0.5) * (p ** 2.4); r[-int(0.005 * SR):] *= np.linspace(1, 0, int(0.005 * SR))
riser = np.zeros((N, 2)); place(riser, norm_peak(st(r), VPEAK - 14), hook_end - RL); riser[int(round(hook_end * SR)):] = 0

# ---------------- music: original lo-fi synth / corporate ambient, 105 BPM, D major, first beat on frame 1
BPM = 105; beat = 60 / BPM; t_first = 1 / 60; music = np.zeros((N, 2))
nh = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 62, 64, 69]]   # Dmaj7 Bm7 Gmaj7 Asus4
def ep(chord, dur):                  # warm electric-piano-like pad (sine FM + tremolo), low-passed
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in chord:
        f0 = nh(m); x += np.sin(2 * np.pi * f0 * t + 0.8 * np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.6)) * (0.55 + 0.45 * np.exp(-t / 1.2))
    x *= 1 + 0.08 * np.sin(2 * np.pi * 4.2 * t); x = lp(x, 2600)
    return x * np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.3).clip(0)
def pad(chord, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in chord:
        for d in (-0.06, 0.06): x += ss.sawtooth(2 * np.pi * nh(m) * 2 ** (d / 12) * t + rng.random() * 6) * 0.35
    return lp(lp(x, 900), 1400) * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6).clip(0)
def kick():
    n = int(0.3 * SR); t = np.arange(n) / SR; f = 50 + 60 * np.exp(-t / 0.025)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14); x[:24] *= np.linspace(0, 1, 24); return lp(x, 2000)
def snap():
    n = int(0.18 * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 900, 5000) * np.exp(-t / 0.05) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.3
def hat():
    n = int(0.06 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n), 7500) * np.exp(-t / 0.014)
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f0 = nh(m - 24)
    x = np.tanh(1.3 * (np.sin(2 * np.pi * f0 * t) + 0.2 * np.sin(4 * np.pi * f0 * t))) * np.minimum(1, t / 0.008) * np.exp(-t / 0.5)
    return lp(x, 500)
KK, SN, HH = kick(), snap(), hat()
bars = int(np.ceil((END - t_first) / (4 * beat))) + 1
for b in range(bars):
    tb = t_first + b * 4 * beat; ch = prog[b % 4]; full = b >= 2          # first two bars: keys + pad only
    place(music, st(pad(ch, 4 * beat + 0.6), 0.0) * 0.07, tb)
    for half in (0, 2): place(music, st(ep(ch, 2 * beat), -0.25 if half else 0.25) * 0.09, tb + half * beat)
    for q in range(4):
        t0 = tb + q * beat
        if full:
            if q in (0, 2): place(music, st(KK) * 0.5, t0)
            if q in (1, 3): place(music, st(SN, 0.1) * 0.10, t0)
            place(music, st(bass(ch[0] if q < 3 else ch[1], beat * 0.9)) * 0.22, t0)
        for e8 in (0, 1): place(music, st(HH, 0.35 if e8 else -0.35) * (0.05 if e8 else 0.035), t0 + e8 * beat / 2 + (0.018 if e8 else 0))
music[:int(round(t_first * SR))] = 0
a0 = int(round(t_first * SR)); fi = int(0.005 * SR); music[a0:a0 + fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.8 * SR); music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
music *= db2a(-24 - meter.integrated_loudness(music))

for name, x in [("sfx", sfx), ("riser", riser), ("music", music)]:
    sf.write(f"{E}/stems/{name}.wav", x.astype(np.float32), SR, subtype="FLOAT")

# ---------------- master: plain sum, uniform master gain, transparent true-peak limiter only if needed
mix0 = voice + sfx + riser + music
def tp_env(x):
    up = np.stack([ss.resample_poly(x[:, c], 4, 1) for c in range(2)], 1); a = np.abs(up).max(1)
    return a[:len(x) * 4].reshape(-1, 4).max(1)
def limit(x, thr_db=-1.4, la_s=0.003, rel_s=0.045):
    thr = db2a(thr_db); pk = tp_env(x)
    if not (pk > thr).any(): return x, np.ones(len(x))
    g_req = np.minimum(1, thr / (pk + 1e-12)); la = int(la_s * SR)
    g = uniform_filter1d(minimum_filter1d(g_req, size=2 * la + 1), size=la); g = np.minimum(g, minimum_filter1d(g_req, size=la + 1))
    rel = np.exp(-1 / (rel_s * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel; out[i] = cur
    return x * out[:, None], out
trim = -14 - meter.integrated_loudness(mix0)
for it in range(5):
    mix, gc = limit(mix0 * db2a(trim)); Lm = meter.integrated_loudness(mix)
    if abs(Lm + 14) < 0.05: break
    trim += -14 - Lm
sf.write(f"{E}/work/master.wav", mix.astype(np.float32), SR, subtype="FLOAT")
info = {"trim_db": round(trim, 2), "max_gr_db": round(float(-20 * np.log10(gc.min())), 2), "pct_samples_gr_over_1db": round(float((gc < db2a(-1)).mean() * 100), 2)}
json.dump({"voice_peak_dbfs": round(VPEAK, 2), "sfx": [{"t": round(t, 3), "desc": d, "peak_dbfs": round(p, 2), "comp": c} for t, d, p, c in sorted(log)],
           "riser": {"start": round(hook_end - RL, 4), "end": round(hook_end, 4), "peak_dbfs": round(VPEAK - 14, 2)},
           "music": {"bpm": BPM, "first_beat_s": t_first, "key": "Ré maior (Dmaj7–Bm7–Gmaj7–Asus4)"}, "master": info, "voice_leveller": VLEV},
          open(f"{E}/work/audio_log.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(info), VLEV, "voice peak", round(VPEAK, 2), "sfx events", len(log))
