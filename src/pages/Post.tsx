import { motion, useScroll, useSpring } from "motion/react";
import { Link, useParams } from "react-router";
import { PostCard, PostCover } from "../components/BlogCard";
import { countryById } from "../content/countries";
import { driveImage } from "../content/photos";
import { postBySlug, readingTime, sortedPosts, type Block } from "../content/posts";
import { fmtMonth } from "../lib/format";

function Body({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b) return <p key={i}>{b.p}</p>;
        if ("h2" in b) return <h2 key={i}>{b.h2}</h2>;
        if ("list" in b)
          return (
            <ul key={i}>
              {b.list.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          );
        if ("stats" in b)
          return (
            <div key={i} className="post-stats">
              {b.stats.map(([v, l]) => (
                <div key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          );
        if ("tip" in b)
          return (
            <aside key={i} className="post-tip">
              {b.tip}
            </aside>
          );
        if ("photo" in b)
          return (
            <figure key={i} className="post-photo">
              <img src={driveImage(b.photo, 1600)} alt={b.caption ?? ""} loading="lazy" referrerPolicy="no-referrer" />
              {b.caption && <figcaption>{b.caption}</figcaption>}
            </figure>
          );
        return null;
      })}
    </>
  );
}

export function Post() {
  const { slug } = useParams();
  const post = postBySlug(slug);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  if (!post) {
    return (
      <section className="section page-top narrow">
        <h1 className="page-title">Post não encontrado</h1>
        <Link to="/diario">Ver o diário</Link>
      </section>
    );
  }

  const country = countryById(post.country);
  const more = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <motion.div className="read-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <article className="post">
        <header className="post-hero on-dark">
          <div className="post-hero-cover" aria-hidden="true">
            <PostCover post={post} size={2000} />
          </div>
          <div className="post-hero-copy">
            <Link to="/diario" className="back back-light">
              ← Diário
            </Link>
            <span className="post-hero-cat">{post.category}</span>
            <h1>{post.title}</h1>
            <span className="post-hero-meta mono">
              {fmtMonth(post.date)} · {readingTime(post)} min de leitura · por {post.author}
            </span>
          </div>
        </header>
        <div className="post-body">
          <p className="post-lead">{post.excerpt}</p>
          <Body blocks={post.body} />
          {country && (
            <Link to={`/paises/${country.id}`} className="post-album">
              Ver o álbum de fotos {country.of} →
            </Link>
          )}
        </div>
      </article>
      {more.length > 0 && (
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Continue lendo</span>
          </div>
          <div className="post-grid post-grid-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
