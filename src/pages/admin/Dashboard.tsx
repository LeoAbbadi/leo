import { Link } from "react-router";
import { Pill } from "../../components/ui";
import { brl, dateTime, tournamentStart, weekdayShort } from "../../lib/format";
import { computeRanking } from "../../lib/ranking";
import { useData } from "../../lib/store";

export function Dashboard() {
  const { data } = useData();
  if (!data) return null;

  const now = new Date();
  const upcoming = data.tournaments
    .filter((t) => t.status === "agendado" && tournamentStart(t) > now)
    .sort((a, b) => tournamentStart(a).getTime() - tournamentStart(b).getTime());
  const pending = data.interests.filter((i) => i.status === "pendente");
  const upcomingIds = new Set(upcoming.map((t) => t.id));
  const registered = data.interests.filter((i) => i.status === "confirmado" && upcomingIds.has(i.tournamentId));
  const auto = data.settings.autoConfirm && pending.length === 0;
  const leader = computeRanking(data)[0];
  const toScore = data.tournaments.filter((t) => t.status !== "finalizado" && t.status !== "cancelado" && tournamentStart(t) < now);
  const count = (id: string) => data.interests.filter((i) => i.tournamentId === id && i.status !== "cancelado").length;

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Painel</h1>
        <Link to="/admin/torneios?novo=1" className="btn btn-primary">
          Novo torneio
        </Link>
      </header>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">{auto ? "Inscritos nos próximos torneios" : "Inscrições a confirmar"}</span>
          <span className="stat-value">{auto ? registered.length : pending.length}</span>
          <Link to="/admin/inscricoes">Ver inscrições</Link>
        </div>
        <div className="stat">
          <span className="stat-label">Torneios agendados</span>
          <span className="stat-value">{upcoming.length}</span>
          <Link to="/admin/torneios">Editar grade</Link>
        </div>
        <div className="stat">
          <span className="stat-label">Jogadores cadastrados</span>
          <span className="stat-value">{data.players.length}</span>
          <Link to="/admin/jogadores">Ver jogadores</Link>
        </div>
        <div className="stat">
          <span className="stat-label">Líder do ranking</span>
          <span className="stat-value stat-value-text">{leader ? leader.player.name : "–"}</span>
          <span className="muted">{leader ? `${leader.points} pts` : "Sem resultados ainda"}</span>
        </div>
      </div>

      {toScore.length > 0 && (
        <div className="callout">
          <strong>Falta lançar resultado:</strong>{" "}
          {toScore.map((t, i) => (
            <span key={t.id}>
              {i > 0 && ", "}
              <Link to={`/admin/torneios/${t.id}/resultados`}>
                {t.name} ({dateTime(tournamentStart(t))})
              </Link>
            </span>
          ))}
        </div>
      )}

      <div className="admin-columns">
        <section className="panel">
          <h2>Próximos torneios</h2>
          <ul className="list">
            {upcoming.slice(0, 6).map((t) => (
              <li key={t.id}>
                <span className="list-main">
                  <b>
                    {weekdayShort(tournamentStart(t))} {t.time}
                  </b>{" "}
                  {t.name}
                </span>
                <span className="list-meta">
                  {count(t.id)}/{t.maxPlayers} · {brl(t.buyIn)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Inscrições recentes</h2>
          <ul className="list">
            {[...data.interests]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 6)
              .map((i) => {
                const t = data.tournaments.find((x) => x.id === i.tournamentId);
                return (
                  <li key={i.id}>
                    <span className="list-main">
                      <b>{i.name}</b> {t?.name}
                    </span>
                    <span className="list-meta">
                      {i.earlyBird && <Pill tone="ok">Early bird</Pill>}
                      <Pill tone={i.status === "confirmado" ? "ok" : i.status === "pendente" ? "warn" : "muted"}>
                        {i.status}
                      </Pill>
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      </div>
    </div>
  );
}
