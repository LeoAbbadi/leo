/* Deterministic Liquid Glass scene runtime for the HyperFrames compositions.
   Every visual property is a pure function of composition time t. One paused GSAP
   timeline holds a single linear driver tween whose modifier evaluates the scene,
   so any seek renders the exact frame. */
(function () {
  const E = (n) => (typeof n === "function" ? n : gsap.parseEase(n || "none"));
  function K(keys) {
    return function (t) {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        const k1 = keys[i], k0 = keys[i - 1];
        if (t <= k1[0]) {
          const span = k1[0] - k0[0], p = span <= 0 ? 1 : E(k1[2])((t - k0[0]) / span);
          if (Array.isArray(k0[1])) return k0[1].map((a, j) => a + (k1[1][j] - a) * p);
          return k0[1] + (k1[1] - k0[1]) * p;
        }
      }
      return keys[keys.length - 1][1];
    };
  }
  const camFor = (P, S, s, A) => [P[0] - (S[0] - A[0]) / s, P[1] - (S[1] - A[1]) / s, s];
  const setBlur = (el, px) => { el.style.filter = px > 0.05 ? "blur(" + px.toFixed(2) + "px)" : "none"; };
  const money = (v, sign) => (sign ? (v >= 0 ? "+" : "−") : "") + Math.abs(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
  function place(el, o) {
    const x = o.x || 0, y = o.y || 0, s = o.s === undefined ? 1 : o.s, r = o.r || 0;
    el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + r.toFixed(3) + "deg) scale(" + s.toFixed(4) + ")";
    if (o.o !== undefined) el.style.opacity = Math.max(0, Math.min(1, o.o)).toFixed(3);
    if (o.b !== undefined) setBlur(el, o.b);
  }
  // slow organic background, continuous across segments (absolute video time T)
  function background(el, T) {
    const p = (a, f, ph) => a * Math.sin(2 * Math.PI * (T / f) + ph);
    const g = [
      "radial-gradient(60% 45% at " + (28 + p(10, 37, 0)).toFixed(2) + "% " + (22 + p(8, 43, 1)).toFixed(2) + "%, rgba(126,235,255,0.85) 0%, rgba(126,235,255,0) 70%)",
      "radial-gradient(70% 50% at " + (78 + p(9, 41, 2)).toFixed(2) + "% " + (40 + p(10, 47, 3)).toFixed(2) + "%, rgba(191,228,255,0.80) 0%, rgba(191,228,255,0) 70%)",
      "radial-gradient(65% 45% at " + (35 + p(12, 53, 4)).toFixed(2) + "% " + (78 + p(8, 39, 5)).toFixed(2) + "%, rgba(42,107,255,0.55) 0%, rgba(42,107,255,0) 72%)",
      "radial-gradient(55% 40% at " + (80 + p(8, 45, 6)).toFixed(2) + "% " + (88 + p(6, 51, 1.5)).toFixed(2) + "%, rgba(0,229,255,0.45) 0%, rgba(0,229,255,0) 70%)",
      "linear-gradient(" + (160 + p(8, 60, 2.2)).toFixed(2) + "deg, #6CC4FF 0%, #4C9EFF 55%, #3E86F5 100%)"];
    el.style.background = g.join(",");
  }
  function Scene(cfg) {
    const A = cfg.anchor, world = document.getElementById("world"), gblur = document.getElementById("mbg"), bg = document.getElementById("bgfx");
    const h = 1 / 960;
    function render(t) {
      t = Math.max(0, Math.min(cfg.duration, t));
      background(bg, cfg.t0 + t);
      const c = cfg.cam(t);
      world.style.transform = "translate(" + (A[0] - c[0] * c[2]).toFixed(3) + "px," + (A[1] - c[1] * c[2]).toFixed(3) + "px) scale(" + c[2].toFixed(5) + ")";
      const ca = cfg.cam(Math.max(0, t - h)), cb = cfg.cam(Math.min(cfg.duration, t + h)), dt = Math.min(cfg.duration, t + h) - Math.max(0, t - h);
      const vx = ((cb[0] - ca[0]) / dt) * c[2], vy = ((cb[1] - ca[1]) / dt) * c[2], vs = (Math.abs(cb[2] - ca[2]) / dt / c[2]) * 450;
      let sx = Math.min(40, (0.29 * (Math.abs(vx) + vs) * 0.75) / 60), sy = Math.min(40, (0.29 * (Math.abs(vy) + vs) * 0.75) / 60);
      if (Math.max(sx, sy) < 0.35) { sx = 0; sy = 0; }
      if (!sx && !sy) world.style.filter = "none";
      else { gblur.setAttribute("stdDeviation", sx.toFixed(2) + " " + sy.toFixed(2)); world.style.filter = "url(#mb)"; }
      window.__hfSceneState = { t: t, cam: c, sigma: [sx, sy] };
      if (cfg.update) cfg.update(t, c);
    }
    const proxy = { t: 0 }, tl = gsap.timeline({ paused: true });
    tl.to(proxy, { t: cfg.duration, duration: cfg.duration, ease: "none", modifiers: { t: function (v) { render(parseFloat(v)); return v; } } }, 0);
    render(0); window.__hfRender = render;
    return tl;
  }
  window.HF = { E, K, camFor, setBlur, money, place, Scene };
})();
