// Gera os arquivos da marca em brand/: símbolo, logotipo (texto em curvas),
// versões clara, escura e monocromática, favicon e a versão animada (SVG/SMIL).
// Rode com `npm run brand`.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const OUT = "brand";
mkdirSync(OUT, { recursive: true });

const C = {
  ink: "#0B1626",
  paper: "#F3F6FB",
  sunA: "#FFB46A",
  sunB: "#FF6A4D",
  seaA: "#3D7BFF",
  seaB: "#1F4FCC",
  // tons para fundo escuro
  sunAd: "#FFB878",
  sunBd: "#FF7552",
  seaAd: "#6FA3FF",
  seaBd: "#3D6FE8",
};

// Geometria do símbolo (mesma de src/components/Logo.tsx)
const M = {
  helena: { cx: 47, cy: 72, r: 22 },
  leo: { cx: 76, cy: 64, r: 26 },
  horizon: { x: 12, y: 82, w: 96, h: 5 },
  clipY: 80,
  route: "M14 72 C 16 40 34 20 70 14.8",
  // avião no fim da rota, inclinado como a tangente
  planeAt: { x: 70, y: 14.8, angle: -8.2 },
  plane: "M-5.6 -4.3 L5.6 0 L-5.6 4.3 L-3.1 0 Z",
};

/* ---------- texto em curvas ---------- */

/** Baixa a fonte do Google Fonts (TTF) na primeira vez; fica em brand/fonts/ (fora do git). */
async function font(file, cssQuery) {
  const path = `brand/fonts/${file}`;
  if (!existsSync(path)) {
    mkdirSync("brand/fonts", { recursive: true });
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${cssQuery}`)).text();
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) throw new Error(`Não achei o arquivo TTF de ${cssQuery}`);
    writeFileSync(path, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return opentype.loadSync(path);
}

const bricolage = await font("bricolage-600.ttf", "Bricolage+Grotesque:opsz,wght@96,600");
const serif = await font("instrument-serif-italic.ttf", "Instrument+Serif:ital@1");

/** "leo&helena" com o & em serifa itálica, como no site. Tamanho 100, linha de base em y=0. */
function wordmark() {
  const size = 100;
  const tracking = -0.04 * size;
  const runs = [
    { font: bricolage, text: "leo", size, track: tracking },
    { font: serif, text: "&", size: size * 1.12, track: 0, pad: 0.03 * size },
    { font: bricolage, text: "helena", size, track: tracking },
  ];
  let x = 0;
  const paths = [];
  for (const run of runs) {
    x += run.pad ?? 0;
    const glyphs = run.font.stringToGlyphs(run.text);
    const scale = run.size / run.font.unitsPerEm;
    glyphs.forEach((g, i) => {
      const p = g.getPath(x, 0, run.size);
      paths.push({ d: p.toPathData(2), amp: run.font === serif, box: p.getBoundingBox() });
      x += g.advanceWidth * scale + run.track;
      if (glyphs[i + 1]) x += run.font.getKerningValue(g, glyphs[i + 1]) * scale;
    });
    x += run.pad ?? 0;
  }
  const box = paths.reduce(
    (b, p) => ({ x1: Math.min(b.x1, p.box.x1), y1: Math.min(b.y1, p.box.y1), x2: Math.max(b.x2, p.box.x2), y2: Math.max(b.y2, p.box.y2) }),
    { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
  );
  return { paths, box, width: x };
}

const WM = wordmark();

/* ---------- peças em SVG ---------- */

function defs(id, dark, gradients = true) {
  const [sa, sb, ba, bb] = dark ? [C.sunAd, C.sunBd, C.seaAd, C.seaBd] : [C.sunA, C.sunB, C.seaA, C.seaB];
  return `<defs>${
    gradients
      ? `
  <linearGradient id="${id}-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sa}"/><stop offset="1" stop-color="${sb}"/></linearGradient>
  <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ba}"/><stop offset="1" stop-color="${bb}"/></linearGradient>`
      : ""
  }
  <clipPath id="${id}-hz"><rect x="0" y="0" width="120" height="${M.clipY}"/></clipPath>
  <clipPath id="${id}-hl"><circle cx="${M.helena.cx}" cy="${M.helena.cy}" r="${M.helena.r}"/></clipPath>
</defs>`;
}

/** Símbolo em coordenadas próprias (viewBox 6 4 108 88). */
function markBody({ id, ink, dark = false, route = true, mono = false }) {
  const { helena: H, leo: L, horizon: Z } = M;
  const suns = mono
    ? `<mask id="${id}-knock" maskUnits="userSpaceOnUse"><rect width="120" height="120" fill="#fff"/><circle cx="${L.cx}" cy="${L.cy}" r="${L.r}" fill="#000" clip-path="url(#${id}-hl)"/></mask>
  <g clip-path="url(#${id}-hz)" mask="url(#${id}-knock)" fill="${ink}"><circle cx="${H.cx}" cy="${H.cy}" r="${H.r}"/><circle cx="${L.cx}" cy="${L.cy}" r="${L.r}"/></g>`
    : `<g clip-path="url(#${id}-hz)">
    <circle cx="${H.cx}" cy="${H.cy}" r="${H.r}" fill="url(#${id}-sun)"/>
    <circle cx="${L.cx}" cy="${L.cy}" r="${L.r}" fill="url(#${id}-sea)"/>
    <circle cx="${L.cx}" cy="${L.cy}" r="${L.r}" fill="${ink}" clip-path="url(#${id}-hl)"/>
  </g>`;
  const flight = route
    ? `<path d="${M.route}" fill="none" stroke="${ink}" stroke-width="2.6" stroke-dasharray="0.4 6" stroke-linecap="round"/>
  <path d="${M.plane}" fill="${ink}" transform="translate(${M.planeAt.x} ${M.planeAt.y}) rotate(${M.planeAt.angle})"/>`
    : "";
  return `${defs(id, dark, !mono)}
  ${suns}
  <rect x="${Z.x}" y="${Z.y}" width="${Z.w}" height="${Z.h}" rx="${Z.h / 2}" fill="${ink}"/>
  ${flight}`;
}

// os pontinhos da rota terminam antes do avião
const ROUTE_MASK = (id) =>
  `<mask id="${id}-rt" maskUnits="userSpaceOnUse"><path d="${M.route}" fill="none" stroke="#fff" stroke-width="6" pathLength="1" stroke-dasharray="0.86 1"/></mask>`;

function markSvg(opts) {
  const { compact } = opts;
  const vb = compact ? "8 34 104 58" : "6 4 108 88";
  let body = markBody({ ...opts, route: !compact });
  body = body.replace(
    `<path d="${M.route}" fill="none" stroke="${opts.ink}"`,
    `${ROUTE_MASK(opts.id)}<path mask="url(#${opts.id}-rt)" d="${M.route}" fill="none" stroke="${opts.ink}"`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Leo &amp; Helena">
  ${body}
</svg>
`;
}

function wordmarkGroup(ink, amp) {
  return WM.paths.map((p) => `<path d="${p.d}" fill="${p.amp ? amp : ink}"/>`).join("\n    ");
}

/** Símbolo + logotipo lado a lado, texto apoiado na linha do horizonte. */
function horizontalSvg({ id, ink, amp, dark }) {
  const s = 2.08; // escala do símbolo para fonte 100
  const markW = 108 * s;
  const gap = 46;
  const baseline = (87 - 4) * s;
  const textX = markW + gap - WM.box.x1;
  const width = markW + gap + (WM.box.x2 - WM.box.x1);
  const height = 88 * s;
  let mark = markBody({ id, ink, dark });
  mark = mark.replace(
    `<path d="${M.route}" fill="none" stroke="${ink}"`,
    `${ROUTE_MASK(id)}<path mask="url(#${id}-rt)" d="${M.route}" fill="none" stroke="${ink}"`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(1)} ${height.toFixed(1)}" role="img" aria-label="Leo &amp; Helena">
  <g transform="scale(${s}) translate(-6 -4)">
  ${mark}
  </g>
  <g transform="translate(${textX.toFixed(1)} ${baseline.toFixed(1)})">
    ${wordmarkGroup(ink, amp)}
  </g>
</svg>
`;
}

/** Símbolo em cima, logotipo embaixo, centralizados. */
function stackedSvg({ id, ink, amp, dark }) {
  const textW = WM.box.x2 - WM.box.x1;
  const s = 3;
  const markW = 108 * s;
  const width = Math.max(textW, markW);
  const markH = 88 * s;
  const gap = 40;
  const textTop = markH + gap;
  const baseline = textTop - WM.box.y1;
  const height = baseline + WM.box.y2;
  let mark = markBody({ id, ink, dark });
  mark = mark.replace(
    `<path d="${M.route}" fill="none" stroke="${ink}"`,
    `${ROUTE_MASK(id)}<path mask="url(#${id}-rt)" d="${M.route}" fill="none" stroke="${ink}"`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(1)} ${height.toFixed(1)}" role="img" aria-label="Leo &amp; Helena">
  <g transform="translate(${((width - markW) / 2).toFixed(1)} 0) scale(${s}) translate(-6 -4)">
  ${mark}
  </g>
  <g transform="translate(${((width - textW) / 2 - WM.box.x1).toFixed(1)} ${baseline.toFixed(1)})">
    ${wordmarkGroup(ink, amp)}
  </g>
</svg>
`;
}

/** Só o logotipo, com a caixa justa. */
function wordmarkSvg({ ink, amp }) {
  const pad = 4;
  const { x1, y1, x2, y2 } = WM.box;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(x1 - pad).toFixed(1)} ${(y1 - pad).toFixed(1)} ${(x2 - x1 + pad * 2).toFixed(1)} ${(y2 - y1 + pad * 2).toFixed(1)}" role="img" aria-label="Leo &amp; Helena">
  ${wordmarkGroup(ink, amp)}
</svg>
`;
}

/** Ícone quadrado (app, favicon, foto de perfil). */
function iconSvg({ id, bg, ink, dark, radius = 22 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Leo &amp; Helena">
  <rect width="100" height="100" rx="${radius}" fill="${bg}"/>
  <g transform="translate(50 52) scale(0.84) translate(-60 -62.5)">
  ${markBody({ id, ink, dark, route: false })}
  </g>
</svg>
`;
}

/* ---------- versão animada (SMIL: toca até dentro de <img>) ---------- */

function animatedSvg({ id, ink, bg, dark }) {
  const { helena: H, leo: L, horizon: Z } = M;
  const D = 6; // segundos por ciclo
  const k = (t) => (t / D).toFixed(4);
  const spline = "0.16 1 0.3 1";
  // sobe com mola (aproximação por keyTimes: passa um pouco e volta)
  const rise = (cy, t0) =>
    `<animate attributeName="cy" dur="${D}s" repeatCount="indefinite" calcMode="spline"
        values="${cy + 34};${cy + 34};${cy - 2.5};${cy};${cy}" keyTimes="0;${k(t0)};${k(t0 + 0.75)};${k(t0 + 1.15)};1"
        keySplines="0 0 1 1;${spline};0.4 0 0.6 1;0 0 1 1"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 96" role="img" aria-label="Leo &amp; Helena (animado)">
  ${defs(id, dark).replace(
    `<clipPath id="${id}-hl"><circle cx="${H.cx}" cy="${H.cy}" r="${H.r}"/></clipPath>`,
    `<clipPath id="${id}-hl"><circle cx="${H.cx}" cy="${H.cy}" r="${H.r}">${rise(H.cy, 0.25)}</circle></clipPath>`,
  )}
  <mask id="${id}-rt" maskUnits="userSpaceOnUse">
    <path d="${M.route}" fill="none" stroke="#fff" stroke-width="6" pathLength="1" stroke-dasharray="1 1">
      <animate attributeName="stroke-dashoffset" dur="${D}s" repeatCount="indefinite" calcMode="spline"
        values="1;1;0.14;0.14" keyTimes="0;${k(1.15)};${k(2.35)};1" keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1"/>
    </path>
  </mask>
  ${bg ? `<rect x="-20" y="-20" width="160" height="136" fill="${bg}"/>` : ""}
  <g>
    <animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;${k(5.3)};${k(5.8)};1"/>
    <g transform="translate(0 4)">
    <g clip-path="url(#${id}-hz)">
      <circle cx="${H.cx}" cy="${H.cy}" r="${H.r}" fill="url(#${id}-sun)">${rise(H.cy, 0.25)}</circle>
      <circle cx="${L.cx}" cy="${L.cy}" r="${L.r}" fill="url(#${id}-sea)">${rise(L.cy, 0.4)}</circle>
      <circle cx="${L.cx}" cy="${L.cy}" r="${L.r}" fill="${ink}" clip-path="url(#${id}-hl)" opacity="0">
        ${rise(L.cy, 0.4)}
        <animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" values="0;0;1;1" keyTimes="0;${k(0.95)};${k(1.3)};1"/>
      </circle>
    </g>
    <rect y="${Z.y}" height="${Z.h}" rx="${Z.h / 2}" fill="${ink}" x="${Z.x}" width="${Z.w}">
      <animate attributeName="x" dur="${D}s" repeatCount="indefinite" calcMode="spline" values="${Z.x + Z.w / 2};${Z.x};${Z.x}" keyTimes="0;${k(0.6)};1" keySplines="0.65 0 0.35 1;0 0 1 1"/>
      <animate attributeName="width" dur="${D}s" repeatCount="indefinite" calcMode="spline" values="0;${Z.w};${Z.w}" keyTimes="0;${k(0.6)};1" keySplines="0.65 0 0.35 1;0 0 1 1"/>
    </rect>
    <path d="${M.route}" fill="none" stroke="${ink}" stroke-width="2.6" stroke-dasharray="0.4 6" stroke-linecap="round" mask="url(#${id}-rt)"/>
    <path d="${M.plane}" fill="${ink}" opacity="0">
      <animateMotion dur="${D}s" repeatCount="indefinite" rotate="auto" path="${M.route}" calcMode="spline"
        keyPoints="0;0;1;1" keyTimes="0;${k(1.05)};${k(2.35)};1" keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1"/>
      <animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" values="0;0;1;1" keyTimes="0;${k(1.05)};${k(1.15)};1"/>
    </path>
    </g>
  </g>
</svg>
`;
}

/* ---------- gravação ---------- */

const files = {
  "logo-simbolo.svg": markSvg({ id: "a", ink: C.ink }),
  "logo-simbolo-escuro.svg": markSvg({ id: "b", ink: C.paper, dark: true }),
  "logo-simbolo-compacto.svg": markSvg({ id: "c", ink: C.ink, compact: true }),
  "logo-simbolo-mono-preto.svg": markSvg({ id: "d", ink: C.ink, mono: true }),
  "logo-simbolo-mono-branco.svg": markSvg({ id: "e", ink: "#FFFFFF", mono: true }),
  "logo-horizontal.svg": horizontalSvg({ id: "f", ink: C.ink, amp: C.sunB }),
  "logo-horizontal-escuro.svg": horizontalSvg({ id: "g", ink: C.paper, amp: C.sunBd, dark: true }),
  "logo-vertical.svg": stackedSvg({ id: "h", ink: C.ink, amp: C.sunB }),
  "logo-vertical-escuro.svg": stackedSvg({ id: "i", ink: C.paper, amp: C.sunBd, dark: true }),
  "logo-texto.svg": wordmarkSvg({ ink: C.ink, amp: C.sunB }),
  "logo-texto-escuro.svg": wordmarkSvg({ ink: C.paper, amp: C.sunBd }),
  "icone-app.svg": iconSvg({ id: "j", bg: C.ink, ink: C.paper, dark: true }),
  "icone-app-claro.svg": iconSvg({ id: "k", bg: C.paper, ink: C.ink }),
  "logo-animado.svg": animatedSvg({ id: "l", ink: C.ink }),
  "logo-animado-escuro.svg": animatedSvg({ id: "m", ink: C.paper, bg: C.ink, dark: true }),
};

for (const [name, svg] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, svg);
writeFileSync("public/favicon.svg", iconSvg({ id: "fav", bg: C.ink, ink: C.paper, dark: true, radius: 24 }));
console.log("Gerados:", Object.keys(files).join(", "), "+ public/favicon.svg");
