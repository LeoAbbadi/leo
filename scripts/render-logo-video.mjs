// Grava a animação da logo em vídeo (MP4) para Reels, Stories e abertura de vídeos.
// Usa o Chromium do Playwright quadro a quadro (tempo exato, sem engasgos) e o FFmpeg.
//   npm run logo:video            → brand/video/logo-intro-*.mp4
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { chromium } from "playwright";

const FPS = 60;
const SECONDS = 4.6; // termina antes do esmaecer do ciclo de 6 s
const formats = [
  { name: "quadrado-claro", w: 1080, h: 1080, file: "brand/logo-animado.svg", bg: "#F3F6FB", word: "brand/logo-texto.svg" },
  { name: "quadrado-escuro", w: 1080, h: 1080, file: "brand/logo-animado-escuro.svg", bg: "#0B1626", word: "brand/logo-texto-escuro.svg" },
  { name: "vertical-escuro", w: 1080, h: 1920, file: "brand/logo-animado-escuro.svg", bg: "#0B1626", word: "brand/logo-texto-escuro.svg" },
];

mkdirSync("brand/video", { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

for (const f of formats) {
  const svg = readFileSync(f.file, "utf8");
  const word = readFileSync(f.word, "utf8").replace("<svg ", '<svg id="word" ');
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:${f.bg};display:grid;place-items:center;height:100vh;overflow:hidden">
    <div style="display:grid;justify-items:center;gap:${f.h > f.w ? 70 : 40}px">
      <div id="mark" style="width:${Math.round(f.w * 0.56)}px">${svg}</div>
      <style>#word{display:block;width:100%;height:auto;opacity:0}</style>
      <div style="width:${Math.round(f.w * 0.42)}px">${word}</div>
    </div></body></html>`);
  const dir = `brand/video/.frames-${f.name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const total = Math.round(SECONDS * FPS);
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await page.evaluate((t) => {
      const s = document.querySelector("#mark svg");
      s.pauseAnimations();
      s.setCurrentTime(t);
      // o logotipo entra depois do avião (2,2 s → 2,9 s)
      const p = Math.min(Math.max((t - 2.2) / 0.7, 0), 1);
      const e = 1 - Math.pow(1 - p, 3);
      const w = document.getElementById("word");
      w.style.opacity = String(e);
      w.style.transform = `translateY(${(1 - e) * 20}px)`;
    }, t);
    await page.screenshot({ path: `${dir}/${String(i).padStart(4, "0")}.png` });
  }
  await page.close();
  const out = `brand/video/logo-intro-${f.name}.mp4`;
  execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.png`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", out]);
  rmSync(dir, { recursive: true, force: true });
  console.log("gravado", out);
}
await browser.close();
