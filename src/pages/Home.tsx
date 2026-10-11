import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import selfie from "../assets/leo-e-helena.webp";
import { CourseTicket } from "../components/CourseTicket";
import { Glass } from "../components/Glass";
import { HeroScene } from "../components/HeroScene";
import { LogoMark } from "../components/Logo";
import { Scene } from "../components/Postcard";
import { Planner } from "../components/Planner";
import { GlassLens, Sticker, stickerArt } from "../components/Stickers";
import { ButtonLink, Reveal } from "../components/ui";
import { WorldMap } from "../components/WorldMap";
import { courses } from "../content/courses";
import { diary, driveImage, introPhotos } from "../content/photos";
import { places } from "../content/places";
import { site } from "../content/site";
import { videos } from "../content/videos";
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
    const c = animate(0, value, { duration: 1.6, delay: 0.8, ease, onUpdate: (v) => (node.textContent = String(Math.round(v))) });
    return () => c.stop();
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

/** Segunda linha do título que troca de tempos em tempos, com desfoque líquido. */
function Rotating({ words }: { words: readonly string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), 3200);
    return () => window.clearInterval(t);
  }, [words.length]);
  return (
    <span className="rotating" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="rotating-word"
          initial={{ y: "60%", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-60%", opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Foto redonda: do Drive quando existe, ilustração enquanto isso. */
function Circle({ index, className = "" }: { index: number; className?: string }) {
  const p = introPhotos[index];
  return (
    <div className={`circle ${className}`}>
      {p.driveId ? (
        <img src={driveImage(p.driveId, 700)} alt={p.alt} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <Scene name={p.scene} label={p.alt} />
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg className="globe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8" />
    </svg>
  );
}

function VideoCover({ cover }: { cover: (typeof videos)[number]["cover"] }) {
  return (
    <svg className="video-cover" viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`vc-${cover}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B3477" />
          <stop offset="1" stopColor="#0B1626" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill={`url(#vc-${cover})`} />
      {cover === "money" && (
        <g>
          <circle cx="70" cy="22" r="11" fill="#FFB46A" />
          <text x="12" y="24" className="vc-label">
            1º MÊS
          </text>
          <text x="45" y="84" textAnchor="middle" className="vc-big">
            €
          </text>
          <rect x="14" y="98" width="46" height="7" rx="3.5" fill="#FF7A4D" />
          <rect x="14" y="109" width="30" height="7" rx="3.5" fill="#4F8BFF" />
        </g>
      )}
      {cover === "paris" && <Scene name="paris" label="" />}
    </svg>
  );
}

// garantias da compra (ícones de traço simples)
const perks: [string, string][] = [
  ["Garantia de 7 dias", "M12 2.8 4.5 5.6v6c0 4.6 3.2 8.4 7.5 9.6 4.3-1.2 7.5-5 7.5-9.6v-6L12 2.8Zm-1.3 12.9-3.4-3.4 1.4-1.4 2 2 4.6-4.6 1.4 1.4-6 6Z"],
  ["Pix ou até 12x", "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm2 1.5v2h12V8H6Zm0 6v2h5v-2H6Z"],
  ["Acesso na hora", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 4.5v4.1l3.2 1.9-1 1.7L11 12.7V7.5h2Z"],
  ["Pagamento seguro", "M7 10V8a5 5 0 0 1 10 0v2h1.5A1.5 1.5 0 0 1 20 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10H7Zm2 0h6V8a3 3 0 0 0-6 0v2Z"],
];

export function Home() {
  const destRef = useRef<HTMLDivElement>(null);
  const clock = useDublinClock();
  const days = daysSince(site.homeBase.since);
  const featured = videos[0];
  const instagram = site.social.instagram || site.social.youtube || site.social.tiktok;

  return (
    <>
      {/* ---------- topo ---------- */}
      <section className="hero-card on-dark" aria-label="Apresentação">
        <HeroScene photoDriveId={site.hero.photoDriveId} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <motion.span className="hero-eyebrow" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }}>
              <i aria-hidden="true" />
              {site.hero.eyebrow}
            </motion.span>
            <h1 className="hero-title">
              <motion.span className="hero-lead" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.3, ease }}>
                {site.hero.lead}
              </motion.span>
              <Rotating words={site.hero.rotating} />
            </h1>
            <motion.span className="hero-rule" aria-hidden="true" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6, ease }} />
            <motion.p className="hero-sub" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.55, ease }}>
              {site.hero.subtitle}
            </motion.p>
            <motion.div className="hero-actions" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.65, ease }}>
              <ButtonLink to="/cursos" variant="sun" size="lg">
                Ver os cursos <span aria-hidden="true">→</span>
              </ButtonLink>
              <Link to="/#videos" className="watch">
                <span className="watch-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
                <span className="watch-text">
                  <strong>{site.hero.video.title}</strong>
                  <span>{site.hero.video.sub}</span>
                </span>
              </Link>
            </motion.div>
          </div>
          <motion.div className="hero-planner" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.5, ease }}>
            <Planner />
          </motion.div>
        </div>

        <div className="hero-bottom">
          <div className="dest">
            <div className="dest-head">
              <strong>Lugares do diário</strong>
              <Link to="/#mapa">Ver no mapa</Link>
            </div>
            <div className="dest-wrap">
              <button type="button" className="dest-arrow dest-prev" aria-label="Lugares anteriores" onClick={() => destRef.current?.scrollBy({ left: -260, behavior: "smooth" })}>
                ←
              </button>
              <div className="dest-row" ref={destRef}>
                {diary.map((p, i) => (
                  <motion.figure
                    key={p.place}
                    className="dest-card"
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.8 + i * 0.08, ease }}
                    whileHover={{ y: -6 }}
                  >
                    {p.driveId ? (
                      <img src={driveImage(p.driveId, 600)} alt={p.alt} loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                      <Scene name={p.scene} label={p.alt} />
                    )}
                    <figcaption>
                      <span>
                        <strong>{p.place}</strong>
                        <span>{p.region}</span>
                      </span>
                      <span className="dest-meta">{p.meta}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
              <button type="button" className="dest-arrow dest-next" aria-label="Próximos lugares" onClick={() => destRef.current?.scrollBy({ left: 260, behavior: "smooth" })}>
                →
              </button>
            </div>
          </div>
          <Glass className="perks" radius={24} bezel={18} strength={26} blur={3}>
            {perks.map(([label, d]) => (
              <div key={label} className="perk">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={d} />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </Glass>
        </div>
      </section>

      {/* ---------- números ---------- */}
      <section className="stats-strip" aria-label="Em números">
        <div>
          <strong>
            <CountUp value={days} />
          </strong>
          <span>Dias na Irlanda</span>
        </div>
        <div>
          <strong>{places.length}</strong>
          <span>Cidades no mapa</span>
        </div>
        <div>
          <strong>{courses.length}</strong>
          <span>Cursos</span>
        </div>
        <div>
          <strong className="mono">{clock}</strong>
          <span>Agora em Dublin</span>
        </div>
      </section>

      {/* ---------- oi, prazer ---------- */}
      <section className="intro on-dark">
        <Reveal className="intro-head">
          <h2>
            {site.intro.hello}{" "}
            <span className="underlined">
              {site.intro.names}
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                <motion.path
                  d="M4 16 C 60 6, 140 4, 210 10 S 290 18, 296 8"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
                />
              </svg>
            </span>
          </h2>
          <p>{site.intro.text}</p>
        </Reveal>

        <div className="intro-stage">
          <Sticker x="1%" y="4%" m={["2%", "1%"]} size={70} rotate={-12} delay={0.05} label="Adesivo de lua">
            {stickerArt.moon}
          </Sticker>
          <Sticker x="12%" y="0%" m={["21%", "0%"]} size={62} rotate={8} delay={0.1} label="Adesivo de trevo irlandês">
            {stickerArt.shamrock}
          </Sticker>
          <Sticker x="-1%" y="40%" m={["2%", "79%"]} size={92} rotate={-6} delay={0.15} label="Adesivo com a marca Leo e Helena">
            {stickerArt.brand}
          </Sticker>
          <Sticker x="11%" y="36%" m={["37%", "1%"]} size={104} rotate={-10} delay={0.2} label="Adesivo escrito Leo e Helena">
            {stickerArt.names}
          </Sticker>
          <Sticker x="6%" y="74%" m={["24%", "85%"]} size={92} rotate={10} delay={0.25} label="Adesivo de avião">
            {stickerArt.plane}
          </Sticker>

          <Sticker x="80%" y="2%" m={["66%", "1%"]} size={60} rotate={10} delay={0.1} label="Adesivo de passaporte">
            {stickerArt.passport}
          </Sticker>
          <Sticker x="90%" y="6%" m={["81%", "2%"]} size={72} rotate={-8} delay={0.15} label="Selo postal de Dublin">
            {stickerArt.stamp}
          </Sticker>
          <Sticker x="83%" y="38%" m={["47%", "80%"]} size={96} rotate={6} delay={0.2} label="Adesivo da Torre Eiffel">
            {stickerArt.eiffel}
          </Sticker>
          <Sticker x="93%" y="44%" m={["68%", "83%"]} size={74} rotate={-10} delay={0.25} label="Adesivo de globo">
            {stickerArt.globe}
          </Sticker>
          <Sticker x="86%" y="76%" m={["84%", "79%"]} size={66} rotate={-14} delay={0.3} label="Adesivo de lua">
            {stickerArt.moon}
          </Sticker>

          <div className="circles">
            <Circle index={0} className="circle-side" />
            <div className="circle circle-main">
              {introPhotos[1].driveId ? (
                <img src={driveImage(introPhotos[1].driveId, 800)} alt={introPhotos[1].alt} loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <img src={selfie} alt="Helena e Leo numa selfie tirada de baixo, cabeças encostadas" loading="lazy" width="720" height="900" />
              )}
              <span className="circle-badge" aria-hidden="true">
                <LogoMark />
              </span>
            </div>
            <Circle index={2} className="circle-side" />
          </div>
          <GlassLens x="58%" y="66%" m={["60%", "50%"]} size={112} />
        </div>

        <Reveal className="intro-cta">
          <ButtonLink to="/sobre" variant="blue" size="lg">
            Conheça nossa história
          </ButtonLink>
        </Reveal>
      </section>

      {/* ---------- mapa ---------- */}
      <section className="section world" id="mapa">
        <LogoMark className="world-watermark" compact />
        <Reveal className="hashtag-row">
          <div className="pill-collage" aria-hidden="true">
            <Scene name="cliffs" label="" />
            <img src={selfie} alt="" />
            <Scene name="dublin" label="" />
          </div>
          <span className="hashtag">{site.hashtag}</span>
        </Reveal>
        <Reveal className="section-head center">
          <h2 className="plain">
            Nosso mapa de viagens <GlobeIcon />
          </h2>
          <p>
            <strong>Escolha um ponto</strong> e veja a história de cada lugar. Conforme as viagens viram vídeo, cada ponto
            ganha a sua série completa.
          </p>
        </Reveal>
        <Reveal>
          <WorldMap />
        </Reveal>
      </section>

      {/* ---------- vídeos ---------- */}
      <section className="section videos" id="videos">
        <Reveal className="section-head center">
          <span className="video-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <h2 className="plain">A gente te leva junto nos vídeos</h2>
          <p>Sem roteiro pronto: o dia a dia em Dublin, as viagens pela Europa e as contas de verdade de quem acabou de chegar.</p>
          {instagram ? (
            <a className="btn btn-blue btn-lg" href={instagram} target="_blank" rel="noreferrer">
              Siga a gente
            </a>
          ) : (
            <span className="soon">Link do perfil em breve</span>
          )}
        </Reveal>
        {featured && (
          <Reveal className="phone-stage">
            <motion.div className="phone" whileHover={{ y: -6, rotate: 0 }} initial={{ rotate: -3 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
              <Glass className="phone-frame" radius={40} bezel={22} strength={30}>
                <div className="phone-screen">
                  {featured.thumbDriveId ? (
                    <img src={driveImage(featured.thumbDriveId, 600)} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <VideoCover cover={featured.cover} />
                  )}
                  <div className="phone-caption">
                    <span className="eyebrow">{featured.kicker}</span>
                    <strong>{featured.title}</strong>
                  </div>
                  {featured.url ? (
                    <a className="phone-play" href={featured.url} target="_blank" rel="noreferrer" aria-label={`Assistir: ${featured.title}`}>
                      ▶
                    </a>
                  ) : (
                    <span className="phone-play" aria-hidden="true">
                      ▶
                    </span>
                  )}
                </div>
              </Glass>
            </motion.div>
            <motion.div className="float float-a" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <Glass className="pass" radius={22} bezel={16} strength={30}>
                <span className="pass-iata">BR</span>
                <span className="pass-plane" aria-hidden="true">
                  ✈
                </span>
                <span className="pass-iata">DUB</span>
                <span className="pass-meta mono">10 JUL 2026 · SÓ IDA</span>
              </Glass>
            </motion.div>
            <motion.div className="float float-b" animate={{ y: [0, 7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <Glass className="coord" radius={18} bezel={14} strength={26}>
                <span className="mono">53.35° N</span>
                <span className="mono">6.26° O</span>
              </Glass>
            </motion.div>
          </Reveal>
        )}
      </section>

      {/* ---------- cursos ---------- */}
      <section className="section" id="cursos">
        <Reveal className="section-head">
          <span className="eyebrow">Cursos</span>
          <h2>
            Quer ir também? <em>A gente mostra o caminho.</em>
          </h2>
          <p>O que aprendemos indo morar na Irlanda, organizado em cursos curtos e diretos. Você compra uma vez e assiste quando quiser.</p>
        </Reveal>
        <div className="tickets">
          {courses.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <CourseTicket course={c} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <ol className="steps">
            {[
              ["Escolha o curso", "Veja os módulos e assista às aulas abertas antes de decidir."],
              ["Pague com Pix ou cartão", "Pix na hora ou cartão em até 12x, pelo checkout seguro do Mercado Pago."],
              ["Confirmação automática", "O Mercado Pago avisa o site assim que o pagamento cai. Nós conferimos a assinatura e o valor."],
              ["Acesso liberado", "Você entra na Área do aluno com o e-mail da compra e começa a assistir."],
            ].map(([t, d], i) => (
              <Glass as="li" key={t} className="step" radius={26} bezel={18} strength={26}>
                <span className="step-n mono">{String(i + 1).padStart(2, "0")}</span>
                <strong>{t}</strong>
                <span>{d}</span>
              </Glass>
            ))}
          </ol>
          <p className="guarantee">
            <strong>Garantia de 7 dias.</strong> Não gostou? Peça o reembolso em até 7 dias após a compra e devolvemos 100% do valor.
          </p>
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
    </>
  );
}
