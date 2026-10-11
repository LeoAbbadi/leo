import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { countries, type Country } from "../content/countries";
import { driveImage } from "../content/photos";
import { Glass } from "./Glass";
import { Scene } from "./Postcard";

/**
 * Carrossel de países em 3D: o do meio em destaque e os vizinhos inclinados
 * em perspectiva. Arraste, use as setas (tela ou teclado) ou toque num cartão.
 * Tocar no cartão do meio abre a página de fotos daquele país.
 */

function Cover({ country, size }: { country: Country; size: number }) {
  return country.coverDriveId ? (
    <img src={driveImage(country.coverDriveId, size)} alt="" loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <Scene name={country.scene} label="" />
  );
}

const statusText: Record<Country["status"], string> = {
  casa: "De onde viemos",
  base: "Onde moramos",
  visitado: "Visitado",
  proximo: "Em breve",
};

export function Coverflow() {
  const navigate = useNavigate();
  const startAt = Math.max(0, countries.findIndex((c) => c.status === "base"));
  const [active, setActive] = useState(startAt);
  const current = countries[active];
  const go = useCallback((i: number) => setActive(Math.max(0, Math.min(countries.length - 1, i))), []);
  // depois de arrastar, o navegador ainda dispara um clique: ignoramos esse
  const panned = useRef(0);
  const open = (c: Country) => c.status !== "proximo" && Date.now() - panned.current > 300 && navigate(`/paises/${c.id}`);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    panned.current = Date.now();
    if (info.offset.x < -50 || info.velocity.x < -400) go(active + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(active - 1);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") (e.preventDefault(), go(active + 1));
    if (e.key === "ArrowLeft") (e.preventDefault(), go(active - 1));
    if (e.key === "Enter") open(current);
  };

  return (
    <div className="flow">
      {/* fundo: a capa do país ativo, desfocada */}
      <div className="flow-bg" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="flow-bg-img"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Cover country={current} size={600} />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="flow-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carrossel"
        aria-label={`Países visitados: ${current.name}, ${active + 1} de ${countries.length}`}
        onKeyDown={onKey}
        onPanEnd={onPanEnd}
      >
        {countries.map((c, i) => {
          const off = i - active;
          const abs = Math.abs(off);
          const side = Math.sign(off);
          return (
            <motion.button
              key={c.id}
              type="button"
              className={`flow-card ${off === 0 ? "is-active" : ""}`}
              aria-label={off === 0 ? (c.status === "proximo" ? c.name : `Ver fotos ${c.of}`) : `Mostrar ${c.name}`}
              tabIndex={-1}
              onClick={() => (off === 0 ? open(c) : Date.now() - panned.current > 300 && go(i))}
              initial={false}
              animate={{
                x: `${off * 74 - (abs > 1 ? side * (abs - 1) * 18 : 0)}%`,
                rotateY: side * -Math.min(abs, 2) * 26,
                scale: 1 - Math.min(abs, 3) * 0.13,
                z: -abs * 90,
                opacity: abs > 2 ? 0 : 1,
              }}
              style={{ zIndex: 10 - abs, pointerEvents: abs > 2 ? "none" : "auto" }}
              transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.9 }}
              whileHover={off === 0 ? { y: -6 } : undefined}
            >
              <Cover country={c} size={800} />
              <span className="flow-shade" aria-hidden="true" />
              <motion.span
                className="flow-dim"
                aria-hidden="true"
                initial={false}
                animate={{ opacity: Math.min(abs, 2) * 0.32 }}
                transition={{ duration: 0.5 }}
              />
              <Glass as="span" className="flow-tag" radius={999} bezel={8} strength={14}>
                {c.tag}
              </Glass>
            </motion.button>
          );
        })}

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="flow-title"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flow-status">
              {statusText[current.status]}
              {current.when ? ` · ${current.when}` : ""}
            </span>
            <strong>{current.name}</strong>
            <span className="flow-rule" aria-hidden="true" />
            <span className="flow-tagline">{current.tagline}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flow-controls">
        <Glass as="span" className="flow-arrow-wrap" radius={999} bezel={12} strength={20}>
          <button type="button" className="flow-arrow" onClick={() => go(active - 1)} disabled={active === 0} aria-label="País anterior">
            ←
          </button>
        </Glass>
        <div className="flow-dots" role="tablist" aria-label="Escolher país">
          {countries.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={c.name}
              className={`flow-dot ${i === active ? "is-on" : ""}`}
              onClick={() => go(i)}
            >
              {i === active && <motion.span layoutId="flow-dot" className="flow-dot-fill" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            </button>
          ))}
        </div>
        <Glass as="span" className="flow-arrow-wrap" radius={999} bezel={12} strength={20}>
          <button type="button" className="flow-arrow" onClick={() => go(active + 1)} disabled={active === countries.length - 1} aria-label="Próximo país">
            →
          </button>
        </Glass>
      </div>

      <div className="flow-cta">
        {current.status === "proximo" ? (
          <span className="soon soon-dark">Quando a gente for, as fotos aparecem aqui</span>
        ) : (
          <button type="button" className="btn btn-sun btn-lg" onClick={() => open(current)}>
            Ver fotos {current.of} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
