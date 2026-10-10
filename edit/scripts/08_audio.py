"""Synthesize sfx / riser / music stems (NumPy + SciPy) and build the master."""
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal as ss
E = "/home/user/leo/edit"; SR = 48000
plan = json.load(open(f"{E}/work/plan.json")); ev = json.load(open(f"{E}/work/graphic_events.json"))
END = plan["END"]; N = int(round(END * SR))
rng = np.random.default_rng(7)
voice, _ = sf.read(f"{E}/stems/voice.wav")
VPEAK = 20 * np.log10(np.abs(voice).max())          # sample peak of the voice stem (dBFS)
db2a = lambda d: 10 ** (d / 20)

def place(buf, x, t0):
    """add stereo clip x (n,2) into buf at time t0 (s); clipped to buffer"""
    i = int(round(t0 * SR)); a = max(0, i); b = min(N, i + len(x))
    if b > a: buf[a:b] += x[a - i:b - i]

def norm_peak(x, target_db):
    return x * (db2a(target_db) / (np.abs(x).max() + 1e-12))

def bp(x, lo, hi, order=2):
    sos = ss.butter(order, [lo, hi], btype="band", fs=SR, output="sos"); return ss.sosfilt(sos, x)
def lp(x, f, order=2):
    sos = ss.butter(order, f, btype="low", fs=SR, output="sos"); return ss.sosfilt(sos, x)
def hp(x, f, order=2):
    sos = ss.butter(order, f, btype="high", fs=SR, output="sos"); return ss.sosfilt(sos, x)

# ---------------------------------------------------------------- SFX
def whoosh(variant, rise=0.36, fall=0.48):
    n = int((rise + fall) * SR); t = np.arange(n) / SR
    env = np.where(t < rise, (t / rise) ** 2.2, (1 - (t - rise) / fall).clip(0) ** 1.6)
    noise = rng.standard_normal(n)
    # time-varying band-pass: process in short blocks with a swept centre frequency
    lo_f, hi_f = {"A": (500, 2600), "B": (800, 3800), "C": (350, 1900)}[variant]
    out = np.zeros(n); blk = 256; zi = None
    for k in range(0, n, blk):
        tc = (k + blk / 2) / SR; p = np.exp(-((tc - rise) / 0.22) ** 2)
        fc = lo_f + (hi_f - lo_f) * p
        sos = ss.butter(2, [fc / 1.7, min(fc * 1.7, 20000)], btype="band", fs=SR, output="sos")
        if zi is None: zi = ss.sosfilt_zi(sos) * 0
        y, zi = ss.sosfilt(sos, noise[k:k + blk], zi=zi); out[k:k + blk] = y
    out *= env
    pan = {"A": (-0.35, 0.35), "B": (0.4, -0.4), "C": (0.0, 0.0)}[variant]
    pp = np.linspace(pan[0], pan[1], n)
    st = np.stack([out * np.sqrt(0.5 * (1 - pp)), out * np.sqrt(0.5 * (1 + pp))], 1)
    # align on the measured energy peak (10 ms window), which the band-pass delays slightly vs. the envelope
    e = np.convolve(np.abs(st).max(1) ** 2, np.ones(480) / 480, mode="same")
    peak_idx = int(np.argmax(e))
    return st, peak_idx

def impact():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 64 * np.exp(-t / 0.035)                     # pitch drop 110 -> 46 Hz
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)
    thud = lp(rng.standard_normal(n), 900, 4) * np.exp(-t / 0.018) * 0.35
    x = lp(body + thud, 1800, 2); x[:48] *= np.linspace(0, 1, 48)
    return np.stack([x, x], 1)

def tick(bright=1.0):
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 2200 * bright, 7000, 2) * np.exp(-t / 0.0035)
    return np.stack([x, x], 1)

def chime():
    n = int(0.9 * SR); out = np.zeros(n)
    for f0, t0 in [(1046.5, 0.0), (1568.0, 0.085)]:      # C6 then G6
        i = int(t0 * SR); t = np.arange(n - i) / SR
        tone = np.sin(2 * np.pi * f0 * t) + 0.18 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t / 0.08)
        out[i:] += tone * np.exp(-t / 0.28) * np.minimum(1, t / 0.004)
    return np.stack([out, out], 1)

sfx = np.zeros((N, 2)); sfx_log = []
wv = iter(["A", "B", "C"])
for e in sorted(ev, key=lambda e: e["t"]):
    k = e["kind"]
    if k == "whoosh":
        v = next(wv); x, pk = whoosh(v); x = norm_peak(x, VPEAK - 9)
        place(sfx, x, e["t"] - pk / SR); sfx_log.append((e["t"], f"passagem (ruído filtrado, variação {v}) — pico no meio do movimento rápido", VPEAK - 9))
    elif k == "impact":
        x = norm_peak(impact(), VPEAK - 10); place(sfx, x, e["t"]); sfx_log.append((e["t"], "impacto abafado — chegada de cartão", VPEAK - 10))
    elif k == "chime":
        x = norm_peak(chime(), VPEAK - 10); place(sfx, x, e["t"]); sfx_log.append((e["t"], "sinal de duas notas (Dó6→Sol6) — confirmação", VPEAK - 10))
ticks = [e["t"] for e in ev if e["kind"] == "ticks"]
if ticks:
    t0, t1 = min(ticks), max(ticks); tt = t0; first = True
    while tt <= t1:
        x = norm_peak(tick(1.0 + 0.15 * rng.random()), VPEAK - 16 - 2.5 * rng.random()); place(sfx, x, tt); tt += 0.045 + 0.01 * rng.random()
    sfx_log.append((t0, f"sequência leve de tiques do zíper ({t0:.3f}–{t1:.3f} s)", VPEAK - 16))

# ---------------------------------------------------------------- riser (ends exactly at the hook junction)
seg1_end = plan["segments"][0]["t1"]; RL = 2.6
n = int(round(RL * SR)); t = np.arange(n) / SR; p = t / RL
f = 42 * (180 / 42) ** (p ** 1.6)
tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
air = np.zeros(n); blk = 512; zi = None
noise = rng.standard_normal(n)
for k in range(0, n, blk):
    fc = 150 + 1600 * (k / n) ** 2
    sos = ss.butter(2, fc, btype="low", fs=SR, output="sos")
    if zi is None: zi = ss.sosfilt_zi(sos) * 0
    y, zi = ss.sosfilt(sos, noise[k:k + blk], zi=zi); air[k:k + blk] = y
r = (tone * 0.8 + air * 0.6) * (p ** 2.4)
r[-int(0.005 * SR):] *= np.linspace(1, 0, int(0.005 * SR))     # 5 ms declick right at the cut
r = norm_peak(np.stack([r * 0.97, r], 1), VPEAK - 14)
riser = np.zeros((N, 2)); place(riser, r, seg1_end - RL)
riser[int(round(seg1_end * SR)):] = 0

# ---------------------------------------------------------------- music: 110 BPM, warm minimal electronic
BPM = 110; beat = 60 / BPM; t_first = 1 / 60                      # first downbeat on frame 1
music = np.zeros((N, 2))
def note_hz(m): return 440 * 2 ** ((m - 69) / 12)
prog = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]   # Fmaj7 Am7 Dm7 Bbmaj7
bars = int(np.ceil((END - t_first) / (4 * beat))) + 1
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t / 0.03); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    x[:24] *= np.linspace(0, 1, 24); return lp(x, 2500)
def hat(open_=False):
    n = int((0.12 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000, 2) * np.exp(-t / (0.04 if open_ else 0.012))
def pad(chord, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in chord:
        for det in (-0.07, 0.07):
            f0 = note_hz(m + 12) * 2 ** (det / 12)
            ph = rng.random() * 2 * np.pi
            x += ss.sawtooth(2 * np.pi * f0 * t + ph) * 0.5
    x = lp(x, 1400, 2); x = lp(x, 2200, 1)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4).clip(0)
    return x * env
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f0 = note_hz(m - 12)
    x = np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(2 * np.pi * 2 * f0 * t)
    x = np.tanh(1.4 * x) * np.minimum(1, t / 0.01) * np.exp(-t / 0.35)
    return lp(x, 600)
def pluck(m, dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR; f0 = note_hz(m + 12)
    x = (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * 3 * f0 * t) * np.exp(-t / 0.05)) * np.exp(-t / 0.12)
    x[:48] *= np.linspace(0, 1, 48); return x
K_, H_, Ho = kick(), hat(), hat(True)
for b in range(bars):
    t_bar = t_first + b * 4 * beat; ch = prog[b % 4]
    pd = pad(ch, 4 * beat + 0.5)
    place(music, np.stack([pd * 0.9, pd], 1) * 0.10, t_bar)
    for q in range(4):
        tb = t_bar + q * beat
        place(music, np.stack([K_, K_], 1) * 0.55, tb)
        place(music, np.stack([H_ * 0.8, H_], 1) * 0.10, tb + beat / 2)
        if q in (1, 3): place(music, np.stack([Ho, Ho * 0.8], 1) * 0.05, tb)
        for e8 in (0, 1):
            bs = bass(ch[0] if (q, e8) != (3, 1) else ch[2], beat / 2)
            place(music, np.stack([bs, bs], 1) * (0.30 if e8 == 0 else 0.18), tb + e8 * beat / 2)
    arp = [ch[0], ch[2], ch[1], ch[3]] * 2
    for i, m in enumerate(arp):                                     # quiet low-register arpeggio, no lead melody
        pl = pluck(m); pan = 0.3 if i % 2 else -0.3
        place(music, np.stack([pl * (1 - pan), pl * (1 + pan)], 1) * 0.035, t_bar + i * beat / 2)
music[:int(round(t_first * SR))] = 0
fi = int(0.005 * SR); a0 = int(round(t_first * SR)); music[a0:a0 + fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(0.8 * SR); music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
meter = pyln.Meter(SR)
music *= db2a(-24 - meter.integrated_loudness(music))                 # one static gain, no automation

# ---------------------------------------------------------------- write stems
for name, x in [("sfx", sfx), ("riser", riser), ("music", music)]:
    sf.write(f"{E}/stems/{name}.wav", x.astype(np.float32), SR, subtype="FLOAT")

# ---------------------------------------------------------------- master: plain sum, then a transparent true-peak limiter only if needed
mix0 = voice + sfx + riser + music
def tp_env(x):
    up = np.stack([ss.resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    a = np.abs(up).max(1)
    return a[:len(x) * 4].reshape(-1, 4).max(1)
from scipy.ndimage import minimum_filter1d, uniform_filter1d
def limit(x, thr_db=-1.4, la_s=0.003, rel_s=0.045):
    thr = db2a(thr_db); pk = tp_env(x)
    if not (pk > thr).any(): return x, np.ones(len(x))
    g_req = np.minimum(1, thr / (pk + 1e-12)); la = int(la_s * SR)
    g = uniform_filter1d(minimum_filter1d(g_req, size=2 * la + 1), size=la)
    g = np.minimum(g, minimum_filter1d(g_req, size=la + 1))
    rel = np.exp(-1 / (rel_s * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        out[i] = cur
    return x * out[:, None], out
trim = -14 - meter.integrated_loudness(mix0)
for it in range(4):                       # master gain chosen so the limited master lands on -14 LUFS
    mix, gcurve = limit(mix0 * db2a(trim))
    Lm = meter.integrated_loudness(mix)
    if abs(Lm + 14) < 0.05: break
    trim += -14 - Lm
lim_info = {"trim_db": round(trim, 2), "limited": bool((gcurve < 0.999).any()),
            "max_gr_db": round(float(-20 * np.log10(gcurve.min())), 2), "pct_samples_limited": round(float((gcurve < 0.999).mean() * 100), 2),
            "pct_samples_gr_over_1db": round(float((gcurve < db2a(-1)).mean() * 100), 2)}
sf.write(f"{E}/work/master.wav", mix.astype(np.float32), SR, subtype="FLOAT")
json.dump({"voice_peak_dbfs": VPEAK, "sfx": [{"t": round(t, 3), "desc": d, "peak_dbfs": round(p, 2)} for t, d, p in sorted(sfx_log)],
           "riser": {"start": round(seg1_end - RL, 4), "end": round(seg1_end, 4), "peak_dbfs": round(VPEAK - 14, 2)},
           "music": {"bpm": BPM, "first_beat_s": t_first}, "master": lim_info}, open(f"{E}/work/audio_log.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(lim_info), "voice peak", round(VPEAK, 2))
