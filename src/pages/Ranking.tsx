import { motion } from "motion/react";
import { useMemo } from "react";
import { ChipTop } from "../components/Cards";
import { Glass, Reveal, SplitText } from "../components/Kinetic";
import { CountUp } from "../components/ui";
import { countdown, parseLocalDate, shortDate } from "../lib/format";
import { computeRanking } from "../lib/ranking";
import { useData, useNow } from "../lib/store";

const PODIUM_ORDER = [1, 0, 2];
const PODIUM_HEIGHT = [100, 76, 58];
const PODIUM_CHIP = ["metal", "white", "red"] as const;
const BURST = ["♠", "♥", "♣", "♦", "♥", "♠", "♦", "♣", "♥", "♦", "♠", "♥"];

/** Naipes que explodem para cima atrás do campeão. */
function SuitBurst() {
  return (
    <span className="suit-burst" aria-hidden="true">
      {BURST.map((s, i) => {
        const angle = -Math.PI / 2 + ((i - (BURST.length - 1) / 2) / BURST.length) * Math.PI * 1.1;
        const dist = 90 + (i % 3) * 30;
        return (
          <motion.span
            key={i}
            className={`burst-suit ${s === "♥" || s === "♦" ? "is-red" : ""}`}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0.2, 1.2, 0.9],
              opacity: [0, 1, 0],
              rotate: (i % 2 ? 1 : -1) * 160,
            }}
            transition={{ duration: 1.8, delay: 1.2 + (i % 4) * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {s}
          </motion.span>
        );
      })}
    </span>
  );
}

export function Ranking() {
  const { data } = useData();
  const now = useNow(60_000);
  const rows = useMemo(() => (data ? computeRanking(data) : []), [data]);

  if (!data) return <div className="loading">Carregando…</div>;
  const s = data.settings;
  const end = parseLocalDate(s.seasonEnd, "23:59");
  const left = countdown(end, now);
  const top = rows.slice(0, 3);

  return (
    <>
      <section className="section ranking-hero">
        <div className="wrap">
          <p className="eyebrow">
            {shortDate(parseLocalDate(s.seasonStart))} a {shortDate(end)}
          </p>
          <h1 className="page-title">
            <SplitText text={s.seasonName} />
          </h1>
          <div className="season-bar">
            <Glass className="prize prize-large" tilt={5}>
              <span className="prize-label">Prêmio para o campeão</span>
              {s.seasonPrize}
            </Glass>
            <Glass className="season-left" tilt={8}>
              <span className="big-figure">{left.done ? "0" : <CountUp value={left.days} />}</span>
              <span>{left.done ? "temporada encerrada" : "dias até o fim do semestre"}</span>
            </Glass>
          </div>

          {top.length === 3 && (
            <div className="podium" aria-label="Pódio">
              {PODIUM_ORDER.map((idx) => {
                const r = top[idx];
                return (
                  <div className="podium-col" key={r.player.id}>
                    <motion.div
                      className="podium-player"
                      initial={{ y: 30, opacity: 0.2, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.6 + idx * 0.15 }}
                    >
                      {idx === 0 && <SuitBurst />}
                      <motion.span
                        className="podium-chip"
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 3, delay: 1 + idx * 0.3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                      >
                        <ChipTop color={PODIUM_CHIP[idx]} size={idx === 0 ? 72 : 52} />
                      </motion.span>
                      <strong>{r.player.name}</strong>
                      <span>{r.points} pts</span>
                    </motion.div>
                    <motion.div
                      className={`podium-block glass podium-${idx + 1}`}
                      style={{ height: `${PODIUM_HEIGHT[idx] * 1.4}px`, originY: 1 }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.8, delay: 0.15 + idx * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <span>{idx + 1}º</span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <Reveal className="wrap rank-layout">
          <div className="table-wrap glass">
            <table className="rank-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Jogador</th>
                  <th scope="col" className="num">
                    Pontos
                  </th>
                  <th scope="col" className="num">
                    Torneios
                  </th>
                  <th scope="col" className="num">
                    Vitórias
                  </th>
                  <th scope="col" className="num">
                    Pontuou
                  </th>
                  <th scope="col" className="num">
                    Melhor
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.player.id}
                    initial={{ opacity: 0.2, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.035 }}
                  >
                    <td className="rank-pos">{i + 1}</td>
                    <td>
                      <span className="rank-name">{r.player.name}</span>
                      <span className="rank-nick">{r.player.nickname}</span>
                    </td>
                    <td className="num rank-points">
                      <span className="rank-bar" style={{ width: `${(r.points / (rows[0]?.points || 1)) * 100}%` }} />
                      <span className="rank-points-value">{r.points}</span>
                    </td>
                    <td className="num">{r.played}</td>
                    <td className="num">{r.wins}</td>
                    <td className="num">{r.itm}</td>
                    <td className="num">{r.best ? `${r.best}º` : "–"}</td>
                  </motion.tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      Ainda não há resultados neste semestre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className="scoring glass">
            <h2>Como pontuar</h2>
            <p>
              Do 1º ao {s.pointsTable.length}º lugar de cada torneio, o jogador soma pontos. Torneios marcados com
              multiplicador valem mais.
            </p>
            <ol className="scoring-list">
              {s.pointsTable.map((p, i) => (
                <li key={i}>
                  <span>{i + 1}º lugar</span>
                  <b>{p} pts</b>
                </li>
              ))}
            </ol>
            <p className="muted">
              Empate: vence quem tem mais vitórias, depois quem pontuou mais vezes, depois a melhor colocação.
            </p>
          </aside>
        </Reveal>
      </section>
    </>
  );
}
