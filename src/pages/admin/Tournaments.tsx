import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { ConfirmButton, Field, Modal, Pill, SelectField, TextArea, useToast } from "../../components/ui";
import { brl, isoDate, parseLocalDate, shortDate, tournamentStart, uid, weekdayShort } from "../../lib/format";
import { useData } from "../../lib/store";
import type { Tournament, TournamentStatus } from "../../lib/types";

const STATUS_LABEL: Record<TournamentStatus, string> = {
  agendado: "Agendado",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};
const STATUS_TONE = { agendado: "ok", em_andamento: "warn", finalizado: "muted", cancelado: "danger" } as const;

function blank(): Tournament {
  const d = new Date(Date.now() + 86_400_000);
  return {
    id: "",
    name: "",
    date: isoDate(d),
    time: "20:00",
    buyIn: 200,
    rebuy: null,
    addon: null,
    guaranteed: 10000,
    startingStack: 30000,
    blindMinutes: 20,
    lateRegLevels: 8,
    maxPlayers: 80,
    pointsMultiplier: 1,
    description: "",
    status: "agendado",
    featured: false,
  };
}

const optionalNumber = (v: string) => (v.trim() === "" ? null : Number(v));

export function Tournaments() {
  const { data, saveTournament, deleteTournament } = useData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    if (params.get("novo")) {
      setEditing(blank());
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const list = useMemo(() => {
    if (!data) return [];
    const today = isoDate(new Date());
    return data.tournaments
      .filter((t) => showPast || t.date >= today || (t.status !== "finalizado" && t.status !== "cancelado"))
      .sort((a, b) => tournamentStart(a).getTime() - tournamentStart(b).getTime());
  }, [data, showPast]);

  if (!data) return null;
  const count = (id: string) => data.interests.filter((i) => i.tournamentId === id && i.status !== "cancelado").length;

  async function save(t: Tournament) {
    const isNew = !t.id;
    await saveTournament({ ...t, id: t.id || uid("tr") });
    setEditing(null);
    toast(isNew ? "Torneio criado e publicado na grade." : "Torneio atualizado.");
  }

  function duplicate(t: Tournament) {
    const next = new Date(parseLocalDate(t.date).getTime() + 7 * 86_400_000);
    setEditing({ ...t, id: "", date: isoDate(next), status: "agendado" });
  }

  return (
    <div className="admin-page">
      <header className="admin-head">
        <h1>Torneios</h1>
        <div className="admin-head-actions">
          <label className="check">
            <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
            Mostrar já jogados
          </label>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(blank())}>
            Novo torneio
          </button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Torneio</th>
              <th scope="col" className="num">
                Buy-in
              </th>
              <th scope="col" className="num">
                Garantido
              </th>
              <th scope="col" className="num">
                Inscritos
              </th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td className="nowrap">
                  <b>{weekdayShort(tournamentStart(t))}</b> {shortDate(tournamentStart(t))} {t.time}
                </td>
                <td>
                  {t.name}
                  {t.featured && <span className="star"> ★</span>}
                  {t.pointsMultiplier !== 1 && <small className="muted"> · {t.pointsMultiplier}x pontos</small>}
                </td>
                <td className="num">{brl(t.buyIn)}</td>
                <td className="num">{brl(t.guaranteed)}</td>
                <td className="num">
                  {count(t.id)}/{t.maxPlayers}
                </td>
                <td>
                  <Pill tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Pill>
                </td>
                <td className="row-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(t)}>
                    Editar
                  </button>
                  <Link to={`/admin/torneios/${t.id}/resultados`} className="btn btn-ghost btn-sm">
                    Resultados
                  </Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => duplicate(t)}>
                    Repetir +7 dias
                  </button>
                  <ConfirmButton
                    confirmLabel="Excluir torneio"
                    onConfirm={async () => {
                      await deleteTournament(t.id);
                      toast("Torneio excluído.");
                    }}
                  >
                    Excluir
                  </ConfirmButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar torneio" : "Novo torneio"}
        wide
      >
        {editing && <TournamentForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function TournamentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Tournament;
  onSave(t: Tournament): void;
  onCancel(): void;
}) {
  const [t, setT] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Tournament>(k: K, v: Tournament[K]) => setT((prev) => ({ ...prev, [k]: v }));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (t.name.trim().length < 3) return setError("Dê um nome ao torneio (mínimo de 3 letras).");
    if (!t.date || !t.time) return setError("Informe a data e o horário.");
    if (t.maxPlayers < 2) return setError("O torneio precisa de pelo menos 2 vagas.");
    setError(null);
    onSave({ ...t, name: t.name.trim() });
  }

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="span-2">
        <Field id="t-name" label="Nome do torneio" value={t.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <Field id="t-date" label="Data" type="date" value={t.date} onChange={(e) => set("date", e.target.value)} />
      <Field id="t-time" label="Horário" type="time" value={t.time} onChange={(e) => set("time", e.target.value)} />
      <Field
        id="t-buyin"
        label="Buy-in (R$)"
        type="number"
        min={0}
        value={t.buyIn}
        onChange={(e) => set("buyIn", Number(e.target.value))}
      />
      <Field
        id="t-gtd"
        label="Garantido (R$)"
        type="number"
        min={0}
        value={t.guaranteed}
        onChange={(e) => set("guaranteed", Number(e.target.value))}
      />
      <Field
        id="t-rebuy"
        label="Rebuy (R$)"
        hint="Deixe vazio se não tiver"
        type="number"
        min={0}
        value={t.rebuy ?? ""}
        onChange={(e) => set("rebuy", optionalNumber(e.target.value))}
      />
      <Field
        id="t-addon"
        label="Add-on (R$)"
        hint="Deixe vazio se não tiver"
        type="number"
        min={0}
        value={t.addon ?? ""}
        onChange={(e) => set("addon", optionalNumber(e.target.value))}
      />
      <Field
        id="t-stack"
        label="Stack inicial (fichas)"
        type="number"
        min={0}
        step={1000}
        value={t.startingStack}
        onChange={(e) => set("startingStack", Number(e.target.value))}
      />
      <Field
        id="t-blinds"
        label="Duração do nível (min)"
        type="number"
        min={1}
        value={t.blindMinutes}
        onChange={(e) => set("blindMinutes", Number(e.target.value))}
      />
      <Field
        id="t-late"
        label="Late registration até o nível"
        type="number"
        min={0}
        value={t.lateRegLevels}
        onChange={(e) => set("lateRegLevels", Number(e.target.value))}
      />
      <Field
        id="t-max"
        label="Vagas"
        type="number"
        min={2}
        value={t.maxPlayers}
        onChange={(e) => set("maxPlayers", Number(e.target.value))}
      />
      <SelectField
        id="t-mult"
        label="Pontos no ranking"
        value={t.pointsMultiplier}
        onChange={(e) => set("pointsMultiplier", Number(e.target.value))}
      >
        <option value={0}>Não vale pontos</option>
        <option value={1}>Normal (1x)</option>
        <option value={1.5}>1,5x</option>
        <option value={2}>Dobro (2x)</option>
        <option value={3}>Triplo (3x)</option>
      </SelectField>
      <SelectField
        id="t-status"
        label="Status"
        value={t.status}
        onChange={(e) => set("status", e.target.value as TournamentStatus)}
      >
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </SelectField>
      <div className="span-2">
        <TextArea
          id="t-desc"
          label="Descrição"
          rows={3}
          value={t.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <label className="check span-2">
        <input type="checkbox" checked={t.featured} onChange={(e) => set("featured", e.target.checked)} />
        Destacar na grade
      </label>
      {error && <p className="field-error span-2">{error}</p>}
      <div className="form-actions span-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {initial.id ? "Salvar alterações" : "Publicar torneio"}
        </button>
      </div>
    </form>
  );
}
