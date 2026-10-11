// Gera o banner do canal no YouTube (2560×1440) no visual do site:
// céu e mar do topo (o mesmo shader de src/components/HeroOcean.tsx), sem desenhos,
// e "ABBADI" em letras de vidro líquido, dentro da área segura de 1546×423 px.
//   npm run youtube:banner   → brand/youtube/
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const W = 2560;
const H = 1440;
const SAFE = { w: 1546, h: 423 }; // aparece em todos os aparelhos
const TV = { w: 2560, h: 1440 };
const DESK = { w: 2560, h: 423 };
const TEXT = "ABBADI";
const HZ = 868; // horizonte: as letras "sentam" nele

// mesmo fragment shader do site (céu, nuvens, mar, reflexo do sol)
const heroSrc = readFileSync("src/components/HeroOcean.tsx", "utf8");
// para o banner: céu azul do site e o dourado só numa faixa estreita no horizonte
// (numa área tão grande, a transição longa entre laranja e azul fica esverdeada)
const FRAG = heroSrc
  .match(/const FRAG = `([\s\S]*?)`;/)[1]
  .replace("vec3 skyMid = vec3(0.13, 0.30, 0.42);", "vec3 skyMid = vec3(0.10, 0.23, 0.42);")
  .replace("col = mix(skyLow, skyMid, smoothstep(0.0, 0.5, t));", "col = mix(skyLow, skyMid, smoothstep(0.0, 0.3, t));")
  .replace("col += vec3(1.0, 0.78, 0.55) * 0.6 * exp", "col += vec3(1.0, 0.74, 0.55) * 0.45 * exp");
const VERT = heroSrc.match(/const VERT = `([\s\S]*?)`;/)[1];
const fontUrl = "https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap";

async function fontFile() {
  const path = "brand/fonts/instrument-serif.ttf";
  try {
    readFileSync(path);
  } catch {
    mkdirSync("brand/fonts", { recursive: true });
    const css = await (await fetch(fontUrl)).text();
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)[1];
    writeFileSync(path, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return readFileSync(path).toString("base64");
}

const font = await fontFile();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

// 1) fundo: céu e mar renderizados pelo shader
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
const bg = await page.evaluate(
  ({ VERT, FRAG, W, H, HZ }) => {
    const c = document.getElementById("c");
    const gl = c.getContext("webgl", { preserveDrawingBuffer: true });
    const sh = (t, s) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, s);
      gl.compileShader(o);
      return o;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(p, n);
    gl.viewport(0, 0, W, H);
    gl.uniform2f(u("uRes"), W, H);
    gl.uniform1f(u("uTime"), 23.0);
    gl.uniform1f(u("uHz"), HZ);
    // o sol fica logo abaixo do horizonte, atrás do nome: só o brilho e o reflexo aparecem
    gl.uniform3f(u("uSunA"), W / 2 - 70, HZ + 40, 120);
    gl.uniform3f(u("uSunB"), W / 2 + 70, HZ + 30, 130);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return c.toDataURL("image/png");
  },
  { VERT, FRAG, W, H, HZ },
);

// 2) nome em vidro líquido por cima (refrata o próprio fundo)
const html = `<!doctype html><html><head><style>
@font-face { font-family: IS; src: url(data:font/ttf;base64,${font}); }
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #050c16; }
.layer { position: absolute; inset: 0; }
.grain { opacity: .06; mix-blend-mode: overlay; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
.edge { background:
  radial-gradient(120% 90% at 50% 58%, transparent 55%, rgba(3,8,16,.55) 100%),
  linear-gradient(180deg, rgba(3,8,16,.35), transparent 22%, transparent 80%, rgba(3,8,16,.45)); }
text { font-family: IS, serif; font-size: 372px; letter-spacing: 34px; }
</style></head><body>
<img class="layer" src="${bg}" width="${W}" height="${H}">
<div class="layer edge"></div>
<svg class="layer" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glass" x="-5%" y="-25%" width="110%" height="150%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="bump"/>
      <feImage href="${bg}" x="-30" y="-30" width="${W}" height="${H}" preserveAspectRatio="none" result="bg"/>
      <feGaussianBlur in="bg" stdDeviation="2" result="bgsoft"/>
      <feDisplacementMap in="bgsoft" in2="bump" scale="60" xChannelSelector="A" yChannelSelector="A" result="bent"/>
      <feComposite in="bent" in2="SourceAlpha" operator="in" result="fill"/>
      <feColorMatrix in="fill" type="matrix" values="1.15 0 0 0 0.08  0 1.15 0 0 0.09  0 0 1.15 0 0.11  0 0 0 0.9 0" result="fillLit"/>
      <feSpecularLighting in="bump" surfaceScale="6" specularConstant="1.05" specularExponent="34" lighting-color="#ffffff" result="spec">
        <fePointLight x="${W * 0.35}" y="-500" z="1100"/>
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
      <feMerge><feMergeNode in="fillLit"/><feMergeNode in="specIn"/></feMerge>
    </filter>
    <filter id="shadow" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
    <filter id="ripple" x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".26"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="reflMask" maskUnits="userSpaceOnUse"><rect x="0" y="${HZ}" width="${W}" height="300" fill="url(#reflFade)"/></mask>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
      <stop offset=".6" stop-color="#ffffff" stop-opacity=".35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".15"/>
    </linearGradient>
  </defs>
  <g id="word">
    <text x="${W / 2}" y="${HZ - 6}" text-anchor="middle" fill="#020610" opacity=".55" filter="url(#shadow)" transform="translate(0 24)">${TEXT}</text>
    <text x="${W / 2}" y="${HZ - 6}" text-anchor="middle" fill="#fff" filter="url(#glass)">${TEXT}</text>
    <text x="${W / 2}" y="${HZ - 6}" text-anchor="middle" fill="none" stroke="url(#rim)" stroke-width="2.2">${TEXT}</text>
  </g>
  <g mask="url(#reflMask)" filter="url(#ripple)">
    <text x="${W / 2}" y="${HZ - 6}" text-anchor="middle" fill="#ffe2c8" transform="translate(0 ${2 * HZ + 6}) scale(1 -1)">${TEXT}</text>
  </g>
</svg>
<div class="layer grain"></div>
</body></html>`;
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

// confere se o nome cabe na área segura
const box = await page.evaluate(() => {
  const t = document.querySelector("#word text:nth-child(2)").getBBox();
  return { x: t.x, y: t.y, w: t.width, h: t.height };
});
const safeX = (W - SAFE.w) / 2;
const safeY = (H - SAFE.h) / 2;
const fits = box.x >= safeX && box.x + box.w <= safeX + SAFE.w && box.y >= safeY - 40 && box.y + box.h <= safeY + SAFE.h + 40;
console.log("nome:", box, "área segura:", { x: safeX, y: safeY, ...SAFE }, fits ? "cabe ✓" : "NÃO CABE");

mkdirSync("brand/youtube", { recursive: true });
const png = "brand/youtube/banner-youtube-abbadi.png";
await page.screenshot({ path: png });

// guia: mostra o que aparece na TV, no computador e no celular
await page.evaluate(
  ({ W, H, SAFE, DESK }) => {
    const g = document.createElement("div");
    g.style.cssText = "position:absolute;inset:0;font:600 34px system-ui;color:#fff";
    const box = (w, h, color, label) =>
      `<div style="position:absolute;left:${(W - w) / 2}px;top:${(H - h) / 2}px;width:${w}px;height:${h}px;border:4px dashed ${color};box-sizing:border-box"><span style="position:absolute;left:12px;top:8px;background:${color};color:#000;padding:4px 10px;border-radius:6px">${label}</span></div>`;
    g.innerHTML =
      box(W, H, "#9ad", "TV (2560×1440)") +
      box(DESK.w, DESK.h, "#ffb46a", "Computador (2560×423)") +
      box(SAFE.w, SAFE.h, "#4cd69b", "Todos os aparelhos (1546×423)");
    document.body.appendChild(g);
  },
  { W, H, SAFE, DESK, TV },
);
await page.screenshot({ path: "brand/youtube/guia-areas-do-banner.png" });
await browser.close();

// versão JPG (bem mais leve; o YouTube aceita até 6 MB)
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", png, "-q:v", "2", "brand/youtube/banner-youtube-abbadi.jpg"]);
console.log("gerado em brand/youtube/");
