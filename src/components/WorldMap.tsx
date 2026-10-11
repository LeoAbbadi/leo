import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { places, routes, type Place } from "../content/places";
import land from "../content/worldLand.json";
import { fmtDate } from "../lib/format";
import { Glass } from "./Glass";
import { usePathFollower } from "./Logo";

/**
 * Mapa-múndi com os lugares por onde vocês passaram.
 * Mesma projeção (Miller) usada para gerar src/content/worldLand.json.
 */

const { width: W, height: H, north: NORTH } = land as { width: number; height: number; north: number; d: string };
const miller = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + (0.4 * lat * Math.PI) / 180));
const scale = W / (2 * Math.PI);
const yTop = miller(NORTH);

export const project = (lon: number, lat: number) => ({
  x: (((lon + 180) * Math.PI) / 180) * scale,
  y: (yTop - miller(lat)) * scale,
});

function arc(a: Place, b: Place) {
  const p = project(a.lon, a.lat);
  const q = project(b.lon, b.lat);
  const dist = Math.hypot(q.x - p.x, q.y - p.y);
  const lift = Math.min(120, dist * 0.35);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2 - lift;
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
}

function Route({ d, delay, start }: { d: string; delay: number; start: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const progress = useMotionValue(0);
  usePathFollower(pathRef, planeRef, progress);
  const planeOpacity = useTransform(progress, [0, 0.03, 0.96, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (!start) return;
    let stop = false;
    let timer: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const fly = (wait: number) => {
      progress.set(0);
      controls = animate(progress, 1, { duration: 2.4, delay: wait, ease: [0.45, 0, 0.25, 1] });
      controls.then(() => {
        if (!stop) timer = window.setTimeout(() => fly(0), 4500);
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
        transition={{ duration: 1.4, delay, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.g ref={planeRef} style={{ opacity: planeOpacity }}>
        <path d="M-6 -4.4 L6 0 L-6 4.4 L-3 0 Z" className="map-plane" />
      </motion.g>
    </g>
  );
}

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [active, setActive] = useState<string>("dublin");
  const byId = useMemo(() => Object.fromEntries(places.map((p) => [p.id, p])), []);
  const current = byId[active];

  return (
    <div className="map" ref={ref}>
      <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa-múndi com os lugares visitados e as rotas: Brasil para Dublin e Dublin para Paris">
        <defs>
          <pattern id="map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.9" className="map-dot" />
          </pattern>
        </defs>
        <path d={land.d} className="map-land" />
        <path d={land.d} fill="url(#map-dots)" />
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
                <circle className="map-pin-pulse" r="9" />
                <circle className="map-pin-hit" r="12" />
                <circle className="map-pin-dot" r="4.2" />
              </g>
            </g>
          );
        })}
      </svg>
      {current && (
        <Glass className="map-card" radius={22} bezel={16} strength={26} key={current.id}>
          <motion.div
            className="map-card-inner"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
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
            {current.album && (
              <Link to={`/paises/${current.album}`} className="map-card-link">
                Ver as fotos →
              </Link>
            )}
            {current.video && (
              <a href={current.video} target="_blank" rel="noreferrer" className="map-card-link">
                Assistir a série →
              </a>
            )}
          </motion.div>
        </Glass>
      )}
    </div>
  );
}
