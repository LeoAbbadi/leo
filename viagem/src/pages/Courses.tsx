import { useEffect, useState } from "react";
import { CourseTicket } from "../components/CourseTicket";
import { Reveal } from "../components/ui";
import { courses } from "../content/courses";
import { gateway } from "../lib/payments";
import { useSession } from "../lib/session";

export function Courses() {
  const { email } = useSession();
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    if (!email) return setOwned([]);
    let alive = true;
    gateway
      .enrollments(email)
      .then((list) => alive && setOwned(list.map((e) => e.courseSlug)))
      .catch(() => alive && setOwned([]));
    return () => {
      alive = false;
    };
  }, [email]);

  return (
    <section className="section page-top">
      <Reveal className="section-head">
        <span className="eyebrow">Cursos</span>
        <h1 className="page-title">
          Escolha o seu <em>próximo voo</em>
        </h1>
        <p>Comece pelo curso completo, organize o dinheiro com a planilha ou fale direto com a gente na mentoria.</p>
      </Reveal>
      <div className="tickets">
        {courses.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <CourseTicket course={c} owned={owned.includes(c.slug)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
