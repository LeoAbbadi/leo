import { useMemo, useState } from "react";
import { ConfirmButton, Pill, useToast } from "../../components/ui";
import { dateTime, isoDate, tournamentStart, weekdayShort } from "../../lib/format";
import { useData } from "../../lib/store";
import type { InterestStatus } from "../../lib/types";

type Tab = "inscricoes" | "emails";

export function Interests() {
  const { data, updateInterest, deleteInterest } = useData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("inscricoes");
  const [tournamentId, setTournamentId] = useState("");
  const [status, setStatus] = useState<InterestStatus | "">("pendente");
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  const tournaments = useMemo(() => {
    if (!data) return [];
    const today = isoDate(new Date());
    return data.tournaments
      .filter((t) => t.date >= today)
      .sort((a, b) => tournamentStart(a).getTime() - tournamentStart(b).getTime());
  }, [data]);

  if (!data) return null;
  const tById = new Map(data.tournaments.map((t) => [t.id, t]));
  const list = data.interests
    .filter((i) => (!tournamentId || i.tournamentId === tournamentId) && (!status || i.status === status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function setInterestStatus(id: string, next: InterestStatus, name: string) {
    await updateInterest(id, { status: next });
    toast(next === "confirmado" ? `Vaga de ${name} confirmada.` : `Inscrição de ${name} cancelada.`);
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Inscrições</h1>
        <div className="segmented" role="tablist" aria-label="Seção">
          <button type="button" role="tab" aria-selected={tab === "inscricoes"} className={tab === "inscricoes" ? "is-active" : ""} onClick={() => setTab("inscricoes")}>
            Interessados
          </button>
          <button type="button" role="tab" aria-selected={tab === "emails"} className={tab === "emails" ? "is-active" : ""} onClick={() => setTab("emails")}>
            E-mails recebidos ({data.outbox.length})
          </button>
        </div>
      </header>

      {tab === "inscricoes" && (
        <>
          <div className="filters">
            <label htmlFor="f-tournament" className="sr-only">
              Torneio
            </label>
            <select id="f-tournament" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
              <option value="">Todos os torneios</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {weekdayShort(tournamentStart(t))} {t.time} · {t.name}
                </option>
              ))}
            </select>
            <label htmlFor="f-status" className="sr-only">
              Status
            </label>
            <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value as InterestStatus | "")}>
              <option value="">Todos os status</option>
              <option value="pendente">A confirmar</option>
              <option value="confirmado">Confirmados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Jogador</th>
                  <th scope="col">Torneio</th>
                  <th scope="col">Pedido em</th>
                  <th scope="col">Early bird</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => {
                  const t = tById.get(i.tournamentId);
                  return (
                    <tr key={i.id}>
                      <td>
                        <b>{i.name}</b>
                        <br />
                        <small className="muted selectable">
                          {i.email}
                          {i.phone && ` · ${i.phone}`}
                        </small>
                      </td>
                      <td>
                        {t ? (
                          <>
                            {t.name}
                            <br />
                            <small className="muted">
                              {weekdayShort(tournamentStart(t))} {dateTime(tournamentStart(t))}
                            </small>
                          </>
                        ) : (
                          "Torneio removido"
                        )}
                      </td>
                      <td className="nowrap">{dateTime(new Date(i.createdAt))}</td>
                      <td>{i.earlyBird ? <Pill tone="ok">Sim</Pill> : <Pill tone="muted">Não</Pill>}</td>
                      <td>
                        <Pill tone={i.status === "confirmado" ? "ok" : i.status === "pendente" ? "warn" : "muted"}>
                          {i.status}
                        </Pill>
                      </td>
                      <td className="row-actions">
                        {i.status !== "confirmado" && (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => setInterestStatus(i.id, "confirmado", i.name)}>
                            Confirmar vaga
                          </button>
                        )}
                        {i.status !== "cancelado" && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInterestStatus(i.id, "cancelado", i.name)}>
                            Cancelar
                          </button>
                        )}
                        <ConfirmButton
                          confirmLabel="Excluir pedido"
                          onConfirm={async () => {
                            await deleteInterest(i.id);
                            toast("Pedido excluído.");
                          }}
                        >
                          Excluir
                        </ConfirmButton>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">
                      Nenhuma inscrição com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "emails" && (
        <section className="panel">
          <p className="muted">
            Cada “Quero jogar” no site gera um e-mail para {data.settings.ownerEmail}. O envio real começa quando o
            serviço de e-mail for conectado; até lá, eles ficam guardados aqui.
          </p>
          {data.outbox.length === 0 && <p className="empty">Nenhum e-mail ainda. Faça uma inscrição pelo site para testar.</p>}
          <ul className="mail-list">
            {data.outbox.map((m) => (
              <li key={m.id} className="mail">
                <button type="button" className="mail-head" aria-expanded={openEmail === m.id} onClick={() => setOpenEmail(openEmail === m.id ? null : m.id)}>
                  <span className="mail-subject">{m.subject}</span>
                  <span className="mail-meta">
                    {dateTime(new Date(m.createdAt))}
                    <Pill tone={m.sent ? "ok" : "warn"}>{m.sent ? "Enviado" : "Aguardando envio"}</Pill>
                  </span>
                </button>
                {openEmail === m.id && <pre className="mail-body">{`Para: ${m.to}\n\n${m.body}`}</pre>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
