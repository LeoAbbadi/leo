import { Link } from "react-router";
import { Glass } from "../components/Glass";
import { ButtonLink, Reveal } from "../components/ui";
import { courseBySlug, courses, lessonCount } from "../content/courses";
import { brl, installmentsLabel } from "../lib/format";

const faq: [string, string][] = [
  ["Como recebo o acesso?", "Assim que o pagamento é confirmado, o curso fica liberado no seu e-mail. Você entra com ele e recebe um link de acesso, sem precisar criar senha."],
  ["Posso parcelar?", "Sim, no cartão em até 12x no curso completo. No Pix a confirmação sai em segundos."],
  ["E se eu não gostar?", "Você tem 7 dias para pedir o reembolso, como garante o Código de Defesa do Consumidor."],
  ["Serve para outros países?", "O foco é a Irlanda, onde a gente mora. Dinheiro, escola, casa e emprego valem para quase qualquer destino."],
];

/** Única página de venda do site: calma, sem cara de loja. */
export function Learn() {
  const main = courseBySlug("irlanda-do-zero") ?? courses[0];
  const others = courses.filter((c) => c.slug !== main.slug);

  return (
    <>
      <section className="section page-top learn">
        <Reveal className="section-head">
          <span className="eyebrow">Quero aprender</span>
          <h1 className="page-title">
            Quer sair do país <em>também?</em>
          </h1>
          <p>
            A gente juntou tudo o que aprendeu indo morar na Irlanda: dinheiro, escola, documentos, casa e trabalho, na ordem
            em que as coisas acontecem.
          </p>
        </Reveal>

        <Reveal>
          <Glass className="learn-main" radius={34} bezel={28} strength={36}>
            <div className="learn-main-copy">
              <span className="eyebrow">{main.kicker}</span>
              <h2>{main.title}</h2>
              <p>{main.summary}</p>
              <ul className="checks">
                {main.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="learn-main-side">
              <span className="muted small">
                {main.modules.length} módulos · {lessonCount(main)} aulas
              </span>
              <strong className="learn-price">{brl(main.priceCents)}</strong>
              <span className="muted small">{installmentsLabel(main.priceCents, main.installments)}</span>
              <ButtonLink to={`/checkout/${main.slug}`} variant="sun" size="lg" className="btn-block">
                Quero começar
              </ButtonLink>
              <Link to={`/cursos/${main.slug}`} className="learn-more">
                Ver tudo o que tem dentro →
              </Link>
            </div>
          </Glass>
        </Reveal>

        <Reveal className="learn-others">
          <span className="eyebrow">Outros jeitos de a gente ajudar</span>
          {others.map((c) => (
            <Link key={c.slug} to={`/cursos/${c.slug}`} className="learn-row">
              <span>
                <strong>{c.title}</strong>
                <span className="muted small">{c.summary}</span>
              </span>
              <span className="learn-row-price">{brl(c.priceCents)} →</span>
            </Link>
          ))}
        </Reveal>
      </section>

      <section className="section faq">
        <Reveal className="section-head">
          <span className="eyebrow">Perguntas</span>
          <h2>Antes de começar</h2>
        </Reveal>
        <Reveal className="faq-list">
          {faq.map(([q, a]) => (
            <Glass as="div" key={q} className="faq-item" radius={22} bezel={14} strength={20}>
              <details>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            </Glass>
          ))}
        </Reveal>
        <p className="learn-login muted small">
          Já comprou? <Link to="/aluno">Entre com o seu e-mail</Link> para assistir.
        </p>
      </section>
    </>
  );
}
