// Gera .preview/ a partir de dist/ no formato da prévia hospedada no claude.ai:
// sem <!doctype>, <html>, <head> e <body> (a plataforma adiciona o esqueleto).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
const keep = head
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !/^<meta (charset|name="viewport")/.test(l))
  .join("\n");

// Nomes fixos (app.js / app.css) para cada nova publicação substituir a anterior.
rmSync(".preview", { recursive: true, force: true });
mkdirSync(".preview/assets", { recursive: true });
let page = `${keep}\n${body.trim()}\n`;
for (const [, file, ext] of page.matchAll(/\.\/assets\/([\w.-]+\.(js|css))/g)) {
  cpSync(`dist/assets/${file}`, `.preview/assets/app.${ext}`);
  page = page.replace(`./assets/${file}`, `./assets/app.${ext}`);
}
writeFileSync(".preview/index.html", page);
console.log("Prévia gerada em .preview/");
