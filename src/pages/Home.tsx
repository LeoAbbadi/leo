import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { HeroTable } from "../components/HeroTable";
import { InterestModal } from "../components/InterestModal";
import { TournamentCard } from "../components/TournamentCard";
import { CountUp, Ticker } from "../components/ui";
import { brl, countdown, pad2, tournamentStart, weekdayShort } from "../lib/format";
import { computeRanking } from "../lib/ranking";
import { useData, useNow } from "../lib/store";
import type { Tournament } from "../lib/types";

export function Home() {
  const { data } = useData();
  const now = useNow(1000);
  const [picked, setPicked] = useState<Tournament | null>(null);

  const upcoming = useMemo(
    () =>
      (data?.tournaments ?? [])
        .filter((t) => t.status !== "finalizado" && t.status !== "cancelado" && tournamentStart(t) > new Date())
        .sort((a, b) => tournamentStart(a).getTime() - tournamentStart(b).getTime()),
    [data],
  );
  const ranking = useMemo(() => (data ? computeRanking(data) : []), [data]);

  if (!data) return <div className="loading">Carregando…</div>;
  const { settings } = data;
  const next = upcoming[0];
  const clock = next ? countdown(tournamentStart(next), now) : null;
  const interestedIn = (id: string) => data.interests.filter((i) => i.tournamentId === id && i.status !== "cancelado").length;
  const weekGuaranteed = upcoming.slice(0, 5).reduce((sum, t) => sum + t.guaranteed, 0);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {settings.tagline} · {settings.city}
            </motion.p>
            <h1 className="hero-title">
              {["A próxima mão", "é sua."].map((line, i) => (
                <motion.span
                  key={line}
                  className="hero-line"
                  initial={{ y: "70%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <p className="hero-lead">
              Veja a grade da semana, avise que vai jogar e garanta o early bird. Cada torneio vale pontos no{" "}
              {settings.seasonName.toLowerCase()}.
            </p>
            <div className="hero-actions">
              <Link to="/torneios" className="btn btn-primary btn-lg">
                Ver grade de torneios
              </Link>
              <Link to="/ranking" className="btn btn-ghost btn-lg">
                Ranking do semestre
              </Link>
            </div>

            {next && clock && (
              <div className="clock" aria-live="off">
                <div className="clock-head">
                  <span className="clock-label">Próximo torneio</span>
                  <span className="clock-name">
                    {next.name} · {weekdayShort(tournamentStart(next))} {next.time}
                  </span>
                </div>
                <div className="clock-digits">
                  {[
                    [clock.days, "dias"],
                    [clock.hours, "horas"],
                    [clock.minutes, "min"],
                    [clock.seconds, "seg"],
                  ].map(([v, l]) => (
                    <div className="clock-cell" key={l}>
                      <span className="clock-num">{pad2(v as number)}</span>
                      <span className="clock-unit">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="clock-foot">
                  <span>Buy-in {brl(next.buyIn)}</span>
                  <span>GTD {brl(next.guaranteed)}</span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setPicked(next)}>
                    Quero jogar
                  </button>
                </div>
              </div>
            )}
          </div>
          <HeroTable />
        </div>
      </section>

      <Ticker
        items={upcoming.slice(0, 8).map((t) => (
          <>
            <b>
              {weekdayShort(tournamentStart(t))} {t.time}
            </b>{" "}
            {t.name} · {brl(t.buyIn)} · GTD {brl(t.guaranteed)}
          </>
        ))}
      />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Grade</p>
              <h2>Próximos torneios</h2>
            </div>
            <p className="section-aside">
              <span className="big-figure">
                <CountUp value={weekGuaranteed} format={brl} />
              </span>
              garantidos nos próximos 5 torneios
            </p>
          </div>
          <div className="tcard-list">
            {upcoming.slice(0, 3).map((t, i) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                settings={settings}
                interested={interestedIn(t.id)}
                now={now}
                onInterest={setPicked}
                index={i}
              />
            ))}
          </div>
          <Link to="/torneios" className="link-arrow">
            Ver a grade completa →
          </Link>
        </div>
      </section>

      <section className="section section-felt">
        <div className="wrap">
          <p className="eyebrow">Early bird</p>
          <h2>Avise antes, comece com mais fichas</h2>
          <ol className="steps">
            <li>
              <span className="step-num">1</span>
              <h3>Escolha o torneio</h3>
              <p>A grade mostra horário, buy-in, garantido e quantas vagas restam.</p>
            </li>
            <li>
              <span className="step-num">2</span>
              <h3>Clique em “Quero jogar”</h3>
              <p>
                Até {settings.earlyBirdHours} horas antes do início, o interesse dá direito ao bônus:{" "}
                {settings.earlyBirdBonus}.
              </p>
            </li>
            <li>
              <span className="step-num">3</span>
              <h3>O clube confirma</h3>
              <p>O dono recebe seu pedido por e-mail e confirma sua vaga.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap ranking-teaser">
          <div>
            <p className="eyebrow">{settings.seasonName}</p>
            <h2>Quem está na frente</h2>
            <p className="prize">
              <span className="prize-label">Prêmio do semestre</span>
              {settings.seasonPrize}
            </p>
            <Link to="/ranking" className="btn btn-ghost">
              Ranking completo
            </Link>
          </div>
          <ol className="mini-rank">
            {ranking.slice(0, 5).map((r, i) => (
              <motion.li
                key={r.player.id}
                initial={{ x: 24, opacity: 0.3 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <span className="mini-pos">{i + 1}</span>
                <span className="mini-name">
                  {r.player.name}
                  <small>{r.player.nickname}</small>
                </span>
                <span className="mini-pts">{r.points} pts</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <InterestModal tournament={picked} onClose={() => setPicked(null)} />
    </>
  );
}
