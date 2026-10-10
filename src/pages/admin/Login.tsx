import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ChipTop } from "../../components/Cards";
import { Field } from "../../components/ui";
import { DEMO_PASSWORD, useAuth } from "../../lib/auth";
import { useData } from "../../lib/store";

export function Login() {
  const { email, login } = useAuth();
  const { data, demo } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  if (email) return <Navigate to="/admin" replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = login(form.email, form.password);
    setError(err);
    if (!err) navigate("/admin");
  }

  return (
    <div className="login">
      <motion.form
        className="login-card"
        onSubmit={submit}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <motion.div
          className="login-chip"
          initial={{ rotate: -200, scale: 0.4 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 12 }}
        >
          <ChipTop color="red" size={64} />
        </motion.div>
        <h1>Área do clube</h1>
        <p className="muted">Entre para editar torneios, jogadores e o ranking de {data?.settings.clubName}.</p>
        <Field
          id="login-email"
          label="E-mail"
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          id="login-password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block">
          Entrar
        </button>
        {demo && data && (
          <div className="demo-credentials">
            <p>Acesso de demonstração</p>
            <span className="selectable">{data.settings.ownerEmail}</span>
            <span className="selectable">{DEMO_PASSWORD}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setForm({ email: data.settings.ownerEmail, password: DEMO_PASSWORD })}
            >
              Preencher
            </button>
          </div>
        )}
        <Link to="/" className="link-arrow">
          ← Voltar para o site
        </Link>
      </motion.form>
    </div>
  );
}
