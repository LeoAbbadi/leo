import { Link } from "react-router";
import { lessonCount, totalMinutes, type Course } from "../content/courses";
import { brl, installmentsLabel } from "../lib/format";
import { Glass } from "./Glass";

/** Curso em forma de cartão de embarque. */
export function CourseTicket({ course, owned = false }: { course: Course; owned?: boolean }) {
  const hours = Math.round(totalMinutes(course) / 6) / 10;
  return (
    <Glass as="article" className={`ticket ${course.highlight ? "ticket-highlight" : ""}`} radius={30} bezel={24} strength={34}>
      <div className="ticket-head">
        <span className="eyebrow">{course.kicker}</span>
        {course.highlight && <span className="ticket-flag">Mais procurado</span>}
      </div>
      <div className="ticket-route" aria-label={`De ${course.route[0]} para ${course.route[1]}`}>
        <span>{course.route[0]}</span>
        <span className="ticket-line" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M3 13.5 L21 9 L19.5 7.5 L14 8.8 L9.5 4 L7.5 4.5 L10.5 9.9 L5.5 11 L3.8 9.6 L2.4 10 Z" />
          </svg>
        </span>
        <span>{course.route[1]}</span>
      </div>
      <h3 className="ticket-title">{course.title}</h3>
      <p className="ticket-summary">{course.summary}</p>
      <dl className="ticket-meta">
        <div>
          <dt>Formato</dt>
          <dd>{course.format}</dd>
        </div>
        <div>
          <dt>Aulas</dt>
          <dd>{lessonCount(course)}</dd>
        </div>
        <div>
          <dt>Duração</dt>
          <dd>{course.duration ?? (hours >= 1 ? `${hours.toLocaleString("pt-BR")} h` : `${totalMinutes(course)} min`)}</dd>
        </div>
        <div>
          <dt>Voo</dt>
          <dd className="mono">{course.code}</dd>
        </div>
      </dl>
      <div className="ticket-tear" aria-hidden="true" />
      <div className="ticket-foot">
        <div className="ticket-price">
          <strong>{brl(course.priceCents)}</strong>
          <span>{installmentsLabel(course.priceCents, course.installments)}</span>
        </div>
        {owned ? (
          <Link className="btn btn-glass btn-md" to={`/aluno/${course.slug}`}>
            Assistir
          </Link>
        ) : (
          <Link className="btn btn-primary btn-md" to={`/cursos/${course.slug}`}>
            Ver curso
          </Link>
        )}
      </div>
    </Glass>
  );
}
