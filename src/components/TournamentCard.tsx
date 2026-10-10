import { motion } from "motion/react";
import { brl, countdown, countdownLabel, dayMonth, earlyBirdDeadline, num, tournamentStart, weekdayShort } from "../lib/format";
import type { Settings, Tournament } from "../lib/types";
import { Pill } from "./ui";

interface Props {
  tournament: Tournament;
  settings: Settings;
  interested: number;
  now: Date;
  onInterest?(t: Tournament): void;
  index?: number;
}

export function TournamentCard({ tournament: t, settings, interested, now, onInterest, index = 0 }: Props) {
  const start = tournamentStart(t);
  const deadline = earlyBirdDeadline(t, settings.earlyBirdHours);
  const eb = countdown(deadline, now);
  const started = now >= start;
  const full = interested >= t.maxPlayers;
  const open = t.status === "agendado" && !started && !full;

  return (
    <motion.article
      className={`tcard ${t.featured ? "tcard-featured" : ""}`}
      initial={{ y: 18, opacity: 0.4 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="tcard-stub">
        <span className="tcard-weekday">{weekdayShort(start)}</span>
        <span className="tcard-day">{dayMonth(start)}</span>
        <span className="tcard-time">{t.time}</span>
      </div>

      <div className="tcard-main">
        <div className="tcard-tags">
          {t.featured && <Pill tone="brass">Destaque</Pill>}
          {t.pointsMultiplier !== 1 && (
            <Pill tone="muted">{String(t.pointsMultiplier).replace(".", ",")}x pontos</Pill>
          )}
          {t.status === "cancelado" && <Pill tone="danger">Cancelado</Pill>}
          {t.status === "em_andamento" && <Pill tone="warn">Em andamento</Pill>}
          {t.status === "agendado" && !started &&
            (eb.done ? (
              <Pill tone="muted">Early bird encerrado</Pill>
            ) : (
              <Pill tone="ok">Early bird: faltam {countdownLabel(eb)}</Pill>
            ))}
        </div>
        <h3 className="tcard-name">{t.name}</h3>
        {t.description && <p className="tcard-desc">{t.description}</p>}
        <dl className="tcard-stats">
          <div>
            <dt>Buy-in</dt>
            <dd>{brl(t.buyIn)}</dd>
          </div>
          <div>
            <dt>Garantido</dt>
            <dd>{brl(t.guaranteed)}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{num(t.startingStack)}</dd>
          </div>
          <div>
            <dt>Níveis</dt>
            <dd>{t.blindMinutes} min</dd>
          </div>
          {t.rebuy !== null && (
            <div>
              <dt>Rebuy</dt>
              <dd>{brl(t.rebuy)}</dd>
            </div>
          )}
          {t.addon !== null && (
            <div>
              <dt>Add-on</dt>
              <dd>{brl(t.addon)}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="tcard-cta">
        <div className="tcard-seats">
          <div className="seat-bar" aria-hidden="true">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.min(1, interested / t.maxPlayers) }}
              transition={{ duration: 0.9, delay: 0.2 + index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </div>
          <span>
            {interested} de {t.maxPlayers} vagas
          </span>
        </div>
        {onInterest && (
          <motion.button
            type="button"
            className="btn btn-primary"
            disabled={!open}
            onClick={() => onInterest(t)}
            whileTap={{ scale: 0.96 }}
          >
            {t.status === "cancelado" ? "Cancelado" : full ? "Lotado" : started ? "Já começou" : "Quero jogar"}
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
