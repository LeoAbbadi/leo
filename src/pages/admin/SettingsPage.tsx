import { useEffect, useState, type FormEvent } from "react";
import { ConfirmButton, Field, TextArea, useToast } from "../../components/ui";
import { useData } from "../../lib/store";
import type { Settings } from "../../lib/types";

export function SettingsPage() {
  const { data, saveSettings, resetDemo, demo } = useData();
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    if (data && !s) setS(data.settings);
  }, [data, s]);

  if (!s) return null;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!s) return;
    await saveSettings({ ...s, pointsTable: s.pointsTable.map((n) => Math.max(0, Math.round(n || 0))) });
    toast("Configurações salvas.");
  }

  return (
    <form className="admin-page" onSubmit={submit}>
      <header className="admin-head">
        <h1>Configurações</h1>
        <button type="submit" className="btn btn-primary">
          Salvar configurações
        </button>
      </header>

      <section className="panel">
        <h2>Clube</h2>
        <div className="form-grid">
          <Field id="s-name" label="Nome do clube" value={s.clubName} onChange={(e) => set("clubName", e.target.value)} />
          <Field id="s-tagline" label="Frase de apresentação" value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
          <Field id="s-address" label="Endereço" value={s.address} onChange={(e) => set("address", e.target.value)} />
          <Field id="s-city" label="Cidade" value={s.city} onChange={(e) => set("city", e.target.value)} />
          <Field id="s-whats" label="WhatsApp" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Field
            id="s-owner"
            label="E-mail do dono"
            hint="Recebe os avisos de interesse e é o login da área do clube"
            type="email"
            value={s.ownerEmail}
            onChange={(e) => set("ownerEmail", e.target.value)}
          />
        </div>
      </section>

      <section className="panel">
        <h2>Early bird</h2>
        <div className="form-grid">
          <Field
            id="s-eb-hours"
            label="Prazo (horas antes do início)"
            type="number"
            min={0}
            value={s.earlyBirdHours}
            onChange={(e) => set("earlyBirdHours", Number(e.target.value))}
          />
          <Field id="s-eb-bonus" label="Bônus" value={s.earlyBirdBonus} onChange={(e) => set("earlyBirdBonus", e.target.value)} />
        </div>
      </section>

      <section className="panel">
        <h2>Ranking do semestre</h2>
        <div className="form-grid">
          <div className="span-2">
            <Field id="s-season" label="Nome da temporada" value={s.seasonName} onChange={(e) => set("seasonName", e.target.value)} />
          </div>
          <Field id="s-start" label="Início" type="date" value={s.seasonStart} onChange={(e) => set("seasonStart", e.target.value)} />
          <Field id="s-end" label="Fim" type="date" value={s.seasonEnd} onChange={(e) => set("seasonEnd", e.target.value)} />
          <div className="span-2">
            <TextArea id="s-prize" label="Prêmio" rows={2} value={s.seasonPrize} onChange={(e) => set("seasonPrize", e.target.value)} />
          </div>
        </div>

        <h3>Pontos por colocação</h3>
        <p className="muted">Quem termina depois da última posição da tabela não pontua.</p>
        <div className="points-grid">
          {s.pointsTable.map((p, i) => (
            <div className="points-cell" key={i}>
              <label htmlFor={`pts-${i}`}>{i + 1}º</label>
              <input
                id={`pts-${i}`}
                type="number"
                min={0}
                value={p}
                onChange={(e) => set("pointsTable", s.pointsTable.map((v, j) => (j === i ? Number(e.target.value) : v)))}
              />
            </div>
          ))}
        </div>
        <div className="form-actions form-actions-left">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => set("pointsTable", [...s.pointsTable, Math.max(1, (s.pointsTable.at(-1) ?? 10) - 2)])}
          >
            + posição
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={s.pointsTable.length <= 1}
            onClick={() => set("pointsTable", s.pointsTable.slice(0, -1))}
          >
            − posição
          </button>
        </div>
      </section>

      {demo && (
        <section className="panel">
          <h2>Dados de demonstração</h2>
          <p className="muted">Volta todos os torneios, jogadores, inscrições e resultados para os exemplos iniciais.</p>
          <ConfirmButton
            confirmLabel="Apagar alterações e restaurar"
            onConfirm={async () => {
              await resetDemo();
              setS(null);
              toast("Dados de exemplo restaurados.");
            }}
          >
            Restaurar exemplos
          </ConfirmButton>
        </section>
      )}
    </form>
  );
}
