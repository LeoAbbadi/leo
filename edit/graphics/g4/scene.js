/* Shared deterministic scene runtime for the HyperFrames compositions.
   Every visual property is a pure function of composition time t.
   One paused GSAP timeline holds a single linear "driver" tween; its modifier
   evaluates the scene at the tween's current time, so any seek (with or
   without suppressed events) renders the exact frame. */
(function () {
  const W = 1080, H = 1920;
  const E = (n) => (typeof n === "function" ? n : gsap.parseEase(n || "none"));

  // keyframe track: [[t, value, ease], ...]; ease applies to the segment ending at that key
  function K(keys) {
    return function (t) {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        const k1 = keys[i], k0 = keys[i - 1];
        if (t <= k1[0]) {
          const span = k1[0] - k0[0];
          const p = span <= 0 ? 1 : E(k1[2])((t - k0[0]) / span);
          if (Array.isArray(k0[1])) return k0[1].map((a, j) => a + (k1[1][j] - a) * p);
          return k0[1] + (k1[1] - k0[1]) * p;
        }
      }
      return keys[keys.length - 1][1];
    };
  }

  // camera value [cx, cy, s] that puts world point P at screen point S with scale s
  function camFor(P, S, s, A) {
    return [P[0] - (S[0] - A[0]) / s, P[1] - (S[1] - A[1]) / s, s];
  }

  function setBlur(el, px) {
    el.style.filter = px > 0.05 ? "blur(" + px.toFixed(2) + "px)" : "none";
  }

  function Scene(cfg) {
    const A = cfg.anchor;
    const world = document.getElementById(cfg.worldId);
    const gblur = document.getElementById(cfg.blurNodeId);
    const h = 1 / 960;
    let lastSigma = [0, 0];

    function render(t) {
      t = Math.max(0, Math.min(cfg.duration, t));
      const c = cfg.cam(t);
      world.style.transform =
        "translate(" + (A[0] - c[0] * c[2]).toFixed(3) + "px," + (A[1] - c[1] * c[2]).toFixed(3) + "px) scale(" + c[2].toFixed(5) + ")";
      // camera speed on screen (px/s): translation term + scale term at a 450 px radius
      const ca = cfg.cam(Math.max(0, t - h)), cb = cfg.cam(Math.min(cfg.duration, t + h));
      const dt = Math.min(cfg.duration, t + h) - Math.max(0, t - h);
      const vx = ((cb[0] - ca[0]) / dt) * c[2], vy = ((cb[1] - ca[1]) / dt) * c[2];
      const vs = (Math.abs(cb[2] - ca[2]) / dt / c[2]) * 450;
      // sigma = 0.29 * speed * 0.75 / 60, capped at 40 px; only while moving
      let sx = Math.min(40, (0.29 * (Math.abs(vx) + vs) * 0.75) / 60);
      let sy = Math.min(40, (0.29 * (Math.abs(vy) + vs) * 0.75) / 60);
      if (Math.max(sx, sy) < 0.35) { sx = 0; sy = 0; }
      if (sx === 0 && sy === 0) world.style.filter = "none";
      else { gblur.setAttribute("stdDeviation", sx.toFixed(2) + " " + sy.toFixed(2)); world.style.filter = "url(#" + cfg.filterId + ")"; }
      lastSigma = [sx, sy];
      window.__hfSceneState = { t: t, cam: c, sigma: lastSigma };
      if (cfg.update) cfg.update(t, c);
    }

    const proxy = { t: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.to(proxy, {
      t: cfg.duration, duration: cfg.duration, ease: "none",
      modifiers: { t: function (v) { render(parseFloat(v)); return v; } },
    }, 0);
    render(0);
    window.__hfRender = render;
    return tl;
  }

  // bodysuit outline (viewBox 0 0 300 420): list of cubic segments, interpolatable
  const SUIT_SNUG = [
    [98, 92], [120, 132, 180, 132, 202, 92], [210, 120, 214, 150, 208, 178], [203, 205, 199, 222, 200, 246],
    [202, 280, 214, 300, 214, 330], [214, 352, 206, 372, 196, 384], [184, 398, 170, 412, 150, 416],
    [130, 412, 116, 398, 104, 384], [94, 372, 86, 352, 86, 330], [86, 300, 98, 280, 100, 246],
    [101, 222, 97, 205, 92, 178], [86, 150, 90, 120, 98, 92],
  ];
  const SUIT_LOOSE = [
    [94, 92], [118, 136, 182, 136, 206, 92], [220, 122, 226, 152, 224, 182], [222, 212, 220, 230, 224, 254],
    [228, 286, 236, 306, 232, 334], [230, 356, 216, 376, 202, 388], [186, 402, 170, 414, 150, 418],
    [130, 414, 114, 402, 98, 388], [84, 376, 70, 356, 68, 334], [64, 306, 72, 286, 76, 254],
    [80, 230, 78, 212, 76, 182], [74, 152, 80, 122, 94, 92],
  ];
  function suitPath(p) {
    const pts = SUIT_SNUG.map((seg, i) => seg.map((v, j) => SUIT_LOOSE[i][j] + (v - SUIT_LOOSE[i][j]) * p));
    let d = "M" + pts[0][0] + " " + pts[0][1];
    for (let i = 1; i < pts.length; i++) d += " C" + pts[i].map((v) => v.toFixed(2)).join(" ");
    return d + " Z";
  }

  window.HF = { W, H, E, K, camFor, setBlur, Scene, suitPath };
})();
