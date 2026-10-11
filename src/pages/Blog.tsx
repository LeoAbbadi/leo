import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { PostCard } from "../components/BlogCard";
import { Reveal } from "../components/ui";
import { sortedPosts, type Post } from "../content/posts";

const cats: ("Tudo" | Post["category"])[] = ["Tudo", "Viagens", "Vida na Irlanda", "Dinheiro", "Diário"];

export function Blog() {
  const [cat, setCat] = useState<(typeof cats)[number]>("Tudo");
  const list = sortedPosts.filter((p) => cat === "Tudo" || p.category === cat);
  const used = new Set(sortedPosts.map((p) => p.category));

  return (
    <section className="section page-top">
      <Reveal className="section-head">
        <span className="eyebrow">Diário</span>
        <h1 className="page-title">
          Histórias de <em>quem foi</em>
        </h1>
        <p>Viagens, a vida em Dublin e as contas de verdade de cada mês.</p>
      </Reveal>
      <LayoutGroup id="blog-cats">
        <div className="segmented small-seg" role="tablist" aria-label="Categorias">
          {cats
            .filter((c) => c === "Tudo" || used.has(c))
            .map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={`segment ${cat === c ? "is-on" : ""}`} onClick={() => setCat(c)}>
                {cat === c && <motion.span layoutId="blog-cat-drop" className="segment-drop" transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
                <span className="segment-label">{c}</span>
              </button>
            ))}
        </div>
      </LayoutGroup>
      <div className="post-grid">
        {list.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05} className={i === 0 ? "post-grid-first" : ""}>
            <PostCard post={p} variant={i === 0 ? "featured" : "default"} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
