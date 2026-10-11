import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { Glass } from "../components/Glass";
import { ButtonLink, Reveal } from "../components/ui";
import { courseBySlug, lessonCount, totalMinutes } from "../content/courses";
import { brl, installmentsLabel } from "../lib/format";

export function CourseDetail() {
  const { slug } = useParams();
  const course = courseBySlug(slug);

  if (!course) {
    return (
      <section className="section page-top narrow">
        <h1 className="page-title">Curso não encontrado</h1>
        <p>
          Esse endereço não leva a nenhum curso. <Link to="/cursos">Ver todos os cursos</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="section page-top course">
      <div className="course-main">
        <Reveal>
          <Link to="/cursos" className="back">
            ← Todos os cursos
          </Link>
          <span className="eyebrow">
            {course.kicker} · voo <span className="mono">{course.code}</span>
          </span>
          <h1 className="page-title">{course.title}</h1>
          <p className="lead">{course.summary}</p>
        </Reveal>

        <Reveal>
          <h2 className="h3">Para quem é</h2>
          <ul className="checks">
            {course.forWho.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <h2 className="h3">
            O que tem dentro{" "}
            <span className="muted">
              · {lessonCount(course)} aulas, {totalMinutes(course)} min
            </span>
          </h2>
          <ol className="modules">
            {course.modules.map((m, i) => (
              <Glass as="li" key={m.title} className="module" radius={22} bezel={14} strength={18}>
                <details open={i === 0}>
                  <summary>
                    <span className="module-n mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="module-title">{m.title}</span>
                    <span className="module-count">{m.lessons.length} aulas</span>
                  </summary>
                  <ul>
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <span>{l.title}</span>
                        <span className="lesson-meta">
                          {l.preview && <span className="tag">Aula aberta</span>}
                          <span className="mono">{l.minutes} min</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </Glass>
            ))}
          </ol>
        </Reveal>
      </div>

      <aside className="course-aside">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
          <Glass className="buy" radius={32} bezel={26} strength={36}>
            <span className="eyebrow">Investimento</span>
            <strong className="buy-price">{brl(course.priceCents)}</strong>
            <span className="buy-inst">{installmentsLabel(course.priceCents, course.installments)}</span>
            <ul className="checks">
              {course.includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <ButtonLink to={`/checkout/${course.slug}`} size="lg" className="btn-block">
              Comprar agora
            </ButtonLink>
            <p className="buy-note">Pix ou cartão · Garantia de 7 dias · Acesso imediato</p>
          </Glass>
        </motion.div>
      </aside>
    </section>
  );
}
