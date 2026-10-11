import { motion } from "motion/react";
import { Link } from "react-router";
import land from "../content/worldLand.json";
import type { Stop } from "../content/now";
import { daysSince, fmtShort } from "../lib/format";
import { useLocalTime, useStops, useWeather } from "../lib/now";
import { Glass } from "./Glass";
import { project } from "./WorldMap";

/** Recorte do mapa-múndi em volta de um ponto, com o pino pulsando. */
export function MiniMap({
  stop,
  prev,
  zoom = 130,
  className = "",
  cover = false,
}: {
  stop: Stop;
  prev?: Stop;
  zoom?: number;
  className?: string;
  /** Preenche o espaço todo (corta as bordas) em vez de caber inteiro. */
  cover?: boolean;
}) {
  const p = project(stop.lon, stop.lat);
  const hw = zoom;
  const hh = zoom * 0.62;
  const x = Math.min(Math.max(p.x - hw, 0), (land as { width: number }).width - hw * 2);
  const y = Math.min(Math.max(p.y - hh, 0), (land as { height: number }).height - hh * 2);
  const q = prev ? project(prev.lon, prev.lat) : null;
  const arc = q ? `M${q.x} ${q.y} Q${(q.x + p.x) / 2} ${Math.min(q.y, p.y) - Math.abs(q.x - p.x) * 0.3} ${p.x} ${p.y}` : "";
  const r = zoom / 40;
  return (
    <svg
      className={`minimap ${className}`}
      viewBox={`${x} ${y} ${hw * 2} ${hh * 2}`}
      preserveAspectRatio={cover ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label={`Mapa: ${stop.city}, ${stop.country}`}
    >
      <defs>
        <pattern id="mm-dots" width={r * 1.6} height={r * 1.6} patternUnits="userSpaceOnUse">
          <circle cx={r * 0.8} cy={r * 0.8} r={r * 0.22} fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <path d={(land as { d: string }).d} className="minimap-land" />
      <path d={(land as { d: string }).d} fill="url(#mm-dots)" />
      {arc && (
        <motion.path
          d={arc}
          fill="none"
          stroke="#ffb46a"
          strokeWidth={r * 0.35}
          strokeDasharray={`${r * 0.9} ${r * 0.9}`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
      <circle className="minimap-pulse" cx={p.x} cy={p.y} r={r * 2.2} />
      <circle cx={p.x} cy={p.y} r={r} fill="#ffb46a" stroke="#fff" strokeWidth={r * 0.35} />
    </svg>
  );
}

/** Cartão de vidro do topo: onde vocês estão neste momento. */
export function NowCard() {
  const stops = useStops();
  const now = stops[0];
  const time = useLocalTime(now.timezone);
  const weather = useWeather(now.lat, now.lon);
  const days = daysSince(now.arrived);

  return (
    <Glass className="nowcard" radius={28} bezel={24} strength={34} blur={3}>
      <div className="nowcard-head">
        <span className="live">
          <i aria-hidden="true" /> Aonde estamos agora?
        </span>
        <span className="nowcard-upd">Atualizado a cada viagem</span>
      </div>
      <MiniMap stop={now} prev={stops[1]} zoom={110} className="nowcard-map" />
      <div className="nowcard-place">
        <strong>{now.city}</strong>
        <span>{now.country}</span>
      </div>
      <dl className="nowcard-facts">
        <div>
          <dt>Hora local</dt>
          <dd className="mono">{time}</dd>
        </div>
        <div>
          <dt>{weather ? weather.text || "Tempo" : "Desde"}</dt>
          <dd>{weather ? `${weather.temp}°C` : fmtShort(now.arrived)}</dd>
        </div>
        <div>
          <dt>Aqui há</dt>
          <dd>
            {days} {days === 1 ? "dia" : "dias"}
          </dd>
        </div>
      </dl>
      {now.note && <p className="nowcard-note">{now.note}</p>}
      <Link className="btn btn-sun btn-lg btn-block" to="/agora">
        Ver onde estamos <span aria-hidden="true">→</span>
      </Link>
    </Glass>
  );
}
