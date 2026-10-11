import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useId, useRef, type RefObject } from "react";

/**
 * Marca "Nascer a dois": dois sóis nascendo juntos no horizonte.
 * O laranja (Helena) é menor e vem inclinado, encostando no azul (Leo), como
 * na foto de vocês. Onde os dois se cruzam nasce a cor da tinta ("nós").
 * A rota pontilhada decola do horizonte: a mudança, a viagem.
 */
export const MARK = {
  viewBox: "6 4 108 88",
  helena: { cx: 47, cy: 72, r: 22 },
  leo: { cx: 76, cy: 64, r: 26 },
  horizon: { x: 12, y: 82, w: 96, h: 5 },
  clipY: 80,
  route: "M14 72 C 16 40 34 20 70 14.8",
  /** Avião centrado na origem, apontando para a direita. */
  plane: "M-5.6 -4.3 L5.6 0 L-5.6 4.3 L-3.1 0 Z",
  /** Até onde os pontinhos vão (o resto fica escondido sob o avião). */
  routeVisible: 0.86,
} as const;

/** Ponto e ângulo de um caminho SVG para um progresso entre 0 e 1. */
export function pointOnPath(path: SVGPathElement, p: number) {
  const len = path.getTotalLength();
  const at = Math.min(Math.max(p, 0), 1) * len;
  const a = path.getPointAtLength(at);
  const ahead = at + 0.5 <= len;
  const b = path.getPointAtLength(ahead ? at + 0.5 : Math.max(at - 0.5, 0));
  const angle = ahead ? Math.atan2(b.y - a.y, b.x - a.x) : Math.atan2(a.y - b.y, a.x - b.x);
  return { x: a.x, y: a.y, angle: (angle * 180) / Math.PI };
}

/**
 * Faz um elemento SVG seguir um caminho conforme o progresso (0 a 1),
 * escrevendo o atributo transform direto (funciona em todos os navegadores).
 */
export function usePathFollower(
  pathRef: RefObject<SVGPathElement | null>,
  targetRef: RefObject<SVGElement | null>,
  progress: MotionValue<number>,
) {
  useEffect(() => {
    const apply = (p: number) => {
      const path = pathRef.current;
      const target = targetRef.current;
      if (!path || !target) return;
      const { x, y, angle } = pointOnPath(path, p);
      target.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
    };
    apply(progress.get());
    return progress.on("change", apply);
  }, [pathRef, targetRef, progress]);
}

interface LogoMarkProps {
  className?: string;
  /** Toca a animação de entrada. */
  intro?: boolean;
  /** Repete o voo do avião de tempos em tempos. */
  loop?: boolean;
  /** Versão sem a rota, para tamanhos pequenos. */
  compact?: boolean;
  title?: string;
  /** Atraso inicial da animação, em segundos. */
  delay?: number;
}

export function LogoMark({ className = "", intro = false, loop = false, compact = false, title, delay = 0 }: LogoMarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = { clip: `hz${uid}`, cl: `cl${uid}`, sun: `sun${uid}`, sea: `sea${uid}`, mask: `rm${uid}` };
  const { helena: H, leo: L, horizon: Z } = MARK;
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGPathElement>(null);
  const flight = useMotionValue(intro ? 0 : 1);
  usePathFollower(routeRef, planeRef, flight);
  const routeLength = useTransform(flight, (p) => Math.max(0, Math.min(p, 1) * MARK.routeVisible));
  const planeOpacity = useTransform(flight, [0, 0.04, 1], [0, 1, 1]);

  useEffect(() => {
    if (compact) return;
    let stopped = false;
    let controls: ReturnType<typeof animate> | undefined;
    let timer: number | undefined;
    const fly = (wait: number) => {
      flight.set(0);
      controls = animate(flight, 1, { duration: 1.25, delay: wait, ease: [0.45, 0, 0.2, 1] });
      controls.then(() => {
        if (!stopped && loop) timer = window.setTimeout(() => fly(0), 9000);
      });
    };
    if (intro) fly(delay + 1.05);
    else if (loop) timer = window.setTimeout(() => fly(0), 6000);
    return () => {
      stopped = true;
      controls?.stop();
      window.clearTimeout(timer);
    };
  }, [intro, loop, compact, delay, flight]);

  // os sóis sobem animando o centro (cy), o que funciona até dentro de clipPath
  const rise = (cy: number, d: number) =>
    intro
      ? {
          initial: { cy: cy + 34 },
          animate: { cy },
          transition: { type: "spring" as const, stiffness: 120, damping: 15, delay: delay + d },
        }
      : {};

  const viewBox = compact ? "8 34 104 58" : MARK.viewBox;

  return (
    <svg
      className={`logo-mark ${className}`}
      viewBox={viewBox}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={ids.sun} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sun-a)" />
          <stop offset="1" stopColor="var(--sun-b)" />
        </linearGradient>
        <linearGradient id={ids.sea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sea-a)" />
          <stop offset="1" stopColor="var(--sea-b)" />
        </linearGradient>
        <clipPath id={ids.clip}>
          <rect x="0" y="0" width="120" height={MARK.clipY} />
        </clipPath>
        <clipPath id={ids.cl}>
          <motion.circle cx={H.cx} cy={H.cy} r={H.r} {...rise(H.cy, 0.2)} />
        </clipPath>
        {!compact && (
          <mask id={ids.mask} maskUnits="userSpaceOnUse">
            <motion.path
              d={MARK.route}
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              style={{ pathLength: routeLength }}
            />
          </mask>
        )}
      </defs>

      <g clipPath={`url(#${ids.clip})`}>
        <motion.circle cx={H.cx} cy={H.cy} r={H.r} fill={`url(#${ids.sun})`} {...rise(H.cy, 0.2)} />
        <motion.circle cx={L.cx} cy={L.cy} r={L.r} fill={`url(#${ids.sea})`} {...rise(L.cy, 0.36)} />
        <motion.circle
          cx={L.cx}
          cy={L.cy}
          r={L.r}
          fill="var(--mark-ink, var(--ink))"
          clipPath={`url(#${ids.cl})`}
          {...(intro
            ? {
                initial: { opacity: 0, cy: L.cy + 34 },
                animate: { opacity: 1, cy: L.cy },
                transition: {
                  cy: { type: "spring", stiffness: 120, damping: 15, delay: delay + 0.36 },
                  opacity: { duration: 0.35, delay: delay + 0.85 },
                },
              }
            : {})}
        />
      </g>

      <motion.rect
        x={Z.x}
        y={Z.y}
        width={Z.w}
        height={Z.h}
        rx={Z.h / 2}
        fill="var(--mark-ink, var(--ink))"
        {...(intro
          ? {
              initial: { x: Z.x + Z.w / 2, width: 0 },
              animate: { x: Z.x, width: Z.w },
              transition: { duration: 0.6, delay, ease: [0.65, 0, 0.35, 1] },
            }
          : {})}
      />

      {!compact && (
        <>
          <path ref={routeRef} d={MARK.route} fill="none" stroke="none" />
          <path
            d={MARK.route}
            fill="none"
            stroke="var(--mark-ink, var(--ink))"
            strokeWidth="2.6"
            strokeDasharray="0.4 6"
            strokeLinecap="round"
            mask={`url(#${ids.mask})`}
          />
          <motion.path ref={planeRef} d={MARK.plane} fill="var(--mark-ink, var(--ink))" style={{ opacity: planeOpacity }} />
        </>
      )}
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      leo<em>&amp;</em>helena
    </span>
  );
}

export function LogoLockup({ intro = false, className = "" }: { intro?: boolean; className?: string }) {
  return (
    <span className={`lockup ${className}`}>
      <LogoMark intro={intro} loop={intro} />
      <Wordmark />
    </span>
  );
}
