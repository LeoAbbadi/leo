import { useMemo, useState } from "react";
import { InterestModal } from "../components/InterestModal";
import { SplitText } from "../components/Kinetic";
import { TournamentCard } from "../components/TournamentCard";
import { isoDate, longDate, parseLocalDate, tournamentStart } from "../lib/format";
import { useData, useNow } from "../lib/store";
import type { Tournament } from "../lib/types";

type Range = "semana" | "proximas" | "anteriores";

export function Schedule() {
  const { data } = useData();
  const now = useNow(1000);
  const [range, setRange] = useState<Range>("semana");
  const [picked, setPicked] = useState<Tournament | null>(null);

  const groups = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    const todayIso = isoDate(today);
    const weekEnd = isoDate(new Date(today.getTime() + 7 * 86_400_000));
    const list = data.tournaments
      .filter((t) => {
        if (range === "anteriores") return t.date < todayIso || t.status === "finalizado";
        if (t.status === "finalizado" || t.date < todayIso) return false;
        return range === "proximas" || t.date <= weekEnd;
      })
      .sort((a, b) => tournamentStart(a).getTime() - tournamentStart(b).getTime());
    if (range === "anteriores") list.reverse();
    const byDay = new Map<string, Tournament[]>();
    for (const t of list) byDay.set(t.date, [...(byDay.get(t.date) ?? []), t]);
    return [...byDay.entries()];
  }, [data, range]);

  if (!data) return <div className="loading">Carregando…</div>;
  const interestedIn = (id: string) => data.interests.filter((i) => i.tournamentId === id && i.status !== "cancelado").length;
  let index = 0;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Grade de torneios</p>
            <h1 className="page-title">
              <SplitText text="Escolha sua mesa" />
            </h1>
          </div>
          <div className="segmented glass" role="tablist" aria-label="Período">
            {(
              [
                ["semana", "Próximos 7 dias"],
                ["proximas", "Todas as datas"],
                ["anteriores", "Já jogados"],
              ] as [Range, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={range === key}
                className={range === key ? "is-active" : ""}
                onClick={() => setRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="schedule-note">
          Quem avisa até {data.settings.earlyBirdHours} horas antes ganha o early bird: {data.settings.earlyBirdBonus}.
        </p>

        {groups.length === 0 && <p className="empty">Nenhum torneio neste período.</p>}

        {groups.map(([date, list]) => (
          <div className="day-group" key={date}>
            <h2 className="day-title">{longDate(parseLocalDate(date))}</h2>
            <div className="tcard-list">
              {list.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  settings={data.settings}
                  interested={interestedIn(t.id)}
                  now={now}
                  onInterest={range === "anteriores" ? undefined : setPicked}
                  index={index++}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <InterestModal tournament={picked} onClose={() => setPicked(null)} />
    </section>
  );
}
