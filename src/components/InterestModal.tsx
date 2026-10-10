import { motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { earlyBirdDeadline, longDate, tournamentStart } from "../lib/format";
import { useData } from "../lib/store";
import type { Interest, Tournament } from "../lib/types";
import { ChipTop, type ChipColor } from "./Cards";
import { displayPhone, normalizeBrPhone } from "../lib/messages";
import { Field, Modal } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BURST: ChipColor[] = ["red", "brass", "ivory", "brass", "red", "ivory", "brass", "red"];

interface Props {
  tournament: Tournament | null;
  onClose(): void;
}

export function InterestModal({ tournament, onClose }: Props) {
  const { data, registerInterest } = useData();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Interest | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tournament) {
      setDone(null);
      setErrors({});
    }
  }, [tournament]);

  if (!data) return null;
  const settings = data.settings;
  const eligible = tournament ? new Date() <= earlyBirdDeadline(tournament, settings.earlyBirdHours) : false;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!tournament) return;
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Escreva seu nome completo.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Digite um e-mail válido, como nome@exemplo.com.";
    if (form.phone.trim() && !normalizeBrPhone(form.phone))
      next.phone = "Use DDD e número, como (11) 91234-5678.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      setDone(await registerInterest({ tournamentId: tournament.id, ...form }));
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Não foi possível registrar. Tente de novo." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!tournament}
      onClose={onClose}
      title={done ? (done.status === "confirmado" ? "Inscrição confirmada" : "Interesse registrado") : "Quero jogar"}
    >
      {tournament && !done && (
        <form className="interest-form" onSubmit={submit} noValidate>
          <div className="interest-summary">
            <strong>{tournament.name}</strong>
            <span>
              {longDate(tournamentStart(tournament))}, às {tournament.time}
            </span>
          </div>
          <div className={`eb-note ${eligible ? "is-on" : ""}`}>
            {eligible ? (
              <>
                <strong>Você garante o early bird:</strong> {settings.earlyBirdBonus}.
              </>
            ) : (
              <>O prazo do early bird acabou, mas você ainda pode garantir sua vaga.</>
            )}
          </div>
          <Field
            id="interest-name"
            label="Nome completo"
            autoComplete="name"
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Field
            id="interest-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Field
            id="interest-phone"
            label="WhatsApp (opcional)"
            hint="Enviamos a confirmação com data, horário e local para este número."
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 91234-5678"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.form && <p className="field-error">{errors.form}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Enviando…" : "Enviar interesse ao clube"}
          </button>
        </form>
      )}

      {tournament && done && (
        <div className="interest-done">
          <div className="burst" aria-hidden="true">
            {BURST.map((c, i) => {
              const angle = (i / BURST.length) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="burst-chip"
                  initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                  animate={{ x: Math.cos(angle) * 110, y: Math.sin(angle) * 70, scale: 1, opacity: 0, rotate: 200 }}
                  transition={{ duration: 1.1, ease: [0.2, 0.7, 0.3, 1] }}
                >
                  <ChipTop color={c} size={30} />
                </motion.span>
              );
            })}
            <motion.span
              className="burst-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
            >
              <ChipTop color="brass" size={72} />
            </motion.span>
          </div>
          <p className="interest-done-lead">
            {done.status === "confirmado" ? (
              <>
                Pronto, {done.name.split(" ")[0]}. Você está inscrito no <strong>{tournament.name}</strong>,{" "}
                {longDate(tournamentStart(tournament))} às {tournament.time}.
              </>
            ) : (
              <>
                Pronto, {done.name.split(" ")[0]}. O clube recebeu seu pedido para o <strong>{tournament.name}</strong> e
                vai confirmar sua vaga.
              </>
            )}
          </p>
          {done.earlyBird && (
            <p className="eb-note is-on">
              Early bird garantido: <strong>{settings.earlyBirdBonus}</strong>.
            </p>
          )}
          {done.phone ? (
            <p className="wa-note">
              <span className="wa-dot" aria-hidden="true" />
              {done.status === "confirmado"
                ? "A confirmação com data, horário e local vai para o WhatsApp "
                : "Você recebe a confirmação da vaga no WhatsApp "}
              <strong>{displayPhone(done.phone)}</strong>.
            </p>
          ) : (
            <p className="muted">Sem WhatsApp informado, o clube entra em contato pelo e-mail {done.email}.</p>
          )}
          <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
            Voltar para a grade
          </button>
        </div>
      )}
    </Modal>
  );
}
