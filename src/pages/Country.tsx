import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Glass } from "../components/Glass";
import { Scene } from "../components/Postcard";
import { ButtonLink, Reveal } from "../components/ui";
import { countries, countryById, type CountryPhoto } from "../content/countries";
import { driveImage } from "../content/photos";
import { useCountryPhotos } from "../lib/drivePhotos";

/** Foto em tela cheia, com setas de vidro, teclado e arrastar para os lados. */
function Lightbox({ photos, index, onClose, onGo }: { photos: CountryPhoto[]; index: number; onClose(): void; onGo(i: number): void }) {
  const p = photos[index];
  const prev = useCallback(() => onGo((index - 1 + photos.length) % photos.length), [index, photos.length, onGo]);
  const next = useCallback(() => onGo((index + 1) % photos.length), [index, photos.length, onGo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) next();
    else if (info.offset.x > 60) prev();
    else if (info.offset.y > 120) onClose();
  };

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={p.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={p.driveId}
          className="lightbox-img"
          src={driveImage(p.driveId, 2000)}
          alt={p.alt}
          referrerPolicy="no-referrer"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          onClick={(e) => e.stopPropagation()}
          onPanEnd={onPanEnd}
        />
      </AnimatePresence>
      <Glass className="lightbox-bar" radius={999} bezel={14} strength={22} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={prev} aria-label="Foto anterior">
          ←
        </button>
        <span className="lightbox-caption">
          {p.caption ?? p.city ?? p.alt}
          <span className="mono">
            {index + 1}/{photos.length}
          </span>
        </span>
        <button type="button" onClick={next} aria-label="Próxima foto">
          →
        </button>
        <button type="button" onClick={onClose} aria-label="Fechar">
          ✕
        </button>
      </Glass>
    </motion.div>
  );
}

export function Country() {
  const { id } = useParams();
  const country = countryById(id);
  const { photos, loading } = useCountryPhotos(country);
  const [open, setOpen] = useState<number | null>(null);

  if (!country) {
    return (
      <section className="section page-top narrow">
        <h1 className="page-title">País não encontrado</h1>
        <Link to="/#paises">Ver todos os países</Link>
      </section>
    );
  }

  const others = countries.filter((c) => c.id !== country.id && c.status !== "proximo");

  return (
    <>
      <section className="country-hero on-dark">
        <div className="country-cover" aria-hidden="true">
          {country.coverDriveId ? <img src={driveImage(country.coverDriveId, 2000)} alt="" referrerPolicy="no-referrer" /> : <Scene name={country.scene} label="" />}
        </div>
        <div className="country-head">
          <Link to="/#paises" className="back back-light">
            ← Todos os países
          </Link>
          <Glass as="span" className="flow-tag static" radius={999} bezel={8} strength={14}>
            {country.tag}
          </Glass>
          <h1>{country.name}</h1>
          <span className="flow-rule" aria-hidden="true" />
          <p>{country.tagline}</p>
          {country.cities.length > 0 && (
            <ul className="country-cities">
              {country.cities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section country-gallery">
        {photos.length > 0 ? (
          <>
            <Reveal className="section-head">
              <span className="eyebrow">{photos.length} fotos</span>
              <h2>
                {country.name} <em>pelos nossos olhos</em>
              </h2>
            </Reveal>
            <div className="masonry">
              {photos.map((p, i) => (
                <motion.button
                  key={p.driveId}
                  type="button"
                  className="masonry-item"
                  onClick={() => setOpen(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
                >
                  <img src={driveImage(p.driveId, 900)} alt={p.alt} loading="lazy" referrerPolicy="no-referrer" />
                  {(p.caption || p.city) && <span className="masonry-caption">{p.caption ?? p.city}</span>}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <Reveal className="section-head">
              <span className="eyebrow">{loading ? "Carregando fotos…" : "Fotos em breve"}</span>
              <h2>
                As fotos {country.of} <em>estão a caminho</em>
              </h2>
              <p>Enquanto isso, os lugares em ilustração.</p>
            </Reveal>
            {country.scenes.length > 0 && (
              <div className="masonry masonry-scenes">
                {country.scenes.map((s) => (
                  <figure key={s.name} className="masonry-item">
                    <Scene name={s.name} label={s.label} />
                    <span className="masonry-caption">{s.label}</span>
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {others.length > 0 && (
        <section className="section">
          <Reveal className="section-head">
            <span className="eyebrow">Outros países</span>
          </Reveal>
          <div className="country-others">
            {others.map((c) => (
              <Link key={c.id} to={`/paises/${c.id}`} className="country-other">
                {c.coverDriveId ? <img src={driveImage(c.coverDriveId, 600)} alt="" referrerPolicy="no-referrer" /> : <Scene name={c.scene} label="" />}
                <span>
                  <strong>{c.name}</strong>
                  <span>{c.tagline}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="country-back">
            <ButtonLink to="/#paises" variant="ghost">
              Voltar ao carrossel
            </ButtonLink>
          </div>
        </section>
      )}

      <AnimatePresence>
        {open !== null && photos[open] && <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onGo={setOpen} />}
      </AnimatePresence>
    </>
  );
}
