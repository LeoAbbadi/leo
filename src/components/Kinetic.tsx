import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Texto que entra letra por letra, saindo de um leve desfoque. */
export function SplitText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  let i = 0;
  return (
    <span className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, w) => (
        <span className="split-word" key={w} aria-hidden="true">
          {[...word].map((ch) => {
            const d = delay + i++ * 0.035;
            return (
              <motion.span
                key={`${w}-${d}`}
                className="split-char"
                initial={{ y: "0.55em", opacity: 0, rotateX: -70, filter: "blur(10px)" }}
                animate={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: d, ease: EASE }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** Palavra em letra cursiva que “se escreve” da esquerda para a direita. */
export function ScriptWord({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.span
      className="script-word"
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
      animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      transition={{ duration: 1.4, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.span>
  );
}

/** Dígitos que viram como placar mecânico quando o valor muda. */
export function FlipNumber({ value, digits = 2 }: { value: number; digits?: number }) {
  const str = String(value).padStart(digits, "0");
  return (
    <span className="flip-number" aria-label={str}>
      {[...str].map((ch, i) => (
        <span className="flip-slot" key={i} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className="flip-digit"
              initial={{ y: "-70%", opacity: 0, rotateX: 80 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: "70%", opacity: 0, rotateX: -80 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

interface GlassProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tilt?: number;
  as?: "div" | "article" | "section" | "li";
}

/**
 * Superfície de vidro que inclina levemente e acende um reflexo
 * onde o ponteiro passa, como vidro de verdade sob a luz.
 */
export function Glass({ children, className = "", style, tilt = 6, as = "div" }: GlassProps) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 20 });
  const sy = useSpring(py, { stiffness: 180, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-tilt, tilt]);
  const rotateX = useTransform(sy, [0, 1], [tilt, -tilt]);
  const lx = useTransform(sx, (v) => `${v * 100}%`);
  const ly = useTransform(sy, (v) => `${v * 100}%`);
  const shine = useMotionTemplate`radial-gradient(420px circle at ${lx} ${ly}, rgba(255,255,255,0.16), transparent 45%)`;
  const Comp = motion[as];

  function onMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  return (
    <Comp
      className={`glass glass-live ${className}`}
      style={{ ...style, rotateX: tilt ? rotateX : 0, rotateY: tilt ? rotateY : 0, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <motion.span className="glass-shine" style={{ background: shine }} aria-hidden="true" />
      {children}
    </Comp>
  );
}

/** Entra subindo quando aparece na tela, sem nunca ficar invisível. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 48, opacity: 0.55, scale: 0.97 }}
      whileInView={{ y: 0, opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Faixa de texto gigante que corre na horizontal. */
export function MarqueeText({ text, reverse = false }: { text: string; reverse?: boolean }) {
  return (
    <div className={`marquee-text ${reverse ? "is-reverse" : ""}`} aria-hidden="true">
      <div className="marquee-text-track">
        {[0, 1].map((k) => (
          <span key={k}>
            {text}
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
