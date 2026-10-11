// Gera src/content/worldDots.json: pontinhos do mapa (Américas, Atlântico, Europa e África).
// Rode com `npm run worldmap` só se quiser mudar o recorte ou a densidade.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);

// Recorte em graus e passo da grade
const BOUNDS = { west: -88, east: 34, south: -40, north: 63 };
const STEP = 1.3;

const polygons = land.features.flatMap((f) =>
  f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates,
);

function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    // arestas que cruzam o antimeridiano (ex.: Fiji) estragariam a linha inteira
    if (Math.abs(xj - xi) > 180) continue;
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function onLand(lon, lat) {
  return polygons.some(([outer, ...holes]) => inRing(lon, lat, outer) && !holes.some((h) => inRing(lon, lat, h)));
}

const dots = [];
for (let lat = BOUNDS.north; lat >= BOUNDS.south; lat -= STEP) {
  // compensa o achatamento perto dos polos
  const stepLon = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.45);
  for (let lon = BOUNDS.west; lon <= BOUNDS.east; lon += stepLon) {
    if (onLand(lon, lat)) dots.push([+lon.toFixed(2), +lat.toFixed(2)]);
  }
}

writeFileSync("src/content/worldDots.json", JSON.stringify({ bounds: BOUNDS, dots }));
console.log(`${dots.length} pontos gravados em src/content/worldDots.json`);
