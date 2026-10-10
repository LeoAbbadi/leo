import { useMemo, useState, type FormEvent } from "react";
import { ConfirmButton, Field, Modal, useToast } from "../../components/ui";
import { shortDate, uid } from "../../lib/format";
import { computeRanking } from "../../lib/ranking";
import { useData } from "../../lib/store";
import type { Player } from "../../lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blank = (): Player => ({ id: "", name: "", nickname: "", email: "", phone: "", createdAt: "" });

export function Players() {
  const { data, savePlayer, deletePlayer } = useData();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Player | null>(null);

  const ranking = useMemo(() => (data ? computeRanking(data) : []), [data]);
  const list = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.players
      .filter((p) => !q || [p.name, p.nickname, p.email, p.phone].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, query]);

  if (!data) return null;
  const rankOf = (id: string) => {
    const idx = ranking.findIndex((r) => r.player.id === id);
    return idx === -1 ? null : { pos: idx + 1, ...ranking[idx] };
  };

  async function save(p: Player) {
    const isNew = !p.id;
    await savePlayer({ ...p, id: p.id || uid("pl"), createdAt: p.createdAt || new Date().toISOString() });
    setEditing(null);
    toast(isNew ? `${p.name} cadastrado.` : "Jogador atualizado.");
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Jogadores</h1>
        <div className="admin-head-actions">
          <label htmlFor="player-search" className="sr-only">
            Buscar jogador
          </label>
          <input
            id="player-search"
            className="search"
            type="search"
            placeholder="Buscar por nome, apelido ou e-mail"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={() => setEditing(blank())}>
            Novo jogador
          </button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Contato</th>
              <th scope="col" className="num">
                Ranking
              </th>
              <th scope="col" className="num">
                Pontos
              </th>
              <th scope="col">Desde</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const r = rankOf(p.id);
              return (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <small className="muted"> {p.nickname}</small>
                  </td>
                  <td>
                    <span className="selectable">{p.email}</span>
                    <br />
                    <small className="muted selectable">{p.phone}</small>
                  </td>
                  <td className="num">{r ? `${r.pos}º` : "–"}</td>
                  <td className="num">{r ? r.points : 0}</td>
                  <td className="nowrap">{p.createdAt ? shortDate(new Date(p.createdAt)) : "–"}</td>
                  <td className="row-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>
                      Editar
                    </button>
                    <ConfirmButton
                      confirmLabel="Excluir e tirar do ranking"
                      onConfirm={async () => {
                        await deletePlayer(p.id);
                        toast(`${p.name} excluído.`);
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
                  Nenhum jogador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar jogador" : "Novo jogador"}>
        {editing && (
          <PlayerForm
            initial={editing}
            emailTaken={(email, id) => data.players.some((p) => p.id !== id && p.email.toLowerCase() === email.toLowerCase())}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function PlayerForm({
  initial,
  emailTaken,
  onSave,
  onCancel,
}: {
  initial: Player;
  emailTaken(email: string, id: string): boolean;
  onSave(p: Player): void;
  onCancel(): void;
}) {
  const [p, setP] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (p.name.trim().length < 3) return setError("Escreva o nome completo do jogador.");
    if (!EMAIL_RE.test(p.email.trim())) return setError("Digite um e-mail válido.");
    if (emailTaken(p.email.trim(), p.id)) return setError("Já existe um jogador com este e-mail.");
    setError(null);
    onSave({
      ...p,
      name: p.name.trim(),
      nickname: p.nickname.trim() || p.name.trim().split(" ")[0],
      email: p.email.trim().toLowerCase(),
    });
  }

  return (
    <form className="stack-form" onSubmit={submit} noValidate>
      <Field id="p-name" label="Nome completo" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
      <Field
        id="p-nick"
        label="Apelido"
        hint="Aparece no ranking abaixo do nome"
        value={p.nickname}
        onChange={(e) => setP({ ...p, nickname: e.target.value })}
      />
      <Field id="p-email" label="E-mail" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} />
      <Field id="p-phone" label="WhatsApp" type="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />
      {error && <p className="field-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
