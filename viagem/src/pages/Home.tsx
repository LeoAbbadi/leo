import { animate, motion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import photo from "../assets/leo-e-helena.webp";
import { CourseTicket } from "../components/CourseTicket";
import { Glass } from "../components/Glass";
import { HeroWindow } from "../components/HeroWindow";
import { LogoMark } from "../components/Logo";
import { Postcard } from "../components/Postcard";
import { ButtonLink, Reveal } from "../components/ui";
import { WorldMap } from "../components/WorldMap";
import { courses } from "../content/courses";
import { diary } from "../content/photos";
import { places } from "../content/places";
import { site } from "../content/site";
import { daysSince } from "../lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

function useDublinClock() {
  const fmt = () =>
    new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Dublin" }).format(new Date());
  const [now, setNow] = useState(fmt);
  useEffect(() => {
    const t = window.setInterval(() => setNow(fmt()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const c = animate(0, value, {
      duration: 1.6,
      delay: 0.6,
      ease,
      onUpdate: (v) => (node.textContent = String(Math.round(v))),
    });
    return () => c.stop();
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

const words = (text: string) => text.split(" ");

export function Home() {
  const clock = useDublinClock();
  const days = daysSince(site.homeBase.since);
  const [lineA, lineB, lineC] = site.hero.title;

  return (
    <>
      {/* ---------- topo ---------- */}
      <section className="hero">
        <div className="hero-copy">
          <motion.div initial={{ y: 12, scale: 0.94 }} animate={{ y: 0, scale: 1 }} transition={{ duration: 0.7, ease }}>
            <Glass as="span" className="chip" radius={999} bezel={10} strength={18}>
              <span className="chip-dot" aria-hidden="true" />
              <span className="mono">{site.hero.eyebrow}</span>
            </Glass>
          </motion.div>

          <h1 className="hero-title">
            {[...words(lineA), ...words(lineB)].map((w, i) => (
              <Fragment key={i}>
              <span className="word">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.12 + i * 0.07, ease }}
                >
                  {w}
                </motion.span>
              </span>{" "}
              </Fragment>
            ))}
            <span className="word">
              <motion.em initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.55, ease }}>
                {lineC}
              </motion.em>
            </span>
          </h1>

          <motion.p className="hero-sub" initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease }}>
            {site.hero.subtitle}
          </motion.p>

          <motion.div className="hero-actions" initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.62, ease }}>
            <ButtonLink to="/cursos" size="lg">
              Ver os cursos
            </ButtonLink>
            <ButtonLink to="/#diario" variant="ghost" size="lg">
              Ler o diário
            </ButtonLink>
          </motion.div>

          <dl className="hero-stats">
            <div>
              <dt>Dias na Irlanda</dt>
              <dd>
                <CountUp value={days} />
              </dd>
            </div>
            <div>
              <dt>Agora em Dublin</dt>
              <dd className="mono">{clock}</dd>
            </div>
            <div>
              <dt>Cidades no mapa</dt>
              <dd>{places.length}</dd>
            </div>
          </dl>
        </div>

        <motion.div
          className="hero-art"
          initial={{ y: 40, scale: 0.94, rotate: 2 }}
          animate={{ y: 0, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 16, delay: 0.1 }}
        >
          <HeroWindow />
          <motion.div
            className="float float-pass"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Glass className="pass" radius={22} bezel={16} strength={30}>
              <span className="pass-iata">BR</span>
              <span className="pass-plane" aria-hidden="true">
                ✈
              </span>
              <span className="pass-iata">DUB</span>
              <span className="pass-meta mono">10 JUL 2026 · SÓ IDA</span>
            </Glass>
          </motion.div>
          <motion.div
            className="float float-coord"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Glass className="coord" radius={18} bezel={14} strength={26}>
              <span className="mono">53.35° N</span>
              <span className="mono">6.26° O</span>
            </Glass>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- letreiro ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }, (_, k) => (
            <div className="marquee-row" key={k}>
              {["Stamp 2", "IRP", "PPS Number", "Leap Card", "Ha'penny Bridge", "Temple Bar", "Paris", "Cliffs of Moher", "Howth", "20 h por semana", "Euro ↔ real"].map((t) => (
                <span key={t}>
                  {t}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- mapa ---------- */}
      <section className="section" id="rotas">
        <Reveal className="section-head">
          <span className="eyebrow">Rotas</span>
          <h2>
            Do Brasil para Dublin, <em>e daqui para a Europa</em>
          </h2>
          <p>Cada linha é uma viagem que já fizemos. Passe o dedo nos pontos para ver a história de cada lugar.</p>
        </Reveal>
        <Reveal>
          <Glass className="panel panel-map" radius={36} bezel={30} strength={40}>
            <WorldMap />
          </Glass>
        </Reveal>
      </section>

      {/* ---------- diário ---------- */}
      <section className="section" id="diario">
        <Reveal className="section-head">
          <span className="eyebrow">Diário de viagem</span>
          <h2>
            Postais de <em>onde a gente passou</em>
          </h2>
          <p>Fotos e histórias das viagens. Os próximos postais chegam a cada novo destino.</p>
        </Reveal>
        <div className="postcards">
          {diary.map((p, i) => (
            <Reveal key={p.caption} delay={i * 0.06}>
              <Postcard photo={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- cursos ---------- */}
      <section className="section" id="cursos">
        <Reveal className="section-head">
          <span className="eyebrow">Cursos</span>
          <h2>
            Quer ir também? <em>A gente mostra o caminho.</em>
          </h2>
          <p>
            O que aprendemos indo morar na Irlanda, organizado em cursos curtos e diretos. Você compra uma vez e assiste
            quando quiser.
          </p>
        </Reveal>
        <div className="tickets">
          {courses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <CourseTicket course={c} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- como funciona a compra ---------- */}
      <section className="section" id="como-funciona">
        <Reveal className="section-head">
          <span className="eyebrow">Como funciona a compra</span>
          <h2>
            Do pagamento à primeira aula <em>em poucos minutos</em>
          </h2>
        </Reveal>
        <Reveal>
          <ol className="steps">
            {[
              ["Escolha o curso", "Veja o que tem em cada módulo e assista às aulas abertas antes de decidir."],
              ["Pague com Pix ou cartão", "Pix na hora ou cartão em até 12x, pelo checkout seguro do Mercado Pago."],
              ["Confirmação automática", "O Mercado Pago avisa o site assim que o pagamento cai. Nós conferimos a assinatura e o valor."],
              ["Acesso liberado", "Você entra na Área do aluno com o mesmo e-mail da compra e começa a assistir."],
            ].map(([t, d], i) => (
              <Glass as="li" key={t} className="step" radius={26} bezel={18} strength={26}>
                <span className="step-n mono">{String(i + 1).padStart(2, "0")}</span>
                <strong>{t}</strong>
                <span>{d}</span>
              </Glass>
            ))}
          </ol>
          <p className="guarantee">
            <strong>Garantia de 7 dias.</strong> Não gostou? Peça o reembolso em até 7 dias após a compra e devolvemos
            100% do valor.
          </p>
        </Reveal>
      </section>

      {/* ---------- sobre ---------- */}
      <section className="section about" id="nos">
        <Reveal className="about-photo-wrap">
          <motion.div className="about-photo" whileHover={{ rotate: 0, scale: 1.02 }} initial={{ rotate: -3 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
            <Glass className="polaroid" radius={28} bezel={22} strength={30}>
              <img src={photo} alt="Helena e Leo numa selfie tirada de baixo, cabeças encostadas" width="720" height="900" loading="lazy" />
              <span className="polaroid-caption">nós dois, prontos para embarcar</span>
            </Glass>
          </motion.div>
        </Reveal>
        <Reveal className="about-copy">
          <span className="eyebrow">Quem somos</span>
          <h2>{site.about.title}</h2>
          {site.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="about-mark">
            <LogoMark className="about-logo" />
            <p>
              A nossa marca são dois sóis nascendo juntos no horizonte: a Helena em laranja, encostada no Leo em azul.
              Onde os dois se encontram fica a cor do "nós".
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------- perguntas ---------- */}
      <section className="section faq" id="perguntas">
        <Reveal className="section-head">
          <span className="eyebrow">Perguntas frequentes</span>
          <h2>Antes de comprar</h2>
        </Reveal>
        <Reveal className="faq-list">
          {[
            ["Como recebo o acesso?", "Assim que o pagamento é confirmado, o curso aparece na Área do aluno. Você entra com o e-mail usado na compra e recebe um link de acesso, sem precisar criar senha."],
            ["Quanto tempo leva para o Pix ser confirmado?", "Normalmente segundos. O código Pix vale por 30 minutos; se vencer, é só gerar outro."],
            ["Posso parcelar?", "Sim, no cartão de crédito em até 12x no curso completo, direto no checkout do Mercado Pago."],
            ["E se eu não gostar?", "Você tem 7 dias para pedir o reembolso, como garante o Código de Defesa do Consumidor. O acesso é removido quando o valor é devolvido."],
            ["O conteúdo serve para outros países?", "O curso é focado na Irlanda, onde moramos. Planejamento financeiro, escolha de escola e busca de casa e emprego valem para quase qualquer destino."],
          ].map(([q, a]) => (
            <Glass as="div" key={q} className="faq-item" radius={22} bezel={14} strength={20}>
              <details>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            </Glass>
          ))}
        </Reveal>
      </section>

      {/* ---------- chamada final ---------- */}
      <section className="section final">
        <Reveal>
          <Glass className="final-card" radius={44} bezel={36} strength={48}>
            <LogoMark className="final-logo" intro loop />
            <h2>
              Seu embarque <em>começa aqui</em>
            </h2>
            <p>Comece pelo curso completo ou pela planilha. Se travar em alguma parte, marca uma mentoria com a gente.</p>
            <ButtonLink to="/cursos" size="lg">
              Escolher meu curso
            </ButtonLink>
          </Glass>
        </Reveal>
      </section>
    </>
  );
}
