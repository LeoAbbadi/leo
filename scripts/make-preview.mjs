// Gera .preview/ a partir de dist/ no formato da prévia hospedada no claude.ai:
// sem <!doctype>, <html>, <head> e <body> (a plataforma adiciona o esqueleto).
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
const keep = head
  .replace(/\s*\n\s*/g, "\n")
  .replace(/<link\s*\n/g, "<link ")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !/^<meta (charset|name="viewport")/.test(l) && !/rel="(icon|apple-touch-icon)"/.test(l))
  .join("\n");

rmSync(".preview", { recursive: true, force: true });
mkdirSync(".preview/assets", { recursive: true });
// Imagens e fontes mantêm o nome (o JS aponta para elas); JS e CSS ganham nomes
// fixos (app.js / app.css) para cada nova publicação substituir a anterior.
cpSync("dist/assets", ".preview/assets", { recursive: true });
let page = `${keep}\n${body.trim()}\n`;
for (const [, file, ext] of page.matchAll(/\.\/assets\/([\w.-]+\.(js|css))/g)) {
  rmSync(`.preview/assets/${file}`);
  cpSync(`dist/assets/${file}`, `.preview/assets/app.${ext}`);
  page = page.replace(`./assets/${file}`, `./assets/app.${ext}`);
}
writeFileSync(".preview/index.html", page);
const files = Object.fromEntries(readdirSync(".preview/assets").map((f) => [`assets/${f}`, `.preview/assets/${f}`]));
writeFileSync(".preview/files.json", JSON.stringify(files, null, 2));
console.log("Prévia gerada em .preview/", Object.keys(files).join(", "));
