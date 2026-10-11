import { motion } from "motion/react";
import { Link } from "react-router";
import { driveImage } from "../content/photos";
import { readingTime, type Post } from "../content/posts";
import { fmtMonth } from "../lib/format";
import { Scene } from "./Postcard";

export function PostCover({ post, size = 900 }: { post: Post; size?: number }) {
  return post.coverDriveId ? (
    <img src={driveImage(post.coverDriveId, size)} alt="" loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <Scene name={post.scene} label="" />
  );
}

/** Cartão de post do diário. `variant="featured"` é o grande, em destaque. */
export function PostCard({ post, variant = "default" }: { post: Post; variant?: "default" | "featured" | "compact" }) {
  return (
    <motion.article className={`post-card post-card-${variant}`} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Link to={`/diario/${post.slug}`} className="post-card-link">
        <div className="post-card-cover">
          <PostCover post={post} size={variant === "featured" ? 1400 : 800} />
          <span className="post-card-cat">{post.category}</span>
        </div>
        <div className="post-card-body">
          <span className="post-card-meta mono">
            {fmtMonth(post.date)} · {readingTime(post)} min · {post.author}
          </span>
          <h3>{post.title}</h3>
          {variant !== "compact" && <p>{post.excerpt}</p>}
        </div>
      </Link>
    </motion.article>
  );
}
