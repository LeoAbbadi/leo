"""Generate one HyperFrames composition (standalone project) per B/C segment."""
import json, os, shutil
E = "/home/user/leo/edit"; G = f"{E}/graphics"
plan = json.load(open(f"{E}/work/plan.json"))
SEG = {s["n"]: s for s in plan["segments"]}
WORDS = plan["words"]
def wt(i, seg):  # word start relative to segment start
    return round(WORDS[i]["t0"] - SEG[seg]["t0"], 4)

HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>__ID__</title>
<script src="gsap.min.js"></script>
<script src="scene.js"></script>
<style>
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-Regular.ttf") format("truetype"); font-weight: 400; }
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-SemiBold.ttf") format("truetype"); font-weight: 600; }
@font-face { font-family: "Poppins"; src: url("fonts/Poppins-Bold.ttf") format("truetype"); font-weight: 700; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: #F3F3F0; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Poppins", sans-serif; color: #111111; }
.bg { position: absolute; inset: 0; background: radial-gradient(ellipse closest-side at 50% 36%, #FFFFFF 0%, #F3F3F0 100%); }
.stage { position: absolute; inset: 0; }
.stage.split { -webkit-mask-image: linear-gradient(to bottom, #000 0px, #000 900px, transparent 1060px); mask-image: linear-gradient(to bottom, #000 0px, #000 900px, transparent 1060px); }
#world { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
.card { position: absolute; background: #FFFFFF; overflow: hidden;
  box-shadow: 0 60px 120px rgba(24,24,32,0.16), 0 24px 48px rgba(24,24,32,0.10), 0 4px 10px rgba(24,24,32,0.06); }
.media { border-radius: 32px; }      /* 3% of the 1080 px frame width */
.doc { border-radius: 40px; }
.block { border-radius: 72px; }
.media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.svgfill { position: absolute; display: block; }
.tag { width: max-content; display: flex; align-items: center; justify-content: center; gap: 22px; overflow: visible; }
.tag .hole { width: 30px; height: 30px; border-radius: 50%; background: #F3F3F0; box-shadow: inset 0 2px 4px rgba(24,24,32,0.25); flex: none; }
.tag .tagtxt { font-weight: 700; letter-spacing: -0.01em; line-height: 1; }
.h-title { font-size: 96px; font-weight: 700; line-height: 1; }
.h-sub { font-size: 52px; font-weight: 700; line-height: 1.1; }
.body { font-size: 30px; font-weight: 400; line-height: 1.3; }
__CSS__
</style>
</head>
<body>
<div id="root" data-composition-id="__ID__" data-start="0" data-width="1080" data-height="1920" data-duration="__DUR__" data-fps="240">
  <svg width="0" height="0" style="position:absolute">
    <filter id="mb" filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000" color-interpolation-filters="sRGB">
      <feGaussianBlur id="mbg" stdDeviation="0 0" />
    </filter>
  </svg>
  <div class="bg"></div>
  <div class="stage __STAGE__"><div id="world">
__WORLD__
  </div></div>
</div>
<script>
(function () {
  const { K, camFor, setBlur, Scene, suitPath } = window.HF;
  const $ = (id) => document.getElementById(id);
__JS__
})();
</script>
</body>
</html>
"""

SUIT_SVG = """<svg class="svgfill" viewBox="0 0 300 420" style="left:__X__px;top:__Y__px;width:__W__px;height:__H__px">
  <path d="M98 92 L104 0" stroke="#26262B" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M202 92 L196 0" stroke="#26262B" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path id="__PID__" d="" fill="#26262B"/>
  <path d="M112 150 C130 176 170 176 188 150" stroke="#3A3A41" stroke-width="3" fill="none"/>
  <path d="M150 168 L150 214" stroke="#3A3A41" stroke-width="3" fill="none"/>
</svg>"""

def suit(pid, x, y, w):
    h = w * 420 / 300
    return SUIT_SVG.replace("__PID__", pid).replace("__X__", str(x)).replace("__Y__", str(y)).replace("__W__", str(w)).replace("__H__", f"{h:.1f}")

def tag(id_, x, y, w, h, size_px, rot=0):
    return (f'<div id="{id_}" class="card doc tag" style="left:{x}px;top:{y}px;height:{h}px;padding:0 {max(22, int(h*0.28))}px;transform-origin:50% 50%">'
            f'<div class="hole"></div><div class="tagtxt" style="font-size:{size_px}px">XS/S</div></div>')

COMPS = {}

# ---------------- G1: hook (layout B) ----------------
s = 1; D = SEG[s]["t1"] - SEG[s]["t0"]
t_cheg = wt(5, s)            # "Chegou"
w1 = dict(push0=0.08, push1=1.30, whip_mid=1.75, whip_end=2.35, drop0=1.92, land=2.30, settle=2.50,
          drift_end=3.80, D=round(D, 4))
COMPS["g1"] = dict(dur=D, stage="split", css="", world=f"""
    <div id="cardT" class="card media" style="left:430px;top:630px;width:220px;height:260px">
      {suit("suitT", 35, 40, 150)}
    </div>
    {tag("tagT", 586, 642, 112, 58, 30)}
    <div id="cardP" class="card media" style="left:1240px;top:386px;width:700px;height:504px"><img src="img/bag.png" alt=""></div>
""", js=f"""
  const T = {json.dumps(w1)};
  const A = [540, 960], id = [540, 960, 1];
  const cT = camFor([540, 760], [540, 682], 1.6, A);
  const cP = camFor([1590, 638], [540, 638], 1.0, A);
  const mid = cT.map((v, i) => v + (cP[i] - v) * (0.45 / 1.05));
  const cam = K([[0, id], [T.push0, id], [T.push1, cT, "power2.inOut"], [T.whip_mid, mid, "power3.in"], [T.whip_end, cP, "power3.out"],
                 [T.drift_end, camFor([1590, 638], [540, 638], 1.03, A), "sine.inOut"],
                 [T.D, camFor([1590, 633], [540, 470], 1.6, A), "power2.inOut"]]);
  const dropY = K([[0, -900], [T.drop0, -900], [T.land, 0, "power2.in"], [T.land + 0.09, -14, "sine.out"], [T.settle, 0, "sine.inOut"]]);
  const tBlur = K([[0, 0], [T.push1, 0], [T.whip_mid, 14, "power2.in"], [T.whip_end, 9, "power2.out"]]);
  const tOp = K([[0, 1], [T.push1, 1], [T.whip_mid, 0.7], [T.whip_end, 0.4]]);
  $("suitT").setAttribute("d", suitPath(1));
  const cardP = $("cardP"), cardT = $("cardT"), tagT = $("tagT");
  const tl = Scene({{ id: "g1", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{
      cardP.style.transform = "translateY(" + dropY(t).toFixed(2) + "px)";
      const b = tBlur(t), o = tOp(t);
      setBlur(cardT, b); setBlur(tagT, b); cardT.style.opacity = o; tagT.style.opacity = o;
    }} }});
  window.__timelines[TLID] = tl;
""", events={"whoosh": [w1["whip_mid"]], "impact": [w1["land"]]})

# ---------------- G2: opening the package (layout C) ----------------
s = 2; D = SEG[s]["t1"] - SEG[s]["t0"]
w2 = dict(zip0=0.12, zip1=0.70, rise0=0.50, rise1=0.95, D=round(D, 4))
COMPS["g2"] = dict(dur=D, stage="", css="""
#zipTrack { position:absolute; left:0; top:0; width:100%; height:64px; background:rgba(255,255,255,0.62); }
#zipTeeth { position:absolute; left:28px; right:28px; top:30px; height:4px; background-image:repeating-linear-gradient(90deg,#9A9AA2 0 10px,transparent 10px 18px); }
#zipSlit { position:absolute; left:0; top:24px; height:16px; width:0; background:linear-gradient(#2A2A30,#55555C); border-radius:8px; }
#zipPull { position:absolute; left:0; top:8px; width:48px; height:76px; border-radius:16px; background:#FFFFFF;
  box-shadow:0 4px 10px rgba(24,24,32,0.18), 0 1px 2px rgba(24,24,32,0.2); }
#zipPull:after { content:""; position:absolute; left:16px; top:40px; width:16px; height:22px; border-radius:6px; border:3px solid #C9C9CF; }
""", world=f"""
    <div id="cardG" class="card block" style="left:360px;top:300px;width:360px;height:440px">
      {suit("suitG", 50, 30, 260)}
    </div>
    <div id="cardBag" class="card media" style="left:90px;top:567px;width:900px;height:648px">
      <img src="img/bag.png" alt="">
      <div id="zipTrack"><div id="zipTeeth"></div><div id="zipSlit"></div></div>
      <div id="zipPull"></div>
    </div>
""", js=f"""
  const T = {json.dumps(w2)};
  const A = [540, 960], id = [540, 960, 1];
  const cam = K([[0, id], [T.D, camFor([540, 891], [540, 891], 1.02, A), "sine.inOut"]]);
  const zx = K([[0, 34], [T.zip0, 34], [T.zip1, 818, "power2.inOut"]]);
  const rise = K([[0, 340], [T.rise0, 340], [T.rise1, 0, "power3.out"]]);
  $("suitG").setAttribute("d", suitPath(1));
  const pull = $("zipPull"), slit = $("zipSlit"), cardG = $("cardG");
  const tl = Scene({{ id: "g2", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{
      const x = zx(t);
      pull.style.transform = "translateX(" + x.toFixed(2) + "px)";
      slit.style.width = Math.max(0, x + 24).toFixed(2) + "px";
      cardG.style.transform = "translateY(" + rise(t).toFixed(2) + "px)";
    }} }});
  window.__timelines[TLID] = tl;
""", events={"ticks": [w2["zip0"], w2["zip1"]], "impact": [0.74]})

# ---------------- G4: compression on the body (layout C) ----------------
s = 4; D = SEG[s]["t1"] - SEG[s]["t0"]
tj = wt(38, s)               # "justinhos"
w4 = dict(push0=0.55, push1=2.35, m0=round(tj - 0.08, 3), m1=round(tj + 0.72, 3), D=round(D, 4))
COMPS["g4"] = dict(dur=D, stage="", css="", world=f"""
    <div id="cardM" class="card block" style="left:160px;top:355px;width:760px;height:860px">
      <svg class="svgfill" viewBox="0 0 760 860" style="left:0;top:0;width:760px;height:860px">
        <circle cx="380" cy="122" r="64" fill="#ECEAE5"/>
        <path d="M352 178 L408 178 L412 222 L348 222 Z" fill="#ECEAE5"/>
        <path d="M226 262 C250 226 300 218 348 216 L412 216 C460 218 510 226 534 262 C552 300 548 360 540 420
                 L520 420 C516 470 512 520 522 560 C536 620 540 680 528 740 L500 860 L260 860 L232 740
                 C220 680 224 620 238 560 C248 520 244 470 240 420 L220 420 C212 360 208 300 226 262 Z" fill="#ECEAE5"/>
      </svg>
      {suit("suitM", 230, 216, 300)}
      <svg class="svgfill" viewBox="0 0 760 860" style="left:0;top:0;width:760px;height:860px;overflow:visible">
        <path id="chevL" d="M168 520 L198 550 L168 580" stroke="#D97757" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>
        <path id="chevR" d="M592 520 L562 550 L592 580" stroke="#D97757" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>
      </svg>
    </div>
""", js=f"""
  const T = {json.dumps(w4)};
  const A = [540, 1215], id = [540, 1215, 1];
  const cam = K([[0, id], [T.push0, id], [T.push1, [540, 1215, 1.6], "power2.inOut"]]);
  const morph = K([[0, 0], [T.m0, 0], [T.m1, 1, "power2.inOut"]]);
  const chevO = K([[0, 0], [T.m0 - 0.1, 0], [T.m0 + 0.08, 1, "power1.out"], [T.m1 + 0.15, 1], [T.m1 + 0.45, 0, "power1.in"]]);
  const chevX = K([[0, 0], [T.m0, 0], [T.m1, 34, "power2.inOut"]]);
  const pathM = $("suitM"), cl = $("chevL"), cr = $("chevR");
  const tl = Scene({{ id: "g4", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{
      pathM.setAttribute("d", suitPath(morph(t)));
      const o = chevO(t), x = chevX(t);
      cl.setAttribute("opacity", o.toFixed(3)); cr.setAttribute("opacity", o.toFixed(3));
      cl.setAttribute("transform", "translate(" + x.toFixed(2) + " 0)"); cr.setAttribute("transform", "translate(" + (-x).toFixed(2) + " 0)");
    }} }});
  window.__timelines[TLID] = tl;
""", events={})

# ---------------- G5: smallest size tag (layout B) ----------------
s = 5; D = SEG[s]["t1"] - SEG[s]["t0"]
w5 = dict(push0=0.06, push1=1.30, D=round(D, 4))
COMPS["g5"] = dict(dur=D, stage="split", css="", world=f"""
    <div id="cardS" class="card block" style="left:220px;top:290px;width:440px;height:600px">
      {suit("suitS", 66, 64, 308)}
    </div>
    <svg class="svgfill" viewBox="0 0 1080 1920" style="left:0;top:0;width:1080px;height:1920px;overflow:visible">
      <path id="string5" d="M488 360 C560 330 610 360 652 412" stroke="#9A9AA2" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>
    {tag("tag5", 622, 362, 250, 166, 52)}
""", js=f"""
  const T = {json.dumps(w5)};
  const A = [540, 960], id = [540, 960, 1];
  const tc = [747, 445];
  const cam = K([[0, id], [T.push0, id], [T.push1, camFor(tc, [540, 470], 1.6, A), "power2.inOut"],
                 [T.D, camFor(tc, [540, 470], 1.62, A), "sine.inOut"]]);
  const sBlur = K([[0, 0], [T.push0, 0], [T.push1, 9, "power2.inOut"]]);
  const sOp = K([[0, 1], [T.push0, 1], [T.push1, 0.4, "power2.inOut"]]);
  $("suitS").setAttribute("d", suitPath(1));
  $("tag5").style.transform = "rotate(-6deg)";
  const cardS = $("cardS"), str = $("string5");
  const tl = Scene({{ id: "g5", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{ setBlur(cardS, sBlur(t)); cardS.style.opacity = sOp(t); }} }});
  window.__timelines[TLID] = tl;
""", events={})

# ---------------- G7: "Eu visto 36" (layout B) ----------------
s = 7; D = SEG[s]["t1"] - SEG[s]["t0"]
tp = wt(71, s)               # "peguei"
w7 = dict(in0=round(tp - 0.06, 3), in1=round(tp + 0.40, 3), D=round(D, 4))
COMPS["g7"] = dict(dur=D, stage="split", css="""
#doc36 { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px; }
#doc36 .lbl { color:#B25730; font-weight:600; }
#doc36 .pill { width:270px; height:160px; border-radius:72px; background:#D97757; color:#FFFFFF; display:flex; align-items:center; justify-content:center; }
#doc36 .eq { color:#111111; }
#doc36 .note { color:#111111; opacity:0.6; }
""", world=f"""
    <div id="doc36" class="card doc" style="left:150px;top:330px;width:430px;height:560px">
      <div class="body lbl">Eu visto</div>
      <div class="pill"><div class="h-title">36</div></div>
      <div class="h-sub eq">≈ PP · XS</div>
      <div class="body note">numeração BR</div>
    </div>
    {tag("tag7", 640, 560, 250, 166, 52)}
""", js=f"""
  const T = {json.dumps(w7)};
  const A = [540, 960], id = [540, 960, 1];
  const cam = K([[0, id], [T.D, camFor([540, 610], [540, 610], 1.03, A), "sine.inOut"]]);
  const slide = K([[0, 760], [T.in0, 760], [T.in1, 0, "power3.out"]]);
  const tg = $("tag7");
  const tl = Scene({{ id: "g7", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{ tg.style.transform = "translateX(" + slide(t).toFixed(2) + "px) rotate(-6deg)"; }} }});
  window.__timelines[TLID] = tl;
""", events={"impact": [round(w7["in0"] + 0.25, 3)]})

# ---------------- G8: adjustable strap (layout C) ----------------
s = 8; D = SEG[s]["t1"] - SEG[s]["t0"]
ta = wt(80, s); tr = wt(81, s); tf = wt(84, s)   # alcinha / regulável / fica
w8 = dict(w0=round(ta - 0.80, 3), wmid=round(ta - 0.35, 3), w1=round(ta + 0.25, 3),
          z0=round(tr - 0.12, 3), z1=round(tr + 0.43, 3), s0=round(tr + 0.47, 3), s1=round(tr + 1.07, 3),
          ok=round(tf, 3), D=round(D, 4))
COMPS["g8"] = dict(dur=D, stage="", css="""
#checkB { position:absolute; left:560px; top:600px; width:170px; height:170px; border-radius:50%; background:#34C759;
  display:flex; align-items:center; justify-content:center; transform:scale(0);
  box-shadow:0 60px 120px rgba(24,24,32,0.16), 0 24px 48px rgba(24,24,32,0.10), 0 4px 10px rgba(24,24,32,0.06); }
#photo8 { position:absolute; left:60px; top:60px; width:300px; height:241px; }
""", world=f"""
    {tag("tag8", 290, 875, 500, 340, 96)}
    <div id="block8" class="card block" style="left:1250px;top:355px;width:820px;height:860px;transform-origin:50% 100%">
      <svg class="svgfill" viewBox="0 0 820 860" style="left:0;top:0;width:820px;height:860px">
        <path d="M120 860 C150 600 260 420 470 360 C560 336 660 340 820 380 L820 860 Z" fill="#EFEDE8"/>
        <path id="loop8" d="" stroke="#3A3A41" stroke-width="30" fill="none" stroke-linecap="round"/>
        <path d="M528 0 C524 120 520 220 512 330 C506 420 500 560 488 860" stroke="#26262B" stroke-width="34" fill="none"/>
        <circle cx="519" cy="236" r="26" stroke="#BDBDC4" stroke-width="9" fill="none"/>
        <g id="slider8">
          <rect x="-46" y="-62" width="92" height="124" rx="22" fill="#F4F4F6" stroke="#B9B9C0" stroke-width="4"/>
          <rect x="-28" y="-40" width="56" height="16" rx="8" fill="#2A2A30"/>
          <rect x="-28" y="24" width="56" height="16" rx="8" fill="#2A2A30"/>
        </g>
      </svg>
      <div id="photo8" class="card media"><img src="img/strap.png" alt=""></div>
      <div id="checkB"><svg viewBox="0 0 100 100" width="96" height="96"><path d="M24 52 L43 70 L77 32" stroke="#FFFFFF" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    </div>
""", js=f"""
  const T = {json.dumps(w8)};
  const A = [540, 960], id = [540, 960, 1];
  const cS = camFor([1660, 785], [540, 785], 1.0, A);
  const mid = id.map((v, i) => v + (cS[i] - v) * (0.45 / 1.05));
  const cam = K([[0, id], [T.w0, id], [T.wmid, mid, "power3.in"], [T.w1, cS, "power3.out"]]);
  const zoom = K([[0, 1], [T.z0, 1], [T.z1, 1.25, "power2.inOut"]]);
  const sy = K([[0, 300], [T.s0, 300], [T.s1, 470, "power2.inOut"]]);
  const pop = K([[0, 0], [T.ok, 0], [T.ok + 0.35, 1, "back.out(1.7)"]]);
  const tBlur = K([[0, 0], [T.w0, 0], [T.wmid, 14, "power2.in"], [T.w1, 9, "power2.out"]]);
  const tOp = K([[0, 1], [T.w0, 1], [T.wmid, 0.7], [T.w1, 0.4]]);
  const block = $("block8"), slider = $("slider8"), loop = $("loop8"), chk = $("checkB"), tg = $("tag8");
  // strap x on the main band at height y (matches the band path)
  const bandX = (y) => 528 - (y / 330) * 16 - Math.max(0, (y - 330) / 530) * 8;
  const tl = Scene({{ id: "g8", duration: T.D, anchor: A, worldId: "world", blurNodeId: "mbg", filterId: "mb", cam,
    update(t) {{
      block.style.transform = "scale(" + zoom(t).toFixed(4) + ")";
      const y = sy(t), x = bandX(y);
      slider.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")");
      loop.setAttribute("d", "M" + (x + 30).toFixed(1) + " " + (y - 50).toFixed(1) + " C" + (x + 52).toFixed(1) + " " + (y - 120).toFixed(1) + " " + (560).toFixed(1) + " 300 545 262");
      chk.style.transform = "scale(" + pop(t).toFixed(4) + ")";
      setBlur(tg, tBlur(t)); tg.style.opacity = tOp(t);
    }} }});
  window.__timelines[TLID] = tl;
""", events={"whoosh": [w8["wmid"]], "chime": [w8["ok"]]})

# ---------------- write projects ----------------
events_abs = []
for cid, c in COMPS.items():
    d = f"{G}/{cid}"; os.makedirs(d, exist_ok=True)
    for f in ["gsap.min.js", "scene.js"]: shutil.copy(f"{G}/shared/{f}", d)
    for sub in ["fonts", "img"]:
        if os.path.exists(f"{d}/{sub}"): shutil.rmtree(f"{d}/{sub}")
        shutil.copytree(f"{G}/shared/{sub}", f"{d}/{sub}")
    html = (HEAD.replace("__ID__", cid).replace("__DUR__", f"{c['dur']:.4f}").replace("__STAGE__", c["stage"])
            .replace("__CSS__", c["css"]).replace("__WORLD__", c["world"]).replace("__JS__", c["js"].replace("TLID", json.dumps(cid))))
    open(f"{d}/index.html", "w").write(html)
    json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"assets": "img"}}, open(f"{d}/hyperframes.json", "w"))
    seg = {"g1": 1, "g2": 2, "g4": 4, "g5": 5, "g7": 7, "g8": 8}[cid]
    for kind, ts in c["events"].items():
        for t in ts: events_abs.append({"comp": cid, "kind": kind, "t_rel": t, "t": round(SEG[seg]["t0"] + t, 4)})
json.dump(events_abs, open(f"{E}/work/graphic_events.json", "w"), indent=1)
print(json.dumps(events_abs, indent=1))
