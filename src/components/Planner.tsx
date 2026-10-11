import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { courseBySlug, courses } from "../content/courses";
import { places } from "../content/places";
import { brl } from "../lib/format";
import { Glass } from "./Glass";

/**
 * Cartão "Para onde você vai?": no lugar da busca de voos, monta a rota de quem
 * quer morar fora e indica por onde começar entre os cursos.
 */

type Tab = "morar" | "viajar" | "cursos";

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: "morar",
    label: "Morar fora",
    icon: <path d="M3 13.5 L21 9 L19.5 7.5 L14 8.8 L9.5 4 L7.5 4.5 L10.5 9.9 L5.5 11 L3.8 9.6 L2.4 10 Z" />,
  },
  {
    id: "viajar",
    label: "Viajar",
    icon: <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5c0 4.9 6.5 12.5 6.5 12.5s6.5-7.6 6.5-12.5A6.5 6.5 0 0 0 12 2.5Zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />,
  },
  {
    id: "cursos",
    label: "Cursos",
    icon: <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Zm-6 7.2v4.3c0 1.7 2.7 3.5 6 3.5s6-1.8 6-3.5v-4.3l-6 3-6-3Z" />,
  },
];

const whenOptions = [
  ["3", "Nos próximos 3 meses"],
  ["6", "Em 3 a 6 meses"],
  ["12", "Em 6 a 12 meses"],
  ["24", "Daqui a mais de 1 ano"],
] as const;

const whoOptions = [
  ["eu", "Só eu"],
  ["casal", "Em casal"],
  ["familia", "Com a família"],
] as const;

function Plan({ when, who }: { when: string; who: string }) {
  // pouco tempo pede conversa; com tempo, o curso completo resolve
  const urgent = when === "3";
  const main = courseBySlug(urgent ? "mentoria-a-dois" : "irlanda-do-zero")!;
  const extra = courseBySlug(urgent ? "irlanda-do-zero" : who === "casal" ? "mentoria-a-dois" : "planilha-primeiro-mes")!;
  const why = urgent
    ? "Com a viagem perto, uma conversa com a gente encurta o caminho: revisamos o seu plano e a ordem do que falta."
    : who === "casal"
      ? "Dá tempo de fazer tudo na ordem certa. Indo a dois, vale montar o orçamento juntos desde o começo."
      : "Dá tempo de fazer tudo na ordem certa: dinheiro, escola, documentos, casa e trabalho.";
  return (
    <motion.div className="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <span className="eyebrow">Seu ponto de partida</span>
      <p>{why}</p>
      <Link className="plan-course" to={`/cursos/${main.slug}`}>
        <span className="mono plan-code">{main.code}</span>
        <span>
          <strong>{main.title}</strong>
          <span className="muted small">{brl(main.priceCents)}</span>
        </span>
        <span aria-hidden="true">→</span>
      </Link>
      <Link className="plan-extra" to={`/cursos/${extra.slug}`}>
        Também ajuda: {extra.title}
      </Link>
    </motion.div>
  );
}

export function Planner() {
  const [tab, setTab] = useState<Tab>("morar");
  const [to, setTo] = useState("dublin");
  const [when, setWhen] = useState("6");
  const [who, setWho] = useState("eu");
  const [done, setDone] = useState(false);
  const [trip, setTrip] = useState("paris");
  const trips = places.filter((p) => p.kind !== "casa");
  const tripPlace = places.find((p) => p.id === trip);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <Glass className="planner" radius={28} bezel={24} strength={34} blur={3}>
      <div className="planner-head">
        <strong>Para onde você vai?</strong>
        <span>Monte a sua rota e veja por onde começar</span>
      </div>

      <LayoutGroup id="planner">
        <div className="planner-tabs" role="tablist" aria-label="Tipo de plano">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`planner-tab ${tab === t.id ? "is-on" : ""}`}
              onClick={() => {
                setTab(t.id);
                setDone(false);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {t.icon}
              </svg>
              <span>{t.label}</span>
              {tab === t.id && <motion.span layoutId="planner-line" className="planner-line" />}
            </button>
          ))}
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "morar" && (
          <motion.form key="morar" className="planner-body" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="planner-route">
              <div className="planner-field">
                <span className="planner-label">De</span>
                <span className="planner-value">
                  <i className="dot" /> Brasil
                </span>
              </div>
              <span className="planner-swap" aria-hidden="true">
                ⇅
              </span>
              <label className="planner-field" htmlFor="planner-to">
                <span className="planner-label">Para</span>
                <span className="planner-value">
                  <i className="dot dot-sun" />
                  <select id="planner-to" value={to} onChange={(e) => (setTo(e.target.value), setDone(false))}>
                    <option value="dublin">Dublin, Irlanda</option>
                    <option value="outros" disabled>
                      Outros destinos (em breve)
                    </option>
                  </select>
                </span>
              </label>
            </div>
            <div className="planner-row">
              <label className="planner-field" htmlFor="planner-when">
                <span className="planner-label">Quando</span>
                <select id="planner-when" value={when} onChange={(e) => (setWhen(e.target.value), setDone(false))}>
                  {whenOptions.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="planner-field" htmlFor="planner-who">
                <span className="planner-label">Quem vai</span>
                <select id="planner-who" value={who} onChange={(e) => (setWho(e.target.value), setDone(false))}>
                  {whoOptions.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <AnimatePresence mode="wait">
              {done ? (
                <Plan key={`${when}-${who}`} when={when} who={who} />
              ) : (
                <motion.button key="go" type="submit" className="btn btn-sun btn-lg btn-block planner-go" whileTap={{ scaleX: 1.03, scaleY: 0.95 }}>
                  Ver meu caminho <span aria-hidden="true">→</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>
        )}

        {tab === "viajar" && (
          <motion.div key="viajar" className="planner-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="planner-route">
              <div className="planner-field">
                <span className="planner-label">Saindo de</span>
                <span className="planner-value">
                  <i className="dot" /> Dublin (DUB)
                </span>
              </div>
              <label className="planner-field" htmlFor="planner-trip">
                <span className="planner-label">Destino</span>
                <span className="planner-value">
                  <i className="dot dot-sun" />
                  <select id="planner-trip" value={trip} onChange={(e) => setTrip(e.target.value)}>
                    {trips
                      .filter((p) => p.id !== "dublin")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.city}, {p.country}
                        </option>
                      ))}
                  </select>
                </span>
              </label>
            </div>
            {tripPlace && <p className="planner-note">{tripPlace.note}</p>}
            <Link className="btn btn-sun btn-lg btn-block" to="/#mapa">
              Ver no mapa <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        )}

        {tab === "cursos" && (
          <motion.div key="cursos" className="planner-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ul className="planner-courses">
              {courses.map((c) => (
                <li key={c.slug}>
                  <Link className="plan-course" to={`/cursos/${c.slug}`}>
                    <span className="mono plan-code">{c.code}</span>
                    <span>
                      <strong>{c.title}</strong>
                      <span className="muted small">{brl(c.priceCents)}</span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Glass>
  );
}
