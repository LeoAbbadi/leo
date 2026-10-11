"""Generate one HyperFrames composition (standalone project) per B/C segment — Liquid Glass direction."""
import json, os, shutil, importlib.util
E = "/home/user/leo/edit"; G = f"{E}/graphics"
spec = importlib.util.spec_from_file_location("icons", f"{E}/scripts/08_icons.py"); ic = importlib.util.module_from_spec(spec); spec.loader.exec_module(ic)
icon, can = ic.icon, ic.can
plan = json.load(open(f"{E}/work/plan.json")); SEG = {s["n"]: s for s in plan["segments"]}; WD = plan["words"]
def wt(i, n): return round(WD[i]["t0"] - SEG[n]["t0"], 3)

HEAD = """<!doctype html>
<html lang="pt-BR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>__ID__</title><script src="gsap.min.js"></script><script src="scene.js"></script>
<style>
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-Regular.ttf") format("truetype"); font-weight: 400; }
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-SemiBold.ttf") format("truetype"); font-weight: 600; }
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-Bold.ttf") format("truetype"); font-weight: 700; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: #4C9EFF; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Poppins", sans-serif; color: #1D1D1F; }
#bgfx { position: absolute; inset: 0; }
.stage { position: absolute; inset: 0; }
#world { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
.glass { position: absolute; background: rgba(255,255,255,0.85); -webkit-backdrop-filter: blur(24px) saturate(1.6); backdrop-filter: blur(24px) saturate(1.6);
  border: 1.5px solid rgba(255,255,255,0.95); overflow: hidden;
  box-shadow: 0 60px 120px rgba(0,30,80,0.16), 0 24px 48px rgba(0,30,80,0.10), 0 4px 10px rgba(0,30,80,0.06), inset 0 1px 0 rgba(255,255,255,1); }
.t-title { font-size: 96px; font-weight: 700; line-height: 1.02; letter-spacing: -0.02em; }
.t-sub { font-size: 52px; font-weight: 700; line-height: 1.12; letter-spacing: -0.01em; }
.t-body { font-size: 30px; font-weight: 400; line-height: 1.3; }
.t-white { color: #FFFFFF; text-shadow: 0 2px 12px rgba(0,30,80,0.25); }
.abs { position: absolute; }
.row { display: flex; align-items: center; }
.chip { position: absolute; display: flex; align-items: center; gap: 14px; padding: 10px 22px; border-radius: 40px; background: rgba(0,229,255,0.16); color: #1D1D1F; font-size: 30px; font-weight: 600; }
.cyanbar { background: #00E5FF; border-radius: 12px; }
__CSS__
</style></head>
<body>
<div id="root" data-composition-id="__ID__" data-start="0" data-width="1080" data-height="1920" data-duration="__DUR__" data-fps="240">
  <svg width="0" height="0" style="position:absolute"><filter id="mb" filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000" color-interpolation-filters="sRGB"><feGaussianBlur id="mbg" stdDeviation="0 0" /></filter></svg>
  <div id="bgfx"></div>
__PRE__
  <div class="stage"><div id="world">
__WORLD__
  </div></div>
__POST__
</div>
<script>
(function () {
  const { K, camFor, setBlur, money, place, Scene } = window.HF;
  const $ = (id) => document.getElementById(id);
  const A = [540, 960], id0 = [540, 960, 1];
__JS__
  const tl = Scene({ id: "__ID__", t0: __T0__, duration: __DUR__, anchor: A, cam: cam, update: update });
  window.__timelines["__ID__"] = tl;
})();
</script>
</body></html>
"""
R = {"media": 32, "doc": 40, "block": 72, "phone": 84}
def glass(id_, x, y, w, h, kind, inner="", style=""):
    return f'<div id="{id_}" class="glass" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;border-radius:{R[kind]}px;{style}">{inner}</div>'
def at(x, y, inner, id_="", style=""):
    return f'<div {"id=%s" % chr(34) + id_ + chr(34) if id_ else ""} class="abs" style="left:{x}px;top:{y}px;{style}">{inner}</div>'

C = {}
def comp(n, css="", world="", js="", events=None, pre="", post=""):
    C[n] = dict(css=css, world=world, js=js, events=events or {}, pre=pre, post=post)

# ---------------------------------------------------------------- 1 · hook (B)
n = 1; D = SEG[n]["t1"] - SEG[n]["t0"]; tg = wt(13, n)
def money_card(id_, x, label, ic_):
    return glass(id_, x, 650, 410, 230, "doc", at(30, 40, icon(ic_, 110), id_ + "i") + at(160, 46, f'<div class="t-sub">{label}</div>') + at(162, 122, '<div class="t-body" style="opacity:.7">1º mês · Irlanda</div>'))
comp(n, world=money_card("cIn", 110, "Recebi", "in") + money_card("cOut", 560, "Gastei", "out"), js=f"""
  const D = {D:.4f}, tg = {tg};
  const cP = camFor([540, 765], [540, 470], 1.10, A), cG = camFor([765, 765], [540, 470], 1.6, A);
  const cam = K([[0, id0], [0.25, id0], [1.65, cP, "power2.inOut"], [tg - 0.25, cP], [tg + 0.25, cG, "power3.inOut"]]);
  const pIn = K([[0, 1], [{wt(2, n)}, 1], [{wt(2, n)} + 0.18, 1.14, "power2.out"], [{wt(2, n)} + 0.5, 1, "power2.inOut"]]);
  const pOut = K([[0, 1], [tg, 1], [tg + 0.18, 1.14, "power2.out"], [tg + 0.5, 1, "power2.inOut"]]);
  const dof = K([[0, 0], [tg - 0.25, 0], [tg + 0.25, 9, "power2.inOut"]]), dofo = K([[0, 1], [tg - 0.25, 1], [tg + 0.25, 0.4, "power2.inOut"]]);
  const a = $("cIn"), b = $("cOut"), ai = $("cIni"), bi = $("cOuti");
  function update(t) {{ place(ai, {{ s: pIn(t) }}); place(bi, {{ s: pOut(t) }}); setBlur(a, dof(t)); a.style.opacity = dofo(t); }}
""")

# ---------------------------------------------------------------- 3 · calendar (C)
n = 3; D = SEG[n]["t1"] - SEG[n]["t0"]
def month_grid(id_, first_col, ndays, mark=None):
    cells = []
    for d in range(1, ndays + 1):
        k = first_col + d - 1; r, c = divmod(k, 7)
        cells.append(f'<div id="{id_}d{d}" class="abs day" style="left:{46 + c * 104}px;top:{230 + r * 92}px"><div class="dbg"></div><span>{d}</span></div>')
    return "".join(cells)
wd = "".join(f'<div class="abs t-body" style="left:{46 + i * 104}px;top:168px;width:96px;text-align:center;opacity:.55;font-weight:600">{c}</div>' for i, c in enumerate("DSTQQSS"))
comp(n, css="""
.day { width: 96px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 600; }
.day .dbg { position: absolute; inset: 6px 10px; border-radius: 24px; background: #00E5FF; opacity: 0; }
.day span { position: relative; }
#ring10 { position: absolute; width: 96px; height: 96px; border-radius: 50%; border: 6px solid #00E5FF; }
#monthclip { position: absolute; left: 0; top: 0; width: 820px; height: 800px; overflow: hidden; }
""", world=glass("cal", 130, 415, 820, 800, "block", f"""
  <div id="monthclip">
    <div id="jul" class="abs" style="left:0;top:0;width:820px;height:800px">
      <div class="abs t-sub" style="left:46px;top:56px">Julho 2026</div>{wd}{month_grid('j', 3, 31)}
      <div id="ring10" style="left:{46 + 5 * 104}px;top:{220 + 1 * 92}px"></div>
      <div id="pin" class="chip" style="left:{46 + 5 * 104 - 60}px;top:{230 + 1 * 92 - 78}px;background:#fff;box-shadow:0 8px 20px rgba(0,30,80,.15)">{icon('pin', 40)}cheguei</div>
    </div>
    <div id="aug" class="abs" style="left:0;top:0;width:820px;height:800px">
      <div class="abs t-sub" style="left:46px;top:56px">Agosto 2026</div>{wd}{month_grid('a', 6, 31)}
      <div id="full" class="abs" style="left:610px;top:52px">{icon('check', 72)}</div>
    </div>
  </div>"""), js=f"""
  const D = {D:.4f}, t10 = {wt(41, n)}, tE = {wt(44, n)}, tC = {wt(50, n)};
  const cam = K([[0, id0], [D, camFor([540, 815], [540, 815], 1.03, A), "sine.inOut"]]);
  const ring = K([[0, 0], [t10, 0], [t10 + 0.35, 1, "back.out(1.8)"]]), pin = K([[0, 0], [t10 + 0.12, 0], [t10 + 0.45, 1, "power3.out"]]);
  const swap = K([[0, 0], [tE, 0], [tE + 0.5, 1, "power2.inOut"]]);
  const fill0 = tE + 0.55, fill1 = tC - 0.05;
  const full = K([[0, 0], [tC, 0], [tC + 0.35, 1, "back.out(1.8)"]]);
  const jul = $("jul"), aug = $("aug"), r10 = $("ring10"), pn = $("pin"), fl = $("full");
  const days = []; for (let d = 1; d <= 31; d++) days.push($("ad" + d).firstChild);
  function update(t) {{
    place(r10, {{ s: ring(t), o: Math.min(1, ring(t)) }}); place(pn, {{ y: 20 * (1 - pin(t)), o: pin(t) }});
    const s = swap(t); place(jul, {{ x: -820 * s }}); place(aug, {{ x: 820 * (1 - s) }});
    for (let d = 0; d < 31; d++) {{ const td = fill0 + (fill1 - fill0) * d / 30; days[d].style.opacity = t >= td ? Math.min(0.9, (t - td) / 0.08 * 0.9) : 0; }}
    place(fl, {{ s: full(t), o: Math.min(1, full(t)) }});
  }}
""", events={"chime": [wt(41, n) + 0.05], "ticks": [wt(44, n) + 0.55, wt(50, n) - 0.05]})

# ---------------------------------------------------------------- 5 · Paris + snacks (C)
n = 5; D = SEG[n]["t1"] - SEG[n]["t0"]; tb = wt(68, n); tbe = wt(69, n); tv = wt(60, n); tu = wt(64, n); tt = wt(71, n); td_ = wt(73, n)
wk = "".join(f'<div class="abs" style="left:{60 + i * 112}px;top:520px;width:96px;height:170px;border-radius:28px;background:rgba(0,229,255,.12)"><div class="abs t-body" style="left:0;top:12px;width:96px;text-align:center;font-weight:600;opacity:.6">{c}</div><div id="wk{i}" class="abs" style="left:14px;top:66px">{icon("cupcake" if i % 2 == 0 else "chips", 68)}</div></div>' for i, c in enumerate("STQQSSD"))
comp(n, world=glass("tix", 140, 520, 800, 420, "media", f"""
  {at(56, 60, '<div class="t-title">DUB</div><div class="t-body" style="opacity:.6">Dublin</div>')}
  {at(560, 60, '<div class="t-title">CDG</div><div class="t-body" style="opacity:.6">Paris</div>')}
  <svg class="abs" style="left:250px;top:70px" width="300" height="120" viewBox="0 0 300 120"><path d="M10 100 Q150 -20 290 100" fill="none" stroke="#00E5FF" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/></svg>
  <div id="plane" class="abs" style="left:240px;top:120px">{icon('plane', 64)}</div>
  <div id="last" class="chip" style="left:56px;top:300px">{icon('clock', 40)}última hora</div>""") +
  glass("snk", 1190, 455, 900, 760, "block", f'<div id="cup" class="abs" style="left:150px;top:90px">{icon("cupcake", 280)}</div><div id="chp" class="abs" style="left:480px;top:90px">{icon("chips", 280)}</div>{wk}'), js=f"""
  const D = {D:.4f}, tv = {tv}, tu = {tu}, tb = {tb}, tbe = {tbe}, tt = {tt}, td = {td_};
  const cT = id0, cS = camFor([1640, 835], [540, 835], 1.0, A); const mid = cT.map((v, i) => v + (cS[i] - v) * (0.45 / 1.05));
  const w0 = tb - 0.88, wm = w0 + 0.45, w1 = wm + 0.6;
  const cam = K([[0, id0], [w0, cT], [wm, mid, "power3.in"], [w1, cS, "power3.out"]]);
  const pl = K([[0, 0], [tv, 0], [tv + 1.3, 1, "power2.inOut"]]);
  const last = K([[0, 0], [tu, 0], [tu + 0.35, 1, "power3.out"]]);
  const cup = K([[0, -700], [tb, -700], [tb + 0.32, 0, "power2.in"], [tb + 0.42, -14, "sine.out"], [tb + 0.55, 0, "sine.inOut"]]);
  const chp = K([[0, -700], [tbe, -700], [tbe + 0.32, 0, "power2.in"], [tbe + 0.42, -14, "sine.out"], [tbe + 0.55, 0, "sine.inOut"]]);
  const tixb = K([[0, 0], [w0, 0], [wm, 14, "power2.in"], [w1, 9, "power2.out"]]), tixo = K([[0, 1], [w0, 1], [wm, 0.7], [w1, 0.4]]);
  const P = $("plane"), L = $("last"), U = $("cup"), H = $("chp"), X = $("tix"), wkd = []; for (let i = 0; i < 7; i++) wkd.push($("wk" + i));
  function update(t) {{
    const p = pl(t), ang = Math.PI * p; place(P, {{ x: 270 * p, y: -70 * Math.sin(ang), r: 90 + (p - 0.5) * 70 }});
    place(L, {{ y: 20 * (1 - last(t)), o: last(t) }}); place(U, {{ y: cup(t) }}); place(H, {{ y: chp(t) }});
    setBlur(X, tixb(t)); X.style.opacity = tixo(t);
    for (let i = 0; i < 7; i++) {{ const ti = tt + (td + 0.25 - tt) * i / 6, q = Math.max(0, Math.min(1, (t - ti) / 0.18)); place(wkd[i], {{ s: 0.4 + 0.6 * q, o: q }}); }}
  }}
""", events={"whoosh": [wt(68, n) - 0.88 + 0.45], "impact": [wt(68, n) + 0.32], "ticks": [wt(71, n), wt(73, n) + 0.25]})

# ---------------------------------------------------------------- 7 · brownies (C)
n = 7; D = SEG[n]["t1"] - SEG[n]["t0"]; t2 = wt(94, n); t3 = wt(95, n)
comp(n, world=glass("tray", 140, 455, 800, 760, "block", f"""
  <div class="abs" style="left:56px;top:56px">{icon('book', 120)}</div>
  <div class="abs" style="left:110px;top:300px;width:580px;height:330px;border-radius:40px;background:rgba(0,229,255,.18);border:3px solid rgba(47,124,255,.25)"></div>
  <div id="b1" class="abs" style="left:150px;top:350px">{icon('brownie', 170)}</div>
  <div id="b2" class="abs" style="left:315px;top:350px">{icon('brownie', 170)}</div>
  <div id="b3" class="abs" style="left:480px;top:350px">{icon('brownie', 170)}</div>"""), js=f"""
  const D = {D:.4f}, t2 = {t2}, t3 = {t3};
  const cam = K([[0, id0], [0.3, id0], [1.9, camFor([540, 920], [540, 900], 1.25, A), "power2.inOut"]]);
  const drop = (t0) => K([[0, -800], [t0, -800], [t0 + 0.3, 0, "power2.in"], [t0 + 0.4, -12, "sine.out"], [t0 + 0.52, 0, "sine.inOut"]]);
  const d1 = drop(t2), d2 = drop(t2 + 0.1), d3 = drop(t3);
  const B1 = $("b1"), B2 = $("b2"), B3 = $("b3");
  function update(t) {{ place(B1, {{ y: d1(t) }}); place(B2, {{ y: d2(t) }}); place(B3, {{ y: d3(t) }}); }}
""", events={"impact": [wt(94, n) + 0.3]})

# ---------------------------------------------------------------- 8 · convenience store + coffee (B)
n = 8; D = SEG[n]["t1"] - SEG[n]["t0"]; tc = wt(101, n)
comp(n, world=glass("st", 190, 180, 700, 560, "media", f'<div class="abs" style="left:150px;top:60px">{icon("store", 400)}</div>') +
  glass("cf", 640, 420, 320, 380, "doc", f'<div id="cfi" class="abs" style="left:30px;top:30px">{icon("coffee", 260)}</div>'), js=f"""
  const D = {D:.4f}, tc = {tc};
  const cam = K([[0, id0], [D, camFor([540, 470], [540, 470], 1.03, A), "sine.inOut"]]);
  const pop = K([[0, 0], [tc, 0], [tc + 0.35, 1, "back.out(1.7)"]]);
  const CF = $("cf"), ST = document.querySelector("#cfi #STEAM");
  function update(t) {{ const p = pop(t); place(CF, {{ s: 0.6 + 0.4 * p, o: Math.min(1, p * 1.4) }}); if (ST) ST.setAttribute("transform", "translate(0 " + (-4 * Math.sin(t * 6)).toFixed(2) + ")"); }}
""", events={"impact": [wt(101, n) + 0.18]})

# ---------------------------------------------------------------- 9 · drinks shelf (C)
n = 9; D = SEG[n]["t1"] - SEG[n]["t0"]; tm = max(0.05, wt(102, n)); te = wt(103, n); tcc = wt(105, n)
comp(n, world=glass("shelf", 110, 455, 860, 760, "block", f"""
  <div class="abs" style="left:60px;top:560px;width:740px;height:22px;border-radius:11px;background:rgba(47,124,255,.35)"></div>
  <div id="k1" class="abs" style="left:110px;top:250px">{can('MONSTER', '#1E2A22', '#7CFF4F', '#7CFF4F', 170, 300, 28)}</div>
  <div id="k2" class="abs" style="left:345px;top:250px">{can('ENERGÉTICO', '#2F7CFF', '#00E5FF', '#fff', 170, 300, 28)}</div>
  <div id="k3" class="abs" style="left:580px;top:250px">{can('COCA-COLA', '#E21B1B', '#fff', '#fff', 170, 300, 28)}</div>"""), js=f"""
  const D = {D:.4f};
  const cam = K([[0, id0], [D, camFor([540, 835], [540, 835], 1.04, A), "sine.inOut"]]);
  const slide = (t0) => K([[0, 900], [t0, 900], [t0 + 0.38, 0, "power3.out"]]);
  const s1 = slide({tm}), s2 = slide({te}), s3 = slide({tcc});
  const K1 = $("k1"), K2 = $("k2"), K3 = $("k3");
  function update(t) {{ place(K1, {{ x: s1(t) }}); place(K2, {{ x: s2(t) }}); place(K3, {{ x: s3(t) }}); }}
""", events={"impact": [wt(102, n) + 0.3 if wt(102, n) > 0.05 else 0.35, wt(105, n) + 0.3]})

# ---------------------------------------------------------------- 11 · food spoils -> trash (C)
n = 11; D = SEG[n]["t1"] - SEG[n]["t0"]; tq = wt(120, n); ts = wt(125, n); tdx = wt(127, n); tr2 = wt(129, n); tou = wt(130, n)
comp(n, world=glass("fb", 110, 415, 860, 800, "block", f"""
  <div id="clk" class="abs" style="left:620px;top:60px">{icon('clock', 130)}</div>
  <div id="box" class="abs" style="left:190px;top:200px">{icon('box', 420)}</div>
  <svg id="stink" class="abs" style="left:250px;top:150px" width="300" height="120" viewBox="0 0 300 120"><path d="M40 110c-20-30 20-40 0-70M150 110c-20-30 20-40 0-70M260 110c-20-30 20-40 0-70" fill="none" stroke="#34C759" stroke-width="8" stroke-linecap="round"/></svg>
  <div id="bin" class="abs" style="left:300px;top:470px">{icon('trash', 260)}</div>"""), js=f"""
  const D = {D:.4f}, tq = {tq}, ts = {ts}, tdx = {tdx}, tr2 = {tr2}, tou = {tou};
  const cB = camFor([540, 700], [540, 720], 1.15, A);
  const cam = K([[0, id0], [tq - 0.4, id0], [tq + 1.2, cB, "power2.inOut"], [tou - 0.3, cB], [Math.min(D, tou + 1.3), id0, "power2.inOut"]]);
  const clk = K([[0, 0], [tq - 0.2, 0], [ts, 1, "power1.inOut"]]);
  const rot = K([[0, 0], [ts - 0.1, 0], [ts + 0.6, 1, "power2.inOut"]]);
  const bin = K([[0, 0], [tdx - 0.1, 0], [tdx + 0.3, 1, "power3.out"]]);
  const fall = K([[0, 0], [tr2 - 0.25, 0], [tr2 + 0.15, 1, "power2.in"]]);
  const CL = $("clk").firstChild, BX = $("box"), FD = document.querySelector("#box #FOOD"), SK = $("stink"), BN = $("bin");
  function update(t) {{
    place($("clk"), {{ r: 0, o: 1 }}); CL.style.transform = "rotate(" + (clk(t) * 720).toFixed(1) + "deg)"; CL.style.transformOrigin = "50% 50%";
    const r = rot(t); if (FD) FD.style.filter = "grayscale(" + r.toFixed(2) + ") sepia(" + (0.6 * r).toFixed(2) + ") hue-rotate(" + (40 * r).toFixed(1) + "deg) brightness(" + (1 - 0.15 * r).toFixed(2) + ")";
    SK.style.opacity = (r * (1 - fall(t))).toFixed(3); SK.style.transform = "translateY(" + (-6 * Math.sin(t * 9)).toFixed(2) + "px)";
    const b = bin(t), f = fall(t); place(BN, {{ y: 300 * (1 - b), o: b }}); place(BX, {{ y: 260 * f, s: 1 - 0.45 * f, o: 1 - f }});
  }}
""", events={"impact": [wt(129, n) + 0.15]})

# ---------------------------------------------------------------- 13 · wallet flows (C)
n = 13; D = SEG[n]["t1"] - SEG[n]["t0"]; tg13 = wt(146, n); tsb = wt(150, n)
coins = "".join(f'<div id="co{i}" class="abs" style="left:-40px;top:250px">{icon("coin", 70)}</div>' for i in range(6))
comp(n, world=glass("wb", 190, 455, 700, 760, "block", f"""
  <div class="abs" style="left:200px;top:180px">{icon('wallet', 300)}</div>{coins}
  <div class="abs t-body" style="left:70px;top:560px;font-weight:600">Entrou</div>
  <div class="abs" style="left:70px;top:610px;width:560px;height:28px;border-radius:14px;background:rgba(47,124,255,.15)"><div id="bin_" class="abs cyanbar" style="left:0;top:0;height:28px;width:560px"></div></div>
  <div class="abs t-body" style="left:70px;top:650px;font-weight:600">Sobrou</div>
  <div class="abs" style="left:70px;top:700px;width:560px;height:28px;border-radius:14px;background:rgba(52,199,89,.15)"><div id="bsb" class="abs" style="left:0;top:0;height:28px;width:560px;border-radius:12px;background:#34C759"></div></div>"""), js=f"""
  const D = {D:.4f}, tg = {tg13}, tsb = {tsb};
  const cam = K([[0, id0], [D, camFor([540, 835], [540, 835], 1.03, A), "sine.inOut"]]);
  const inb = K([[0, 0], [tg, 0], [tg + 0.9, 1, "power2.inOut"]]), sob = K([[0, 0], [tsb, 0], [tsb + 0.8, 0.453, "power2.inOut"]]);
  const co = []; for (let i = 0; i < 6; i++) co.push($("co" + i));
  const BI = $("bin_"), BS = $("bsb");
  function update(t) {{
    for (let i = 0; i < 6; i++) {{ const p = Math.max(0, Math.min(1, (t - tg - i * 0.12) / 0.5)); const e = p * p * (3 - 2 * p);
      place(co[i], {{ x: 40 + 320 * e, y: -60 * Math.sin(Math.PI * e), s: 1 - 0.3 * e, o: p > 0 && p < 1 ? 1 : 0 }}); }}
    BI.style.transform = "scaleX(" + inb(t).toFixed(4) + ")"; BI.style.transformOrigin = "0 50%";
    BS.style.transform = "scaleX(" + sob(t).toFixed(4) + ")"; BS.style.transformOrigin = "0 50%";
  }}
""", events={"ticks": [wt(146, n), wt(146, n) + 1.0]})

# ---------------------------------------------------------------- 14 · income 3.142,00 € (B)
n = 14; D = SEG[n]["t1"] - SEG[n]["t0"]; t31 = wt(160, n)
comp(n, world=glass("inc", 140, 230, 800, 520, "doc", f"""
  <div class="abs row" style="left:56px;top:50px;gap:20px">{icon('wallet', 80)}<div class="t-body" style="font-weight:600">Renda · agosto 2026</div></div>
  <div id="val" class="abs t-title" style="left:56px;top:190px">+0,00 €</div>
  <div class="abs" style="left:56px;top:330px;width:688px;height:8px;border-radius:4px;background:rgba(0,229,255,.25)"><div id="vbar" class="abs cyanbar" style="left:0;top:0;height:8px;width:688px"></div></div>
  <div class="abs t-body" style="left:56px;top:380px;opacity:.7">valor registrado no app dele</div>
  <div id="ok" class="abs" style="left:660px;top:46px">{icon('check', 84)}</div>"""), js=f"""
  const D = {D:.4f}, t0 = {t31};
  const cam = K([[0, id0], [0.2, id0], [1.6, camFor([540, 490], [540, 470], 1.12, A), "power2.inOut"]]);
  const cnt = K([[0, 0], [t0, 0], [t0 + 0.95, 3142, "power2.out"]]), ok = K([[0, 0], [t0 + 0.95, 0], [t0 + 1.25, 1, "back.out(1.8)"]]);
  const V = $("val"), B = $("vbar"), O = $("ok");
  function update(t) {{ const v = cnt(t); V.textContent = money(v, true); B.style.transform = "scaleX(" + (v / 3142).toFixed(4) + ")"; B.style.transformOrigin = "0 50%"; place(O, {{ s: ok(t), o: Math.min(1, ok(t)) }}); }}
""", events={"ticks": [wt(160, n), wt(160, n) + 0.95], "chime": [wt(160, n) + 0.95]})

# ---------------------------------------------------------------- 16 · kebab & burger every day (C)
n = 16; D = SEG[n]["t1"] - SEG[n]["t0"]; ttd = wt(187, n); tdd = wt(189, n); tk = wt(190, n); th = wt(191, n)
tiles = "".join(f'<div id="tl{i}" class="abs" style="left:{40 + i * 118}px;top:300px;width:104px;height:300px;border-radius:30px;background:rgba(0,229,255,.12)"><div class="abs t-body" style="left:0;top:16px;width:104px;text-align:center;font-weight:600;opacity:.6">{c}</div><div id="tb{i}" class="abs" style="left:0;top:0;width:104px;height:10px;border-radius:30px 30px 0 0;background:#00E5FF;opacity:0"></div><div id="fi{i}" class="abs" style="left:10px;top:110px">{icon("kebab" if i % 2 == 0 else "burger", 84)}</div></div>' for i, c in enumerate("STQQSSD"))
comp(n, world=glass("wkb", 90, 515, 900, 700, "block", f'<div class="abs t-sub" style="left:56px;top:56px">Semana</div>{tiles}'), js=f"""
  const D = {D:.4f}, tt = {ttd}, td = {tdd}, tk = {tk}, th = {th};
  const cam = K([[0, id0], [D, camFor([540, 865], [540, 865], 1.03, A), "sine.inOut"]]);
  const tb = [], fi = []; for (let i = 0; i < 7; i++) {{ tb.push($("tb" + i)); fi.push($("fi" + i)); }}
  function update(t) {{
    for (let i = 0; i < 7; i++) {{
      const ti = tt + (td - tt) * i / 6; tb[i].style.opacity = Math.max(0, Math.min(1, (t - ti) / 0.12)).toFixed(3);
      const t0 = (i % 2 == 0 ? tk : th) + 0.06 * Math.floor(i / 2), p = Math.max(0, Math.min(1, (t - t0) / 0.3));
      place(fi[i], {{ y: -500 * (1 - p * p), o: p > 0 ? 1 : 0 }});
    }}
  }}
""", events={"ticks": [wt(187, n), wt(189, n)], "impact": [wt(190, n) + 0.3]})

# ---------------------------------------------------------------- 17 · burger + cans of the week (B, window shows the real room)
n = 17; D = SEG[n]["t1"] - SEG[n]["t0"]; thb = wt(200, n); tol = wt(202, n); tis = wt(205, n); tme = wt(210, n); tla = wt(212, n); tse = wt(217, n)
stack = "".join(f'<div id="cn{i}" class="abs" style="left:{90 + (i % 5) * 120}px;top:{300 - (i // 5) * 10}px">{can("", "#1E2A22", "#7CFF4F", "#7CFF4F", 96, 170)}</div>' for i in range(5))
comp(n, css="""
#chm { left:56px; top:50px; background:#fff; box-shadow:0 8px 20px rgba(0,30,80,.12); }
#chm .strike { position:absolute; left:14px; right:14px; top:50%; height:6px; margin-top:-3px; border-radius:3px; background:#FF3B30; transform-origin:0 50%; }
#chs { left:290px; top:50px; background:#00E5FF; }
#arrow { position:absolute; left:490px; top:800px; }
""", world=glass("bg1", 300, 210, 480, 520, "media", f'<div id="bgi" class="abs" style="left:60px;top:60px">{icon("burger", 360)}</div>') +
  glass("cans", 1240, 210, 800, 600, "doc", f'<div id="chm" class="chip">{icon("cal", 40)}1 mês<div class="strike"></div></div><div id="chs" class="chip">{icon("cal", 40)}1 semana</div>{stack}'),
  post='<svg id="arrow" width="100" height="100" viewBox="0 0 100 100"><path d="M20 30l30 30 30-30" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  js=f"""
  const D = {D:.4f}, thb = {thb}, tol = {tol}, tis = {tis}, tme = {tme}, tla = {tla}, tse = {tse};
  const cC = camFor([1640, 510], [540, 470], 1.0, A);
  const cam = K([[0, id0], [tol - 0.25, id0], [tol + 0.25, cC, "power3.inOut"]]);
  const bp = K([[0, 1], [thb, 1], [thb + 0.18, 1.12, "power2.out"], [thb + 0.5, 1, "power2.inOut"]]);
  const ar = K([[0, 0], [tol + 0.2, 0], [tol + 0.45, 1], [tla - 0.4, 1], [tla - 0.1, 0]]);
  const cm = K([[0, 0], [tis, 0], [tis + 0.35, 1, "power3.out"]]), sk = K([[0, 0], [tme + 0.05, 0], [tme + 0.3, 1, "power2.out"]]);
  const cs = K([[0, 0], [tse, 0], [tse + 0.35, 1, "back.out(1.8)"]]);
  const BG = $("bg1"), AR = $("arrow"), CM = $("chm"), SK = document.querySelector("#chm .strike"), CS = $("chs"), cn = []; for (let i = 0; i < 5; i++) cn.push($("cn" + i));
  const bb = K([[0, 0], [tol - 0.25, 0], [tol + 0.25, 9, "power2.inOut"]]);
  function update(t) {{
    place(BG, {{ s: bp(t), o: 1 }}); setBlur(BG, bb(t));
    place(AR, {{ y: 14 * Math.sin(t * 7), o: ar(t) }});
    place(CM, {{ y: 16 * (1 - cm(t)), o: cm(t) * (1 - 0.5 * sk(t)) }}); SK.style.transform = "scaleX(" + sk(t).toFixed(4) + ")";
    place(CS, {{ s: 0.6 + 0.4 * cs(t), o: Math.min(1, cs(t)) }});
    for (let i = 0; i < 5; i++) {{ const t0 = tla + (tse - tla) * i / 4, q = Math.max(0, Math.min(1, (t - t0) / 0.28)); place(cn[i], {{ y: -400 * (1 - q * q), o: q > 0 ? 1 : 0 }}); }}
  }}
""", events={"impact": [wt(212, n) + 0.28], "whoosh": [wt(202, n)]})

# ---------------------------------------------------------------- 19 · essentials vs extras (C)
n = 19; D = SEG[n]["t1"] - SEG[n]["t0"]; tcn = wt(233, n); tno = wt(234, n); tes = wt(238, n); tga = wt(243, n)
ess = [("Arroz", "box"), ("Leite", "coffee"), ("Pão", "fork")]
ext = [("Kebab", "kebab"), ("Monster", "chips"), ("Brownie", "brownie"), ("Paris", "plane")]
rows = "".join(f'<div id="e{i}" class="abs row" style="left:56px;top:{170 + i * 92}px;gap:20px">{icon(ic_, 56)}<div class="t-body" style="font-weight:600">{nm}</div><div class="abs" style="left:560px;top:4px">{icon("check", 48)}</div></div>' for i, (nm, ic_) in enumerate(ess))
rows += "".join(f'<div id="x{i}" class="abs row" style="left:56px;top:{470 + i * 92}px;gap:20px;width:680px;padding:6px 0;border-radius:20px;background:rgba(0,229,255,.16)">{icon(ic_, 56)}<div class="t-body" style="font-weight:600">{nm}</div></div>' for i, (nm, ic_) in enumerate(ext))
comp(n, css="#stamp { position:absolute; left:250px; top:360px; padding:14px 34px; border:8px solid #FF3B30; border-radius:24px; color:#FF3B30; font-size:52px; font-weight:700; letter-spacing:.04em; transform-origin:50% 50%; }",
  world=glass("lst", 140, 330, 800, 885, "doc", f'<div class="abs t-sub" style="left:56px;top:56px">Compras do mês</div>{rows}<div id="stamp">SEM CONTROLE</div>'), js=f"""
  const D = {D:.4f}, tcn = {tcn}, tno = {tno}, tes = {tes}, tga = {tga};
  const cX = camFor([540, 1000], [540, 900], 1.22, A);
  const cam = K([[0, id0], [tno - 0.2, id0], [tno + 1.4, cX, "power2.inOut"], [tga - 0.1, cX], [Math.min(D, tga + 1.5), id0, "power2.inOut"]]);
  const st = K([[0, 0], [tcn - 0.05, 0], [tcn + 0.18, 1, "power4.in"]]);
  const e = [], x = []; for (let i = 0; i < 3; i++) e.push($("e" + i)); for (let i = 0; i < 4; i++) x.push($("x" + i));
  const S = $("stamp");
  function update(t) {{
    for (let i = 0; i < 3; i++) {{ const q = Math.max(0, Math.min(1, (t - 0.1 - i * 0.2) / 0.3)); place(e[i], {{ x: -30 * (1 - q), o: q }}); }}
    for (let i = 0; i < 4; i++) {{ const q = Math.max(0, Math.min(1, (t - tno - i * (tes - tno + 0.3) / 4) / 0.3)); place(x[i], {{ x: 60 * (1 - q), o: q }}); }}
    const s = st(t); S.style.opacity = s > 0 ? 1 : 0; S.style.transform = "rotate(-10deg) scale(" + (2.2 - 1.2 * s).toFixed(3) + ")";
  }}
""", events={"impact": [wt(233, n) + 0.18]})

# ---------------------------------------------------------------- 20 · house bills 677,00 € (B)
n = 20; D = SEG[n]["t1"] - SEG[n]["t0"]; t650 = wt(250, n); tfx = wt(259, n)
comp(n, world=glass("rent", 140, 170, 800, 640, "doc", f"""
  <div class="abs row" style="left:56px;top:50px;gap:22px">{icon('house', 90)}<div class="t-sub">Contas da casa</div></div>
  <div id="r1" class="abs row" style="left:56px;top:200px;width:688px;justify-content:space-between"><div class="t-body" style="font-weight:600">Aluguel</div><div id="v1" class="t-sub">650 e pouco</div></div>
  <div id="r2" class="abs row" style="left:56px;top:300px;width:688px;justify-content:space-between"><div class="row" style="gap:12px">{icon('broom', 52)}<div class="t-body" style="font-weight:600">Faxineira</div></div><div class="t-sub">+ taxa</div></div>
  <div class="abs" style="left:56px;top:400px;width:688px;height:4px;border-radius:2px;background:rgba(29,29,31,.15)"></div>
  <div id="r3" class="abs row" style="left:56px;top:440px;width:688px;justify-content:space-between"><div class="t-body" style="font-weight:600">Total no app</div><div class="t-sub" id="tot">677,00 €</div></div>"""), js=f"""
  const D = {D:.4f}, t650 = {t650}, tfx = {tfx};
  const cam = K([[0, id0], [D, camFor([540, 490], [540, 490], 1.03, A), "sine.inOut"]]);
  const f = (t0) => K([[0, 0], [t0, 0], [t0 + 0.35, 1, "power3.out"]]);
  const a1 = f(t650), a2 = f(tfx - 0.1), a3 = f(Math.min(D - 0.45, tfx + 0.25));
  const R1 = $("r1"), R2 = $("r2"), R3 = $("r3");
  function update(t) {{ place(R1, {{ y: 24 * (1 - a1(t)), o: a1(t) }}); place(R2, {{ y: 24 * (1 - a2(t)), o: a2(t) }}); place(R3, {{ y: 24 * (1 - a3(t)), o: a3(t) }}); }}
""", events={"chime": [min(D - 0.45, wt(259, n) + 0.25)]})

# ---------------------------------------------------------------- 22 · ticket price x3 (C)
n = 22; D = SEG[n]["t1"] - SEG[n]["t0"]; t3x = wt(284, n)
comp(n, css="#st3 { position:absolute; left:560px; top:250px; width:220px; height:220px; border-radius:50%; border:10px solid #FF3B30; color:#FF3B30; font-size:96px; font-weight:700; display:flex; align-items:center; justify-content:center; }",
  world=glass("tk", 110, 555, 860, 660, "media", f"""
  {at(56, 56, '<div class="t-title">DUB → CDG</div>')}
  <div class="abs t-body" style="left:56px;top:190px;opacity:.6">passagem de último minuto</div>
  <div class="abs t-body" style="left:56px;top:300px;font-weight:600">preço normal</div>
  <div class="abs" style="left:56px;top:350px;width:220px;height:40px;border-radius:20px;background:#00E5FF"></div>
  <div class="abs t-body" style="left:56px;top:430px;font-weight:600">o que ele pagou</div>
  <div class="abs" style="left:56px;top:480px;width:660px;height:40px;border-radius:20px;background:rgba(255,59,48,.12)"><div id="pb" class="abs" style="left:0;top:0;width:660px;height:40px;border-radius:20px;background:#FF3B30"></div></div>
  <div id="st3">3×</div>"""), js=f"""
  const D = {D:.4f}, t3 = {t3x};
  const cam = K([[0, id0], [D, camFor([540, 885], [540, 885], 1.03, A), "sine.inOut"]]);
  const g = K([[0, 1 / 3], [t3, 1 / 3], [t3 + 0.45, 1, "power2.inOut"]]), s = K([[0, 0], [t3 + 0.12, 0], [t3 + 0.3, 1, "power4.in"]]);
  const PB = $("pb"), S = $("st3");
  function update(t) {{ PB.style.transform = "scaleX(" + g(t).toFixed(4) + ")"; PB.style.transformOrigin = "0 50%"; const q = s(t); S.style.opacity = q > 0 ? 1 : 0; S.style.transform = "rotate(-14deg) scale(" + (2 - q).toFixed(3) + ")"; }}
""", events={"impact": [wt(284, n) + 0.3]})

# ---------------------------------------------------------------- 24 · source page (C): fixed glass frame, moves happen inside
n = 24; D = SEG[n]["t1"] - SEG[n]["t0"]
page = """<div class="pg">
  <div class="pg-top"><span class="pg-site">techtudo.com.br</span><span class="pg-sec">Notícias · Jogos</span></div>
  <div class="pg-kick">ESPORTS WORLD CUP 2026 · PARIS</div>
  <div class="pg-h">CS2 na EWC 2026: FURIA é destaque na última semana do torneio</div>
  <div class="pg-meta">agosto de 2026 · techtudo.com.br/noticias/2026/08/</div>
  <div class="pg-p">A FURIA enfrenta a Aurora Gaming nesta quarta-feira (19), às 13h55 (horário de Brasília).</div>
  <div id="pgline" class="pg-p pg-hl">Os playoffs ocorrem entre os dias 19 e 23 de agosto, dia da grande final na Accor Arena.</div>
  <div class="pg-note">Reconstrução fiel do texto da página — a captura de tela foi bloqueada pela rede deste ambiente.</div>
</div>"""
comp(n, css="""
#blurcopy { position:absolute; left:-60px; top:-60px; width:1200px; height:2040px; filter: blur(40px) saturate(0.7) brightness(1.05); transform-origin: 50% 50%; }
#blurcopy .pg { transform: scale(1.35); transform-origin: 30% 20%; }
#whiteov { position:absolute; inset:0; background: rgba(255,255,255,0.72); }
#frame { position:absolute; left:24px; top:200px; width:1032px; height:1040px; border-radius:36px; overflow:hidden; background: rgba(255,255,255,0.85);
  -webkit-backdrop-filter: blur(24px) saturate(1.6); backdrop-filter: blur(24px) saturate(1.6); border:1.5px solid rgba(255,255,255,.95);
  box-shadow: 0 60px 120px rgba(0,30,80,0.16), 0 24px 48px rgba(0,30,80,0.10), 0 4px 10px rgba(0,30,80,0.06); }
#frame #world { width:1032px; height:1040px; }
.pg { width: 1032px; padding: 50px 86px; color:#1D1D1F; }
.pg-top { display:flex; justify-content:space-between; align-items:center; padding-bottom:22px; border-bottom:3px solid rgba(29,29,31,.12); }
.pg-site { font-size:44px; font-weight:700; color:#C4170C; } .pg-sec { font-size:30px; opacity:.6; }
.pg-kick { margin-top:44px; font-size:30px; font-weight:700; color:#2F7CFF; letter-spacing:.06em; }
.pg-h { margin-top:16px; font-size:60px; font-weight:700; line-height:1.12; letter-spacing:-0.01em; }
.pg-meta { margin-top:26px; font-size:30px; opacity:.6; }
.pg-p { margin-top:30px; font-size:34px; line-height:1.42; }
.pg-hl { background: linear-gradient(transparent 55%, rgba(0,229,255,.45) 55%); }
.pg-note { margin-top:52px; font-size:30px; color:#2F7CFF; font-weight:600; }
""", pre=f'<div id="blurcopy">{page}</div><div id="whiteov"></div>', world=page,
  js=f"""
  const D = {D:.4f};
  const W = document.getElementById("world"); const fr = document.createElement("div"); fr.id = "frame";
  W.parentNode.parentNode.insertBefore(fr, W.parentNode); fr.appendChild(W.parentNode);
  const A2 = [516, 520]; A[0] = A2[0]; A[1] = A2[1];
  const c0 = [516, 520, 1], cH = camFor([516, 330], [516, 420], 1.18, A2), cL = camFor([516, 780], [516, 600], 1.18, A2);
  const cam = K([[0, c0], [0.35, c0], [1.95, cH, "power2.inOut"], [3.0, cH], [4.4, cL, "power2.inOut"], [5.5, cL], [Math.min(D, 7.0), c0, "power2.inOut"]]);
  function update(t) {{}}
""")

# ---------------------------------------------------------------- 25 · food 131,08 € (B)
n = 25; D = SEG[n]["t1"] - SEG[n]["t0"]; tce = wt(334, n)
comp(n, world=glass("fd", 140, 230, 800, 520, "doc", f"""
  <div class="abs row" style="left:56px;top:50px;gap:20px">{icon('fork', 80)}<div class="t-body" style="font-weight:600">Comida · agosto 2026</div></div>
  <div id="fv" class="abs t-title" style="left:56px;top:190px">0,00 €</div>
  <div class="abs" style="left:56px;top:330px;width:688px;height:8px;border-radius:4px;background:rgba(0,229,255,.25)"><div id="fbar" class="abs cyanbar" style="left:0;top:0;height:8px;width:688px"></div></div>
  <div class="abs t-body" style="left:56px;top:380px;opacity:.7">“cento e poucos euros” · valor do app</div>"""), js=f"""
  const D = {D:.4f}, t0 = {tce};
  const cam = K([[0, id0], [0.2, id0], [1.5, camFor([540, 490], [540, 470], 1.12, A), "power2.inOut"]]);
  const cnt = K([[0, 0], [t0, 0], [t0 + 0.8, 131.08, "power2.out"]]);
  const V = $("fv"), B = $("fbar");
  function update(t) {{ const v = cnt(t); V.textContent = money(v); B.style.transform = "scaleX(" + (v / 131.08).toFixed(4) + ")"; B.style.transformOrigin = "0 50%"; }}
""", events={"ticks": [wt(334, n), wt(334, n) + 0.8]})

# ---------------------------------------------------------------- 26 · expense app report (C, reconstruction, light theme)
n = 26; D = SEG[n]["t1"] - SEG[n]["t0"]; taq = wt(340, n); tvc = wt(344, n)
items = [("Comida", "131,08 €", "7,6%"), ("Itens diários", "51,65 €", "3,0%"), ("Roupas", "20,99 €", "1,2%"), ("Cosméticos", "30,00 €", "1,7%"),
         ("Saúde", "29,14 €", "1,7%"), ("Educação", "15,00 €", "0,9%"), ("Luz, Água e Gás", "25,00 €", "1,5%"), ("Comunicação", "44,51 €", "2,6%"),
         ("Contas da casa", "677,00 €", "39,4%"), ("Lazer", "121,64 €", "7,1%"), ("Viagem", "354,95 €", "20,7%"), ("Brasil", "140,00 €", "8,1%")]
lst = "".join(f'<div class="li{" hi" if nm in ("Contas da casa", "Viagem") else ""}"><span>{nm}</span><b>{v}</b><i>{p}</i></div>' for nm, v, p in items)
comp(n, css="""
#ph { transform-origin: 50% 100%; }
.app { position:absolute; left:26px; top:26px; right:26px; bottom:26px; border-radius:62px; background:#F7FAFF; overflow:hidden; }
.app-h { padding:40px 34px 10px; font-size:40px; font-weight:700; }
.app-tabs { display:flex; margin:0 34px; border-bottom:3px solid rgba(29,29,31,.08); } .app-tabs div { flex:1; text-align:center; font-size:30px; padding:12px 0; opacity:.5; }
.app-tabs .on { opacity:1; font-weight:700; border-bottom:5px solid #00E5FF; }
.app-per { margin:18px 34px; padding:12px 20px; border-radius:24px; background:rgba(0,229,255,.12); font-size:30px; font-weight:600; }
#lclip { position:absolute; left:0; right:0; top:285px; bottom:210px; overflow:hidden; } #lst { position:absolute; left:0; right:0; top:0; }
.li { display:flex; align-items:center; padding:0 30px; height:64px; font-size:30px; white-space:nowrap; border-bottom:2px solid rgba(29,29,31,.05); }
.li span { flex:1; } .li b { font-weight:700; } .li i { width:92px; text-align:right; font-style:normal; opacity:.5; }
.li.hi { background: linear-gradient(90deg, rgba(0,229,255,.28), rgba(0,229,255,.06)); }
.app-sum { position:absolute; left:34px; right:34px; bottom:30px; padding:18px 22px; border-radius:30px; background:#fff; box-shadow:0 8px 24px rgba(0,30,80,.12); }
.app-sum .r { display:flex; justify-content:space-between; font-size:30px; font-weight:600; margin:4px 0; }
""", world=glass("ph", 220, 255, 640, 960, "phone", f"""<div class="app"><div class="app-h">Relatório</div><div class="app-tabs"><div class="on">Mensal</div><div>Anual</div></div>
  <div class="app-per">ago. 2026 (01 ago. – 31 ago.)</div><div id="lclip"><div id="lst">{lst}</div></div>
  <div class="app-sum"><div class="r"><span>Despesas</span><span style="color:#FF3B30">−1.718,03 €</span></div><div class="r"><span>Renda</span><span style="color:#2F7CFF">+3.142,00 €</span></div><div class="r"><span>Balanço</span><span style="color:#34C759">+1.423,97 €</span></div></div></div>"""), js=f"""
  const D = {D:.4f}, taq = {taq}, tvc = {tvc};
  const cam = K([[0, id0], [D, id0]]);
  const z = K([[0, 1], [taq, 1], [taq + 0.6, 1.15, "power2.inOut"]]);
  const sc = K([[0, 0], [tvc, 0], [tvc + 1.2, -320, "power2.inOut"]]);
  const PH = $("ph"), L = $("lst");
  function update(t) {{ place(PH, {{ s: z(t) }}); L.style.transform = "translateY(" + sc(t).toFixed(2) + "px)"; }}
""")

# ---------------------------------------------------------------- 28 · balance (B)
n = 28; D = SEG[n]["t1"] - SEG[n]["t0"]; tgd = wt(371, n); tsb2 = wt(378, n)
comp(n, world=glass("bal", 140, 150, 800, 700, "doc", f"""
  <div id="q1" class="abs row" style="left:56px;top:60px;width:688px;justify-content:space-between"><div class="t-body" style="font-weight:600">Renda</div><div class="t-sub" style="color:#2F7CFF">+3.142,00 €</div></div>
  <div id="q2" class="abs row" style="left:56px;top:170px;width:688px;justify-content:space-between"><div class="t-body" style="font-weight:600">Despesas</div><div class="t-sub" style="color:#FF3B30">−1.718,03 €</div></div>
  <div class="abs" style="left:56px;top:280px;width:688px;height:4px;border-radius:2px;background:rgba(29,29,31,.15)"></div>
  <div class="abs t-body" style="left:56px;top:320px;font-weight:600">Balanço de agosto</div>
  <div id="bv" class="abs t-title" style="left:56px;top:380px">+0,00 €</div>
  <div id="bok" class="abs" style="left:660px;top:390px">{icon('check', 84)}</div>"""), js=f"""
  const D = {D:.4f}, tg = {tgd}, ts = {tsb2};
  const cam = K([[0, id0], [ts - 0.6, id0], [ts + 0.8, camFor([540, 560], [540, 520], 1.06, A), "power2.inOut"]]);
  const f = (t0) => K([[0, 0], [t0, 0], [t0 + 0.35, 1, "power3.out"]]); const a1 = f(Math.max(0.05, tg - 0.6)), a2 = f(Math.max(0.15, tg - 0.3));
  const cnt = K([[0, 0], [ts, 0], [ts + 0.8, 1423.97, "power2.out"]]), ok = K([[0, 0], [ts + 0.8, 0], [ts + 1.1, 1, "back.out(1.8)"]]);
  const Q1 = $("q1"), Q2 = $("q2"), BV = $("bv"), BO = $("bok");
  function update(t) {{ place(Q1, {{ y: 20 * (1 - a1(t)), o: a1(t) }}); place(Q2, {{ y: 20 * (1 - a2(t)), o: a2(t) }}); BV.textContent = money(cnt(t), true); place(BO, {{ s: ok(t), o: Math.min(1, ok(t)) }}); }}
""", events={"chime": [wt(378, n) + 0.8]})

# ---------------------------------------------------------------- 30 · route Dublin -> Paris (B)
n = 30; D = SEG[n]["t1"] - SEG[n]["t0"]; tjp = wt(407, n)
comp(n, world=glass("map", 110, 160, 860, 640, "media", f"""
  <svg class="abs" style="left:0;top:0" width="860" height="640" viewBox="0 0 860 640"><path id="route" d="M160 230 Q420 60 690 420" fill="none" stroke="#00E5FF" stroke-width="10" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900"/></svg>
  <div class="abs" style="left:110px;top:150px">{icon('pin', 90)}</div><div class="abs t-body" style="left:90px;top:250px;font-weight:600">Dublin</div>
  <div class="abs" style="left:640px;top:340px">{icon('pin', 90)}</div><div class="abs t-body" style="left:620px;top:440px;font-weight:600">Paris</div>
  <div id="pl2" class="abs" style="left:128px;top:198px">{icon('plane', 64)}</div>
  <div id="stub" class="abs row" style="left:80px;top:490px;gap:18px;padding:14px 26px;border-radius:30px;background:#fff;box-shadow:0 10px 30px rgba(0,30,80,.15)">{icon('trophy', 64)}<div class="t-body" style="font-weight:600">jogo presencial</div></div>"""), js=f"""
  const D = {D:.4f}, tj = {tjp};
  const cam = K([[0, id0], [D, camFor([540, 480], [540, 480], 1.03, A), "sine.inOut"]]);
  const r = K([[0, 0], [0.15, 0], [1.75, 1, "power2.inOut"]]), sb = K([[0, 0], [tj, 0], [tj + 0.35, 1, "back.out(1.6)"]]);
  const RT = $("route"), PL = $("pl2"), SB = $("stub");
  function bez(p) {{ const x = (1 - p) * (1 - p) * 160 + 2 * (1 - p) * p * 420 + p * p * 690, y = (1 - p) * (1 - p) * 230 + 2 * (1 - p) * p * 60 + p * p * 420; return [x, y]; }}
  function update(t) {{ const p = r(t); RT.setAttribute("stroke-dashoffset", (900 * (1 - p)).toFixed(1)); const a = bez(p), b = bez(Math.min(1, p + 0.01));
    place(PL, {{ x: a[0] - 160, y: a[1] - 230, r: 90 + Math.atan2(b[1] - a[1], b[0] - a[0]) * 57.3 }}); place(SB, {{ s: 0.6 + 0.4 * sb(t), o: Math.min(1, sb(t)) }}); }}
""", events={"impact": [wt(407, n) + 0.2]})

# ---------------------------------------------------------------- 31 · shopping + stamp (C)
n = 31; D = SEG[n]["t1"] - SEG[n]["t0"]; tbu = wt(414, n)
comp(n, css="#st31 { position:absolute; left:120px; top:470px; padding:14px 34px; border:8px solid #FF3B30; border-radius:24px; color:#FF3B30; font-size:52px; font-weight:700; letter-spacing:.04em; }",
  world=glass("shp", 110, 455, 860, 760, "block", f"""
  <div id="sb1" class="abs" style="left:110px;top:120px">{icon('bag', 300)}</div>
  <div id="sb2" class="abs" style="left:430px;top:150px">{icon('bag2', 280)}</div>
  <div id="sh" class="abs" style="left:520px;top:60px">{icon('shirt', 150)}</div>
  <div id="st31">DESNECESSÁRIO</div>"""), js=f"""
  const D = {D:.4f}, tb = {tbu};
  const cam = K([[0, id0], [D, camFor([540, 835], [540, 835], 1.04, A), "sine.inOut"]]);
  const drop = (t0) => K([[0, -800], [t0, -800], [t0 + 0.3, 0, "power2.in"], [t0 + 0.4, -12, "sine.out"], [t0 + 0.52, 0, "sine.inOut"]]);
  const d1 = drop(0.08), d2 = drop(0.2), sh = K([[0, 0], [0.6, 0], [0.9, 1, "back.out(1.7)"]]), st = K([[0, 0], [tb, 0], [tb + 0.18, 1, "power4.in"]]);
  const B1 = $("sb1"), B2 = $("sb2"), SH = $("sh"), S = $("st31");
  function update(t) {{ place(B1, {{ y: d1(t) }}); place(B2, {{ y: d2(t) }}); place(SH, {{ s: sh(t), o: Math.min(1, sh(t)) }}); const q = st(t); S.style.opacity = q > 0 ? 1 : 0; S.style.transform = "rotate(-8deg) scale(" + (2 - q).toFixed(3) + ")"; }}
""", events={"impact": [0.38, wt(414, n) + 0.18]})

# ---------------------------------------------------------------- 33 · savings jar (C)
n = 33; D = SEG[n]["t1"] - SEG[n]["t0"]; tvl = wt(433, n); tgu = wt(435, n); tgo = wt(439, n)
coins = "".join(f'<div id="j{i}" class="abs" style="left:{250 + (i % 3) * 60}px;top:-120px">{icon("coin", 80)}</div>' for i in range(6))
comp(n, world=glass("jar", 190, 375, 700, 840, "block", f"""
  <div id="chipv" class="abs chip" style="left:120px;top:56px;font-size:52px;font-weight:700;padding:14px 30px">+1.423,97 € / mês</div>
  <svg class="abs" style="left:170px;top:200px" width="360" height="560" viewBox="0 0 360 560">
    <defs><clipPath id="jc"><path d="M60 80h240v40c30 20 40 50 40 90v270c0 30-20 60-60 60H80c-40 0-60-30-60-60V210c0-40 10-70 40-90z"/></clipPath></defs>
    <g clip-path="url(#jc)"><rect id="liq" x="0" y="560" width="360" height="560" fill="rgba(0,229,255,.55)"/></g>
    <path d="M60 80h240v40c30 20 40 50 40 90v270c0 30-20 60-60 60H80c-40 0-60-30-60-60V210c0-40 10-70 40-90z" fill="none" stroke="#2F7CFF" stroke-width="8"/>
    <rect x="50" y="50" width="260" height="34" rx="12" fill="#2F7CFF"/></svg>{coins}"""), js=f"""
  const D = {D:.4f}, tv = {tvl}, tg = {tgu}, to = {tgo};
  const cam = K([[0, id0], [D, camFor([540, 795], [540, 795], 1.03, A), "sine.inOut"]]);
  const cv = K([[0, 0], [Math.max(0.05, tv - 0.1), 0], [tv + 0.3, 1, "back.out(1.6)"]]);
  const lv = K([[0, 560], [to, 560], [Math.min(D - 0.1, to + 1.4), 300, "power2.inOut"]]);
  const CV = $("chipv"), LQ = $("liq"), jc = []; for (let i = 0; i < 6; i++) jc.push($("j" + i));
  function update(t) {{ place(CV, {{ s: 0.7 + 0.3 * cv(t), o: Math.min(1, cv(t)) }}); LQ.setAttribute("y", lv(t).toFixed(1));
    for (let i = 0; i < 6; i++) {{ const t0 = tg + i * 0.16, p = Math.max(0, Math.min(1, (t - t0) / 0.45)); place(jc[i], {{ y: 620 * p * p, o: p > 0 && p < 1 ? 1 : 0 }}); }} }}
""", events={"ticks": [wt(435, n), wt(435, n) + 1.25]})

# ---------------------------------------------------------------- write projects
events = []
for n, c in C.items():
    s = SEG[n]; cid = f"g{n:02d}"; d = f"{G}/{cid}"; os.makedirs(d, exist_ok=True)
    if os.environ.get("EVENTS_ONLY"):                 # regenerate the SFX event list without touching the projects
        for kind, ts in c["events"].items():
            for t in ts: events.append({"seg": n, "comp": cid, "kind": kind, "t_rel": round(t, 4), "t": round(s["t0"] + t, 4)})
        continue
    for f in ["gsap.min.js", "scene.js"]: shutil.copy(f"{G}/shared/{f}", d)
    if os.path.exists(f"{d}/fonts"): shutil.rmtree(f"{d}/fonts")
    shutil.copytree(f"{G}/shared/fonts", f"{d}/fonts")
    dur = s["t1"] - s["t0"]
    html = (HEAD.replace("__CSS__", c["css"]).replace("__WORLD__", c["world"]).replace("__JS__", c["js"]).replace("__PRE__", c["pre"]).replace("__POST__", c["post"])
            .replace("__ID__", cid).replace("__DUR__", f"{dur:.4f}").replace("__T0__", f"{s['t0']:.4f}"))
    open(f"{d}/index.html", "w").write(html)
    json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"assets": "assets"}}, open(f"{d}/hyperframes.json", "w"))
    for kind, ts in c["events"].items():
        for t in ts: events.append({"seg": n, "comp": cid, "kind": kind, "t_rel": round(t, 4), "t": round(s["t0"] + t, 4)})
json.dump(sorted(events, key=lambda e: e["t"]), open(f"{E}/work/graphic_events.json", "w"), indent=1)
print("compositions:", sorted(f"g{n:02d}" for n in C), "events:", len(events))
