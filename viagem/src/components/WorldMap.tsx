import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { places, routes, type Place } from "../content/places";
import world from "../content/worldDots.json";
import { fmtDate } from "../lib/format";
import { usePathFollower } from "./Logo";

/**
 * Mapa de pontinhos (Américas, Atlântico, Europa e África) com as rotas de vocês.
 * Projeção de Miller, recortada no Atlântico para as rotas ficarem grandes.
 */

const W = 1000;
const { bounds, dots } = world as { bounds: { west: number; east: number; south: number; north: number }; dots: [number, number][] };

const millerY = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + (0.4 * lat * Math.PI) / 180));
const yTop = millerY(bounds.north);
const yBottom = millerY(bounds.south);
const scale = W / (((bounds.east - bounds.west) * Math.PI) / 180);
const H = Math.round((yTop - yBottom) * scale);

export const project = (lon: number, lat: number) => ({
  x: (((lon - bounds.west) * Math.PI) / 180) * scale,
  y: (yTop - millerY(lat)) * scale,
});

function arc(a: Place, b: Place) {
  const p = project(a.lon, a.lat);
  const q = project(b.lon, b.lat);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2;
  const dist = Math.hypot(q.x - p.x, q.y - p.y);
  // curva para cima, proporcional à distância
  const lift = Math.min(260, dist * 0.42);
  const nx = -(q.y - p.y) / dist;
  const ny = (q.x - p.x) / dist;
  const sign = ny > 0 ? -1 : 1;
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${(mx + nx * lift * sign).toFixed(1)} ${(my + ny * lift * sign).toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
}

function Route({ d, delay, start }: { d: string; delay: number; start: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const progress = useMotionValue(0);
  usePathFollower(pathRef, planeRef, progress);
  const planeOpacity = useTransform(progress, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (!start) return;
    let stop = false;
    let timer: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const fly = (wait: number) => {
      progress.set(0);
      controls = animate(progress, 1, { duration: 2.6, delay: wait, ease: [0.45, 0, 0.25, 1] });
      controls.then(() => {
        if (!stop) timer = window.setTimeout(() => fly(0), 4200);
      });
    };
    fly(delay);
    return () => {
      stop = true;
      controls?.stop();
      window.clearTimeout(timer);
    };
  }, [start, delay, progress]);

  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      <motion.path
        d={d}
        className="map-route"
        initial={{ pathLength: 0 }}
        animate={start ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.6, delay, ease: [0.65, 0, 0.35, 1] }}
      />
      <path d={d} className="map-route-dots" />
      <motion.g ref={planeRef} style={{ opacity: planeOpacity }}>
        <path d="M-9 -6.5 L9 0 L-9 6.5 L-4.6 0 Z" className="map-plane" />
      </motion.g>
    </g>
  );
}

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [active, setActive] = useState<string>("dublin");
  const byId = useMemo(() => Object.fromEntries(places.map((p) => [p.id, p])), []);
  const projected = useMemo(() => dots.map(([lon, lat]) => project(lon, lat)), []);
  const current = byId[active];

  return (
    <div className="map" ref={ref}>
      <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa com as rotas: Brasil para Dublin e Dublin para Paris">
        <g className="map-dots">
          {projected.map((p, i) => (
            <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.3" />
          ))}
        </g>
        {routes.map(([a, b], i) => (
          <Route key={`${a}-${b}`} d={arc(byId[a], byId[b])} delay={0.3 + i * 1.1} start={inView} />
        ))}
        {places.map((pl) => {
          const p = project(pl.lon, pl.lat);
          const on = pl.id === active;
          return (
            <g
              key={pl.id}
              className={`map-pin map-pin-${pl.kind} ${on ? "is-on" : ""}`}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
              tabIndex={0}
              role="button"
              aria-pressed={on}
              aria-label={`${pl.city}: ${pl.note}`}
              onClick={() => setActive(pl.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(pl.id))}
              onPointerEnter={() => setActive(pl.id)}
            >
              <g className="map-pin-body">
                <circle className="map-pin-pulse" r="16" />
                <circle className="map-pin-hit" r="22" />
                <circle className="map-pin-dot" r="7" />
                <text className="map-pin-code" y="-16" textAnchor="middle">
                  {pl.iata}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      {current && (
        <motion.div
          key={current.id}
          className="map-card"
          initial={{ y: 10, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <span className="eyebrow">
            {current.kind === "casa" ? "Casa" : current.kind === "base" ? "Onde moramos" : "Viagem"}
            {current.date ? ` · ${current.date.length > 7 ? fmtDate(current.date) : current.date.split("-").reverse().join("/")}` : ""}
          </span>
          <strong>
            {current.city}
            {current.country !== current.city ? `, ${current.country}` : ""}
          </strong>
          <span>{current.note}</span>
        </motion.div>
      )}
    </div>
  );
}
