import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useMemo, useState, type PointerEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { HeroStage } from "../components/HeroStage";
import { InterestModal } from "../components/InterestModal";
import { FlipNumber, Glass, MarqueeText, Reveal, ScriptWord, SplitText } from "../components/Kinetic";
import { TournamentCard } from "../components/TournamentCard";
import { CountUp, Ticker } from "../components/ui";
import { brl, countdown, isoDate, tournamentStart, weekdayShort } from "../lib/format";
import { computeRanking } from "../lib/ranking";
import { useData, useNow } from "../lib/store";
import type { Tournament } from "../lib/types";

/** Botão que é levemente atraído pelo ponteiro. */
function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 15 });
  const sy = useSpring(y, { stiffness: 250, damping: 15 });
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  }
  return (
    <motion.div
      className="magnetic"
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  { suit: "♠", title: "Escolha o torneio", text: "A grade mostra horário, buy-in, garantido e quantas vagas restam." },
  { suit: "♥", title: "Clique em “Quero jogar”", text: "" },
  { suit: "♦", title: "Receba a confirmação", text: "A inscrição chega na hora para o clube e a confirmação vai para o seu WhatsApp." },
];

export function Home() {
  const { data } = useData();
  const now = useNow(1000);
  const [picked, setPicked] = useState<Tournament | null>(null);
  const { scrollY } = useScroll();
  const stageY = useTransform(scrollY, [0, 700], [0, 140]);
  const stageScale = useTransform(scrollY, [0, 700], [1, 0.88]);
  const copyY = useTransform(scrollY, [0, 700], [0, -40]);

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
  const interestedIn = (id: string) =>
    data.interests.filter((i) => i.tournamentId === id && i.status !== "cancelado").length;
  const weekEnd = isoDate(new Date(Date.now() + 7 * 86_400_000));
  const week = upcoming.filter((t) => t.date <= weekEnd);
  const weekGuaranteed = week.reduce((sum, t) => sum + t.guaranteed, 0);
  const leaderPoints = ranking[0]?.points || 1;
  const steps = STEPS.map((s, i) =>
    i === 1
      ? { ...s, text: `Até ${settings.earlyBirdHours} horas antes do início, você ganha o early bird: ${settings.earlyBirdBonus}.` }
      : s,
  );

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <motion.div className="hero-copy" style={{ y: copyY }}>
            <motion.p
              className="eyebrow-pill glass"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <span className="live-dot" aria-hidden="true" />
              {settings.tagline} · {settings.city}
            </motion.p>
            <h1 className="hero-title">
              <SplitText text="A próxima mão" delay={0.2} />
              <ScriptWord delay={0.85}>é sua.</ScriptWord>
            </h1>
            <motion.p
              className="hero-lead"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              Veja a grade da semana, garanta sua vaga com early bird e receba a confirmação no WhatsApp. Cada torneio
              vale pontos no {settings.seasonName.toLowerCase()}.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.7 }}
            >
              <Magnetic>
                <Link to="/torneios" className="btn btn-primary btn-lg">
                  Ver grade de torneios
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/ranking" className="btn btn-glass btn-lg">
                  Ranking do semestre
                </Link>
              </Magnetic>
            </motion.div>

            {next && clock && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Glass className="clock" tilt={5}>
                  <div className="clock-head">
                    <span className="clock-label">
                      <span className="live-dot" aria-hidden="true" /> Próximo torneio
                    </span>
                    <span className="clock-name">
                      {next.name} · {weekdayShort(tournamentStart(next))} {next.time}
                    </span>
                  </div>
                  <div className="clock-digits">
                    {(
                      [
                        [clock.days, "dias"],
                        [clock.hours, "horas"],
                        [clock.minutes, "min"],
                        [clock.seconds, "seg"],
                      ] as [number, string][]
                    ).map(([v, l]) => (
                      <div className="clock-cell" key={l}>
                        <FlipNumber value={v} />
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
                </Glass>
              </motion.div>
            )}
          </motion.div>
          <motion.div className="hero-visual" style={{ y: stageY, scale: stageScale }}>
            <HeroStage />
          </motion.div>
        </div>
      </section>

      <section className="wrap stats">
        {(
          [
            [weekGuaranteed, brl, "garantidos nos próximos 7 dias"],
            [week.length, String, "torneios na grade da semana"],
            [ranking.length, String, `jogadores no ${settings.seasonName.toLowerCase()}`],
          ] as [number, (n: number) => string, string][]
        ).map(([value, format, label], i) => (
          <Reveal key={label} delay={i * 0.1}>
            <Glass className="stat-tile" tilt={8}>
              <span className="stat-tile-value">
                <CountUp value={value} format={format} />
              </span>
              <span className="stat-tile-label">{label}</span>
            </Glass>
          </Reveal>
        ))}
      </section>

      <div className="tickers">
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
        <MarqueeText text="YPIRANGA POKER ♥ TORNEIOS TODA SEMANA ♠ RANKING DO SEMESTRE ♦ EARLY BIRD ♣ " />
      </div>

      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">Grade</p>
              <h2>Próximos torneios</h2>
            </div>
            <Link to="/torneios" className="btn btn-glass">
              Ver a grade completa
            </Link>
          </Reveal>
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
        </div>
      </section>

      <section className="section section-red">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Early bird</p>
            <h2>
              Avise antes, <ScriptWord>comece com mais fichas</ScriptWord>
            </h2>
          </Reveal>
          <ol className="steps">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12}>
                <Glass as="li" className="step" tilt={10}>
                  <span className={`step-suit ${s.suit === "♥" || s.suit === "♦" ? "is-red" : ""}`} aria-hidden="true">
                    {s.suit}
                  </span>
                  <span className="step-num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Glass>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap ranking-teaser">
          <Reveal>
            <p className="eyebrow">{settings.seasonName}</p>
            <h2>Quem está na frente</h2>
            <Glass className="prize" tilt={6}>
              <span className="prize-label">Prêmio do semestre</span>
              {settings.seasonPrize}
            </Glass>
            <Link to="/ranking" className="btn btn-glass">
              Ranking completo
            </Link>
          </Reveal>
          <ol className="mini-rank">
            {ranking.slice(0, 5).map((r, i) => (
              <Reveal key={r.player.id} delay={i * 0.08}>
                <Glass as="li" className={`mini-row ${i === 0 ? "is-leader" : ""}`} tilt={4}>
                  <span className="mini-pos">{i + 1}</span>
                  <span className="mini-name">
                    {r.player.name}
                    <small>{r.player.nickname}</small>
                  </span>
                  <span className="mini-pts">{r.points} pts</span>
                  <motion.span
                    className="mini-bar"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: r.points / leaderPoints }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                    aria-hidden="true"
                  />
                </Glass>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <InterestModal tournament={picked} onClose={() => setPicked(null)} />
    </>
  );
}
