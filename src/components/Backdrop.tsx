import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

// Naipes que flutuam ao fundo: posição, tamanho, tempo e profundidade fixos
// para a cena ser sempre a mesma.
const SUITS = [
  ["♠", 6, 18, 2.2, 26, 0],
  ["♥", 88, 12, 3.4, 32, 1],
  ["♦", 72, 64, 1.6, 22, 0],
  ["♣", 14, 72, 2.8, 30, 1],
  ["♥", 40, 88, 1.2, 18, 0],
  ["♠", 58, 30, 1.0, 20, 1],
  ["♦", 94, 82, 2.4, 28, 0],
  ["♣", 30, 40, 1.4, 24, 1],
  ["♥", 4, 48, 1.8, 34, 1],
  ["♠", 80, 44, 1.1, 21, 0],
] as const;

/** Fundo vivo: brilhos vermelhos que se movem, naipes flutuando e uma luz que segue o ponteiro. */
export function Backdrop() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 90, damping: 22 });
  const sy = useSpring(y, { stiffness: 90, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(226, 35, 46, 0.14), transparent 60%)`;
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, (v) => v * -0.15);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <motion.div className="float-suits" style={{ y: drift }}>
        {SUITS.map(([ch, left, top, size, duration, blurred], i) => (
          <span
            key={i}
            className={`float-suit ${ch === "♥" || ch === "♦" ? "is-red" : ""} ${blurred ? "is-far" : ""}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              fontSize: `${size * 3}rem`,
              animationDuration: `${duration}s`,
              animationDelay: `${-i * 2.7}s`,
            }}
          >
            {ch}
          </span>
        ))}
      </motion.div>
      <motion.div className="spotlight" style={{ background: spotlight }} />
      <div className="grain" />
    </div>
  );
}
