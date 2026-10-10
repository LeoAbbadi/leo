import { Reorder } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ConfirmButton, useToast } from "../../components/ui";
import { brl, longDate, tournamentStart, uid } from "../../lib/format";
import { pointsFor } from "../../lib/ranking";
import { useData } from "../../lib/store";
import type { Player } from "../../lib/types";

export function Results() {
  const { id } = useParams();
  const { data, setResults, savePlayer } = useData();
  const toast = useToast();
  const [order, setOrder] = useState<string[]>([]);
  const [pick, setPick] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!data || !id || loadedFor === id) return;
    setOrder(
      data.results
        .filter((r) => r.tournamentId === id)
        .sort((a, b) => a.position - b.position)
        .map((r) => r.playerId),
    );
    setLoadedFor(id);
  }, [data, id, loadedFor]);

  if (!data) return null;
  const t = data.tournaments.find((x) => x.id === id);
  if (!t) {
    return (
      <div className="admin-page">
        <p>Torneio não encontrado.</p>
        <Link to="/admin/torneios">Voltar para torneios</Link>
      </div>
    );
  }

  const playersById = new Map(data.players.map((p) => [p.id, p]));
  const available = data.players.filter((p) => !order.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name));
  const interests = data.interests.filter((i) => i.tournamentId === t.id && i.status !== "cancelado");
  const byEmail = new Map(data.players.map((p) => [p.email.toLowerCase(), p]));

  const add = (playerId: string) => playerId && setOrder((o) => (o.includes(playerId) ? o : [...o, playerId]));
  const remove = (playerId: string) => setOrder((o) => o.filter((x) => x !== playerId));
  const move = (idx: number, dir: -1 | 1) =>
    setOrder((o) => {
      const j = idx + dir;
      if (j < 0 || j >= o.length) return o;
      const copy = [...o];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });

  async function registerFromInterest(name: string, email: string, phone: string) {
    const p: Player = {
      id: uid("pl"),
      name,
      nickname: name.split(" ")[0],
      email,
      phone,
      createdAt: new Date().toISOString(),
    };
    await savePlayer(p);
    add(p.id);
    toast(`${name} cadastrado e adicionado ao resultado.`);
  }

  async function save() {
    if (!t) return;
    await setResults(
      t.id,
      order.map((playerId, i) => ({ id: uid("rs"), tournamentId: t.id, playerId, position: i + 1 })),
    );
    toast(order.length ? "Resultado salvo. O ranking já foi atualizado." : "Resultado apagado.");
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <Link to="/admin/torneios" className="link-arrow">
            ← Torneios
          </Link>
          <h1>Resultado: {t.name}</h1>
          <p className="muted">
            {longDate(tournamentStart(t))}, {t.time} · buy-in {brl(t.buyIn)} · pontos{" "}
            {t.pointsMultiplier === 0 ? "não contam" : `${t.pointsMultiplier}x`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          Salvar resultado
        </button>
      </header>

      <div className="admin-columns results-columns">
        <section className="panel">
          <h2>Classificação final</h2>
          <p className="muted">
            Comece pelo campeão. Arraste ou use as setas para ajustar. Pontuam do 1º ao {data.settings.pointsTable.length}º.
          </p>
          {order.length === 0 && <p className="empty">Nenhum jogador adicionado ainda.</p>}
          <Reorder.Group axis="y" values={order} onReorder={setOrder} className="result-list">
            {order.map((pid, i) => {
              const p = playersById.get(pid);
              const pts = pointsFor(i + 1, data.settings.pointsTable, t.pointsMultiplier);
              return (
                <Reorder.Item key={pid} value={pid} className="result-row">
                  <span className="result-pos">{i + 1}º</span>
                  <span className="result-name">{p?.name ?? "Jogador removido"}</span>
                  <span className={`result-pts ${pts ? "" : "muted"}`}>{pts ? `+${pts} pts` : "sem pontos"}</span>
                  <span className="result-actions">
                    <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Subir uma posição">
                      ↑
                    </button>
                    <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Descer uma posição">
                      ↓
                    </button>
                    <button type="button" className="icon-btn" onClick={() => remove(pid)} aria-label="Remover">
                      ×
                    </button>
                  </span>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          <div className="add-row">
            <label htmlFor="add-player" className="sr-only">
              Adicionar jogador na próxima posição
            </label>
            <select id="add-player" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">Adicionar jogador na {order.length + 1}ª posição…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.nickname})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!pick}
              onClick={() => {
                add(pick);
                setPick("");
              }}
            >
              Adicionar
            </button>
          </div>
          {order.length > 0 && (
            <ConfirmButton confirmLabel="Limpar a lista" onConfirm={() => setOrder([])}>
              Limpar lista
            </ConfirmButton>
          )}
        </section>

        <section className="panel">
          <h2>Quem demonstrou interesse</h2>
          {interests.length === 0 && <p className="empty">Ninguém se inscreveu por este torneio no site.</p>}
          <ul className="list">
            {interests.map((i) => {
              const player = byEmail.get(i.email.toLowerCase());
              const inOrder = player && order.includes(player.id);
              return (
                <li key={i.id}>
                  <span className="list-main">
                    <b>{i.name}</b>
                    <small className="muted"> {i.email}</small>
                  </span>
                  <span className="list-meta">
                    {player ? (
                      <button type="button" className="btn btn-ghost btn-sm" disabled={inOrder} onClick={() => add(player.id)}>
                        {inOrder ? "Na lista" : "Adicionar"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => registerFromInterest(i.name, i.email, i.phone)}
                      >
                        Cadastrar e adicionar
                      </button>
                    )}
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
