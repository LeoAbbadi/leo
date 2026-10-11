import { motion } from "motion/react";
import photo from "../assets/leo-e-helena.webp";
import { Glass } from "../components/Glass";
import { LogoMark } from "../components/Logo";
import { ButtonLink, Reveal } from "../components/ui";
import { site } from "../content/site";
import { daysSince } from "../lib/format";

export function About() {
  const days = daysSince(site.homeBase.since);
  return (
    <>
      <section className="section page-top about">
        <Reveal className="about-photo-wrap">
          <motion.div
            className="about-photo"
            whileHover={{ rotate: 0, scale: 1.02 }}
            initial={{ rotate: -3 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <Glass className="polaroid" radius={28} bezel={22} strength={30}>
              <img src={photo} alt="Helena e Leo numa selfie tirada de baixo, cabeças encostadas" width="720" height="900" />
              <span className="polaroid-caption">nós dois, prontos para embarcar</span>
            </Glass>
          </motion.div>
        </Reveal>
        <Reveal className="about-copy">
          <span className="eyebrow">Sobre nós</span>
          <h1 className="page-title">{site.about.title}</h1>
          {site.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
      </section>

      <section className="section timeline-section">
        <Reveal className="section-head">
          <span className="eyebrow">Linha do tempo</span>
          <h2>
            Do Brasil para Dublin, <em>uma coisa de cada vez</em>
          </h2>
        </Reveal>
        <ol className="timeline">
          {site.timeline.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.06}>
              <Glass as="li" className="timeline-item" radius={24} bezel={16} strength={24}>
                <span className="timeline-when mono">{t.when}</span>
                <strong>{t.title}</strong>
                <span className="muted">{t.text}</span>
              </Glass>
            </Reveal>
          ))}
          <Reveal delay={site.timeline.length * 0.06}>
            <Glass as="li" className="timeline-item timeline-now" radius={24} bezel={16} strength={24}>
              <span className="timeline-when mono">Hoje</span>
              <strong>{days} dias na Irlanda</strong>
              <span className="muted">E contando. As próximas viagens entram no mapa e no diário.</span>
            </Glass>
          </Reveal>
        </ol>
      </section>

      <section className="section">
        <Reveal>
          <Glass className="final-card" radius={44} bezel={36} strength={48}>
            <LogoMark className="final-logo" intro loop />
            <h2>
              A nossa marca <em>conta essa história</em>
            </h2>
            <p>
              Dois sóis nascendo juntos no horizonte: a Helena em laranja, encostada no Leo em azul. Onde os dois se
              encontram fica a cor do "nós". A rota que decola do horizonte é a mudança.
            </p>
            <ButtonLink to="/cursos" size="lg">
              Ver os cursos
            </ButtonLink>
          </Glass>
        </Reveal>
      </section>
    </>
  );
}
