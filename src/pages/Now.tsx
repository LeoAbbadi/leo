import { motion } from "motion/react";
import { Link } from "react-router";
import { Glass } from "../components/Glass";
import { MiniMap } from "../components/NowCard";
import { Scene } from "../components/Postcard";
import { Reveal } from "../components/ui";
import { countries } from "../content/countries";
import { driveImage } from "../content/photos";
import { daysSince, fmtDate } from "../lib/format";
import { useLocalTime, useStops, useWeather } from "../lib/now";

export function Now() {
  const stops = useStops();
  const now = stops[0];
  const time = useLocalTime(now.timezone);
  const weather = useWeather(now.lat, now.lon);
  const days = daysSince(now.arrived);
  const albums = countries.filter((c) => c.status !== "proximo");

  return (
    <>
      <section className="now-hero on-dark">
        <div className="now-map-wrap">
          <MiniMap stop={now} prev={stops[1]} zoom={150} className="now-map" cover />
        </div>
        <div className="now-shade" aria-hidden="true" />
        <div className="now-copy">
          <span className="live">
            <i aria-hidden="true" /> Aonde estamos agora?
          </span>
          <motion.h1 key={now.city} initial={{ y: 24, opacity: 0, filter: "blur(8px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.8 }}>
            {now.city}
          </motion.h1>
          <p className="now-country">{now.country}</p>
          <div className="now-chips">
            <Glass className="now-chip" radius={18} bezel={12} strength={20}>
              <span>Hora local</span>
              <strong className="mono">{time}</strong>
            </Glass>
            {weather && (
              <Glass className="now-chip" radius={18} bezel={12} strength={20}>
                <span>{weather.text || "Tempo agora"}</span>
                <strong>{weather.temp}°C</strong>
              </Glass>
            )}
            <Glass className="now-chip" radius={18} bezel={12} strength={20}>
              <span>Chegamos em</span>
              <strong>{fmtDate(now.arrived)}</strong>
            </Glass>
            <Glass className="now-chip" radius={18} bezel={12} strength={20}>
              <span>Aqui há</span>
              <strong>
                {days} {days === 1 ? "dia" : "dias"}
              </strong>
            </Glass>
          </div>
          {now.note && <p className="now-note">{now.note}</p>}
        </div>
      </section>

      <section className="section">
        <Reveal className="section-head">
          <span className="eyebrow">Paradas</span>
          <h2>
            Por onde a gente <em>passou</em>
          </h2>
          <p>Toda vez que a gente chega num lugar novo, ele entra aqui no topo.</p>
        </Reveal>
        <ol className="stops">
          {stops.map((s, i) => (
            <Reveal key={`${s.city}-${s.arrived}-${i}`} delay={i * 0.05}>
              <Glass as="li" className={`stop ${i === 0 ? "is-now" : ""}`} radius={22} bezel={14} strength={20}>
                <span className="stop-when mono">{i === 0 ? "Agora" : fmtDate(s.arrived)}</span>
                <strong>
                  {s.city}, {s.country}
                </strong>
                {s.note && <span className="muted">{s.note}</span>}
                {i === 0 && <span className="muted small">Desde {fmtDate(s.arrived)}</span>}
              </Glass>
            </Reveal>
          ))}
          <Reveal delay={stops.length * 0.05}>
            <Glass as="li" className="stop" radius={22} bezel={14} strength={20}>
              <span className="stop-when mono">Antes</span>
              <strong>Brasil</strong>
              <span className="muted">Onde tudo começou.</span>
            </Glass>
          </Reveal>
        </ol>
      </section>

      <section className="section">
        <Reveal className="section-head">
          <span className="eyebrow">Álbuns</span>
          <h2>Fotos de cada país</h2>
        </Reveal>
        <div className="country-others">
          {albums.map((c) => (
            <Link key={c.id} to={`/paises/${c.id}`} className="country-other">
              {c.coverDriveId ? <img src={driveImage(c.coverDriveId, 600)} alt="" referrerPolicy="no-referrer" /> : <Scene name={c.scene} label="" />}
              <span>
                <strong>{c.name}</strong>
                <span>{c.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
