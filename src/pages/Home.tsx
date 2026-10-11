import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import selfie from "../assets/leo-e-helena.webp";
import { PostCard as BlogCard, PostCover } from "../components/BlogCard";
import { Coverflow } from "../components/Coverflow";
import { Glass } from "../components/Glass";
import { HeroScene } from "../components/HeroScene";
import { LogoMark } from "../components/Logo";
import { Scene } from "../components/Postcard";
import { NowCard } from "../components/NowCard";
import { GlassLens, Sticker, stickerArt } from "../components/Stickers";
import { ButtonLink, Reveal } from "../components/ui";
import { WorldMap } from "../components/WorldMap";
import { countries } from "../content/countries";
import { diary, driveImage, introPhotos } from "../content/photos";
import { places } from "../content/places";
import { posts, sortedPosts } from "../content/posts";
import { site } from "../content/site";
import { videos } from "../content/videos";
import { daysSince, fmtMonth } from "../lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

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

export function Home() {
  const destRef = useRef<HTMLDivElement>(null);
  const days = daysSince(site.homeBase.since);
  const visited = countries.filter((c) => c.status === "base" || c.status === "visitado").length;
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
              <ButtonLink to="/diario" variant="sun" size="lg">
                Ler o diário <span aria-hidden="true">→</span>
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
            <NowCard />
          </motion.div>
        </div>

        <div className="hero-bottom hero-bottom-posts">
          <div className="dest">
            <div className="dest-head">
              <strong>Últimas do diário</strong>
              <Link to="/diario">Ver todas</Link>
            </div>
            <div className="dest-wrap">
              <button type="button" className="dest-arrow dest-prev" aria-label="Posts anteriores" onClick={() => destRef.current?.scrollBy({ left: -300, behavior: "smooth" })}>
                ←
              </button>
              <div className="dest-row" ref={destRef}>
                {sortedPosts.map((p, i) => (
                  <motion.div key={p.slug} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.8 + i * 0.08, ease }}>
                    <Link to={`/diario/${p.slug}`} className="dest-card">
                      <PostCover post={p} size={600} />
                      <span className="dest-cap">
                        <span className="dest-meta">{p.category}</span>
                        <strong>{p.title}</strong>
                        <span className="dest-date mono">{fmtMonth(p.date)}</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
                {diary.map((p, i) => (
                  <motion.figure
                    key={p.place}
                    className="dest-card"
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.8 + (sortedPosts.length + i) * 0.08, ease }}
                  >
                    {p.driveId ? <img src={driveImage(p.driveId, 600)} alt={p.alt} loading="lazy" referrerPolicy="no-referrer" /> : <Scene name={p.scene} label={p.alt} />}
                    <figcaption className="dest-cap">
                      <span className="dest-meta">{p.meta}</span>
                      <strong>{p.place}</strong>
                      <span className="dest-date">{p.region}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
              <button type="button" className="dest-arrow dest-next" aria-label="Próximos posts" onClick={() => destRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- números ---------- */}
      <section className="stats-strip" aria-label="Em números">
        <div>
          <strong>
            <CountUp value={days} />
          </strong>
          <span>Dias fora do Brasil</span>
        </div>
        <div>
          <strong>{visited}</strong>
          <span>Países visitados</span>
        </div>
        <div>
          <strong>{places.length}</strong>
          <span>Cidades no mapa</span>
        </div>
        <div>
          <strong>{posts.length}</strong>
          <span>Histórias no diário</span>
        </div>
      </section>

      {/* ---------- diário ---------- */}
      <section className="section" id="diario">
        <Reveal className="section-head">
          <span className="eyebrow">Diário</span>
          <h2>
            As últimas <em>histórias</em>
          </h2>
          <p>Viagens, a vida em Dublin e as contas de verdade de cada mês.</p>
        </Reveal>
        <div className="post-grid">
          {sortedPosts.slice(0, 4).map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06} className={i === 0 ? "post-grid-first" : ""}>
              <BlogCard post={p} variant={i === 0 ? "featured" : "default"} />
            </Reveal>
          ))}
        </div>
        <div className="section-more">
          <ButtonLink to="/diario" variant="ghost">
            Ver o diário completo
          </ButtonLink>
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

      {/* ---------- países ---------- */}
      <section className="countries on-dark" id="paises">
        <Reveal className="section-head center">
          <span className="eyebrow">Países</span>
          <h2>
            Cada país, <em>um álbum</em>
          </h2>
          <p>Arraste para os lados e toque no país para ver as fotos de lá.</p>
        </Reveal>
        <Coverflow />
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

    </>
  );
}
