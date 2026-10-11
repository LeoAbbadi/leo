import { motion } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { CourseTicket } from "../components/CourseTicket";
import { Glass } from "../components/Glass";
import { LogoMark } from "../components/Logo";
import { Button, ButtonLink, Field, useToast } from "../components/ui";
import { courseBySlug, courses, type Lesson } from "../content/courses";
import { isValidEmail } from "../lib/format";
import { gateway, type Enrollment } from "../lib/payments";
import { useSession } from "../lib/session";

function useEnrollments(email: string | null) {
  const [list, setList] = useState<Enrollment[] | null>(null);
  useEffect(() => {
    if (!email) return setList([]);
    let alive = true;
    const load = () =>
      gateway
        .enrollments(email)
        .then((l) => alive && setList(l))
        .catch(() => alive && setList([]));
    load();
    const unsub = gateway.subscribe(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [email]);
  return list;
}

function SignIn() {
  const { signIn } = useSession();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Confira o e-mail.");
    setError(undefined);
    try {
      const r = await signIn(email);
      if (r === "link") setSent(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível entrar agora.", "bad");
    }
  };

  return (
    <section className="section page-top narrow">
      <Glass className="signin" radius={36} bezel={28} strength={36}>
        <LogoMark className="signin-logo" intro />
        <h1 className="h2">Área do aluno</h1>
        {sent ? (
          <p>
            Pronto! Mandamos um link de acesso para <strong>{email}</strong>. Abra o e-mail neste aparelho para entrar.
          </p>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="muted">Entre com o e-mail que você usou na compra. Não precisa de senha.</p>
            <Field
              id="signin-email"
              label="E-mail da compra"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" size="lg" className="btn-block">
              Entrar
            </Button>
          </form>
        )}
      </Glass>
    </section>
  );
}

export function Student() {
  const { email, ready, signOut } = useSession();
  const list = useEnrollments(email);
  if (!ready) return null;
  if (!email) return <SignIn />;

  const owned = new Set((list ?? []).map((e) => e.courseSlug));
  const mine = courses.filter((c) => owned.has(c.slug));
  const others = courses.filter((c) => !owned.has(c.slug));

  return (
    <section className="section page-top">
      <div className="section-head row">
        <div>
          <span className="eyebrow">Área do aluno</span>
          <h1 className="page-title">
            Seus <em>cursos</em>
          </h1>
          <p className="muted">Conectado como {email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>
          Sair
        </Button>
      </div>

      {list === null ? (
        <p className="muted">Carregando…</p>
      ) : mine.length ? (
        <div className="tickets">
          {mine.map((c) => (
            <CourseTicket key={c.slug} course={c} owned />
          ))}
        </div>
      ) : (
        <Glass className="empty" radius={30} bezel={22} strength={28}>
          <strong>Nenhum curso neste e-mail ainda</strong>
          <p className="muted">
            Se você acabou de pagar com Pix, espere alguns segundos e atualize. Comprou com outro e-mail? Saia e entre com
            ele.
          </p>
          <ButtonLink to="/aprender">Quero aprender</ButtonLink>
        </Glass>
      )}

      {mine.length > 0 && others.length > 0 && (
        <>
          <h2 className="h3 spaced">Outros cursos</h2>
          <div className="tickets">
            {others.map((c) => (
              <CourseTicket key={c.slug} course={c} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const progressKey = (email: string, slug: string) => `leo-helena:progress:${email}:${slug}`;

export function Player() {
  const { slug } = useParams();
  const course = courseBySlug(slug);
  const { email, ready } = useSession();
  const list = useEnrollments(email);
  const lessons = useMemo(() => course?.modules.flatMap((m) => m.lessons) ?? [], [course]);
  const [current, setCurrent] = useState<Lesson | undefined>(lessons[0]);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (!email || !slug) return;
    try {
      setDone(JSON.parse(localStorage.getItem(progressKey(email, slug)) ?? "[]"));
    } catch {
      setDone([]);
    }
  }, [email, slug]);

  if (!course) return null;
  if (!ready || list === null) return <section className="section page-top" />;

  const owned = list.some((e) => e.courseSlug === course.slug);
  const canWatch = (l: Lesson) => owned || l.preview;
  const lesson = current && canWatch(current) ? current : lessons.find(canWatch);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      if (email) localStorage.setItem(progressKey(email, course.slug), JSON.stringify(next));
    } catch {
      /* sem armazenamento */
    }
  };
  const pct = Math.round((done.filter((d) => lessons.some((l) => l.id === d)).length / lessons.length) * 100);

  return (
    <section className="section page-top player">
      <div className="player-main">
        <Link to={owned ? "/aluno" : `/cursos/${course.slug}`} className="back">
          ← {owned ? "Meus cursos" : "Voltar para o curso"}
        </Link>
        <Glass className="video" radius={30} bezel={26} strength={34}>
          <div className="video-stage">
            <LogoMark className="video-logo" />
            <span className="video-play" aria-hidden="true">
              ▶
            </span>
          </div>
          <div className="video-caption">
            <span className="eyebrow">{course.title}</span>
            <strong>{lesson?.title ?? "Escolha uma aula"}</strong>
            <span className="muted small">O vídeo da aula entra aqui quando vocês subirem as gravações.</span>
          </div>
        </Glass>
        {!owned && (
          <Glass className="locked" radius={26} bezel={20} strength={26}>
            <strong>Você está vendo as aulas abertas.</strong>
            <span className="muted">Compre o curso para liberar todas as aulas.</span>
            <ButtonLink to={`/checkout/${course.slug}`}>Comprar</ButtonLink>
          </Glass>
        )}
      </div>

      <aside className="player-list">
        {owned && (
          <div className="progress" aria-label={`Progresso: ${pct}%`}>
            <div className="progress-bar">
              <motion.span animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            <span className="mono">{pct}%</span>
          </div>
        )}
        {course.modules.map((m) => (
          <div key={m.title} className="player-module">
            <span className="eyebrow">{m.title}</span>
            <ul>
              {m.lessons.map((l) => {
                const open = canWatch(l);
                return (
                  <li key={l.id} className={`${lesson?.id === l.id ? "is-current" : ""} ${open ? "" : "is-locked"}`}>
                    {owned && (
                      <input
                        id={`done-${l.id}`}
                        type="checkbox"
                        checked={done.includes(l.id)}
                        onChange={() => toggle(l.id)}
                        aria-label={`Marcar "${l.title}" como assistida`}
                      />
                    )}
                    <button type="button" disabled={!open} onClick={() => setCurrent(l)}>
                      <span>{l.title}</span>
                      <span className="mono small">{open ? `${l.minutes} min` : "🔒"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>
    </section>
  );
}
