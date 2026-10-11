// Gera src/content/worldLand.json: o contorno dos continentes como um caminho SVG
// (projeção de Miller, sem a Antártida). Rode com `npm run worldmap`.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);

const W = 1000;
const NORTH = 83;
const SOUTH = -57;
const miller = (lat) => 1.25 * Math.log(Math.tan(Math.PI / 4 + (0.4 * lat * Math.PI) / 180));
const scale = W / (2 * Math.PI);
const yTop = miller(NORTH);
const H = Math.round((yTop - miller(SOUTH)) * scale);

const project = ([lon, lat]) => [((lon + 180) * Math.PI) / 180 * scale, (yTop - miller(Math.max(SOUTH - 5, Math.min(NORTH + 2, lat)))) * scale];

const polygons = land.features.flatMap((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates));
let d = "";
for (const poly of polygons) {
  for (const ring of poly) {
    // Antártida fica de fora do recorte
    if (ring.every(([, lat]) => lat < SOUTH)) continue;
    let prev = null;
    ring.forEach((pt, i) => {
      const [x, y] = project(pt);
      // aresta que atravessa o antimeridiano: pula em vez de riscar o mapa inteiro
      const jump = prev && Math.abs(pt[0] - prev[0]) > 180;
      d += `${i === 0 || jump ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      prev = pt;
    });
    d += "Z";
  }
}

writeFileSync("src/content/worldLand.json", JSON.stringify({ width: W, height: H, north: NORTH, south: SOUTH, d }));
console.log(`mapa ${W}×${H}, ${(d.length / 1024).toFixed(0)} KB`);
