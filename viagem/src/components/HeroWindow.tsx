import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef, type PointerEvent } from "react";
import { Glass } from "./Glass";
import { MARK, usePathFollower } from "./Logo";

/**
 * A janela do avião: a marca em tamanho grande, animada como uma cena.
 * Os dois sóis nascem no mar, o reflexo tremula e o avião decola do horizonte.
 * A moldura é vidro líquido de verdade e entorta a cena nas bordas.
 */

const W = 400;
const H = 520;
const HORIZON = 330;
const SCALE = 4.2;
// converte coordenadas da marca (viewBox pequeno) para a cena
const sx = (x: number) => W / 2 + (x - 61.5) * SCALE;
const sy = (y: number) => HORIZON + (y - 81) * SCALE;

const helena = { cx: sx(MARK.helena.cx), cy: sy(MARK.helena.cy), r: MARK.helena.r * SCALE };
const leo = { cx: sx(MARK.leo.cx), cy: sy(MARK.leo.cy), r: MARK.leo.r * SCALE };
const ROUTE = "M30 316 C 46 180 150 92 300 70 S 420 58 470 40";
const STARS = Array.from({ length: 46 }, (_, i) => {
  // pseudoaleatório estável: o céu é o mesmo a cada visita
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.678;
  return { x: (a - Math.floor(a)) * W, y: (b - Math.floor(b)) * (HORIZON - 40), r: 0.6 + Math.abs((a * 7) % 1) * 1.2 };
});

export function HeroWindow() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `${s}${uid}`;
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const flight = useMotionValue(0);
  usePathFollower(routeRef, planeRef, flight);
  const trail = useTransform(flight, (p) => Math.max(0, p - 0.03));
  const planeOpacity = useTransform(flight, [0, 0.03, 0.9, 1], [0, 1, 1, 0]);

  // leve paralaxe com o ponteiro
  const px = useSpring(0, { stiffness: 60, damping: 18 });
  const py = useSpring(0, { stiffness: 60, damping: 18 });
  const sunX = useTransform(px, (v) => v * -10);
  const seaX = useTransform(px, (v) => v * -16);
  const cloudX = useTransform(px, (v) => v * 26);
  const cloudY = useTransform(py, (v) => v * 8);

  useEffect(() => {
    let stop = false;
    let timer: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const fly = (delay: number) => {
      flight.set(0);
      controls = animate(flight, 1, { duration: 4.2, delay, ease: [0.5, 0, 0.25, 1] });
      controls.then(() => {
        if (!stop) timer = window.setTimeout(() => fly(0), 5200);
      });
    };
    fly(1.6);
    return () => {
      stop = true;
      controls?.stop();
      window.clearTimeout(timer);
    };
  }, [flight]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const sunRise = (cy: number, delay: number) => ({
    initial: { cy: cy + 150 },
    animate: { cy },
    transition: { type: "spring" as const, stiffness: 46, damping: 13, delay },
  });

  return (
    <div className="hero-window" onPointerMove={onMove} onPointerLeave={() => (px.set(0), py.set(0))}>
      <svg className="hero-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--scene-sky-a)" />
            <stop offset="0.7" stopColor="var(--scene-sky-b)" />
            <stop offset="1" stopColor="var(--scene-sky-c)" />
          </linearGradient>
          <linearGradient id={id("water")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--scene-sea-a)" />
            <stop offset="1" stopColor="var(--scene-sea-b)" />
          </linearGradient>
          <linearGradient id={id("sun")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sun-a)" />
            <stop offset="1" stopColor="var(--sun-b)" />
          </linearGradient>
          <linearGradient id={id("sea")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sea-a)" />
            <stop offset="1" stopColor="var(--sea-b)" />
          </linearGradient>
          <radialGradient id={id("glow")} cx="0.5" cy="1" r="0.75">
            <stop offset="0" stopColor="var(--sun-a)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--sun-a)" stopOpacity="0" />
          </radialGradient>
          <clipPath id={id("above")}>
            <rect x="0" y="0" width={W} height={HORIZON - 6} />
          </clipPath>
          <clipPath id={id("hel")}>
            <motion.circle cx={helena.cx} cy={helena.cy} r={helena.r} {...sunRise(helena.cy, 0.45)} />
          </clipPath>
          <mask id={id("trail")} maskUnits="userSpaceOnUse">
            <motion.path d={ROUTE} fill="none" stroke="#fff" strokeWidth="14" style={{ pathLength: trail }} />
          </mask>
        </defs>

        <rect width={W} height={HORIZON} fill={`url(#${id("sky")})`} />
        <g className="scene-stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${(i % 9) * 0.45}s` }} />
          ))}
        </g>
        <ellipse cx={W / 2} cy={HORIZON} rx={W * 0.8} ry={170} fill={`url(#${id("glow")})`} />

        <motion.g style={{ x: cloudX, y: cloudY }} className="scene-clouds">
          <g className="cloud cloud-a">
            <rect x="40" y="96" width="120" height="26" rx="13" />
            <rect x="70" y="80" width="64" height="30" rx="15" />
          </g>
          <g className="cloud cloud-b">
            <rect x="250" y="168" width="104" height="20" rx="10" />
            <rect x="276" y="155" width="48" height="24" rx="12" />
          </g>
        </motion.g>

        <motion.g style={{ x: sunX }} clipPath={`url(#${id("above")})`}>
          <motion.circle cx={helena.cx} cy={helena.cy} r={helena.r} fill={`url(#${id("sun")})`} {...sunRise(helena.cy, 0.45)} />
          <motion.circle cx={leo.cx} cy={leo.cy} r={leo.r} fill={`url(#${id("sea")})`} {...sunRise(leo.cy, 0.62)} />
          <motion.circle
            cx={leo.cx}
            cy={leo.cy}
            r={leo.r}
            fill="var(--mark-ink, var(--ink))"
            clipPath={`url(#${id("hel")})`}
            initial={{ cy: leo.cy + 150, opacity: 0 }}
            animate={{ cy: leo.cy, opacity: 1 }}
            transition={{
              cy: { type: "spring", stiffness: 46, damping: 13, delay: 0.62 },
              opacity: { duration: 0.5, delay: 1.3 },
            }}
          />
        </motion.g>

        <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${id("water")})`} />
        <motion.g style={{ x: seaX }} className="scene-reflections">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} style={{ animationDelay: `${i * 0.6}s` }}>
              <rect
                x={helena.cx - 70 + i * 9}
                y={HORIZON + 26 + i * 30}
                width={140 - i * 22}
                height={7}
                rx={3.5}
                fill="var(--sun-b)"
                opacity={0.75 - i * 0.13}
              />
              <rect
                x={leo.cx - 86 + i * 12}
                y={HORIZON + 40 + i * 30}
                width={170 - i * 26}
                height={7}
                rx={3.5}
                fill="var(--sea-a)"
                opacity={0.7 - i * 0.12}
              />
            </g>
          ))}
        </motion.g>
        <motion.rect
          y={HORIZON - 4}
          height={9}
          rx={4.5}
          fill="var(--mark-ink, var(--ink))"
          initial={{ x: W / 2, width: 0 }}
          animate={{ x: -10, width: W + 20 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
        />

        <path ref={routeRef} d={ROUTE} fill="none" stroke="none" />
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--scene-route)"
          strokeWidth="4"
          strokeDasharray="0.5 13"
          strokeLinecap="round"
          mask={`url(#${id("trail")})`}
        />
        <motion.g ref={planeRef} style={{ opacity: planeOpacity }}>
          <path d="M-15 -11 L15 0 L-15 11 L-8 0 Z" fill="var(--scene-route)" />
        </motion.g>
      </svg>

      <Glass className="hero-window-glass" radius={190} bezel={44} strength={78} blur={0} shine aria-hidden="true" />
    </div>
  );
}
