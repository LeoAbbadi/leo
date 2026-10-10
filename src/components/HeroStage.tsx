import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useId, type PointerEvent } from "react";
import { LogoCoin } from "./Brand";
import { ChipTop, PlayingCard, type ChipColor, type Suit } from "./Cards";

const HAND: { rank: string; suit: Suit }[] = [
  { rank: "10", suit: "♥" },
  { rank: "J", suit: "♥" },
  { rank: "Q", suit: "♥" },
  { rank: "K", suit: "♥" },
  { rank: "A", suit: "♥" },
];

const DEAL = 0.13;
const FLIP_AT = 0.5 + HAND.length * DEAL;

const ORBIT: { color: ChipColor; phase: number }[] = [
  { color: "red", phase: 0 },
  { color: "white", phase: (Math.PI * 2) / 3 },
  { color: "black", phase: (Math.PI * 4) / 3 },
];

const SPARKS = [
  [12, 22],
  [84, 16],
  [92, 58],
  [8, 64],
  [26, 90],
  [70, 88],
  [50, 6],
  [96, 34],
  [3, 40],
  [62, 96],
];

function OrbitChip({ color, phase, reduce }: { color: ChipColor; phase: number; reduce: boolean }) {
  const x = useMotionValue("0%");
  const y = useMotionValue("0%");
  const scale = useMotionValue(1);
  const zIndex = useMotionValue(1);
  const opacity = useMotionValue(1);
  useAnimationFrame((t) => {
    const a = (reduce ? 0 : (t / 1000) * 0.55) + phase;
    const depth = Math.sin(a);
    x.set(`${Math.cos(a) * 520}%`);
    y.set(`${depth * 150}%`);
    scale.set(0.72 + depth * 0.28);
    opacity.set(0.55 + (depth + 1) * 0.225);
    zIndex.set(depth > 0 ? 8 : 1);
  });
  return (
    <motion.div className="orbit-chip" style={{ x, y, scale, zIndex, opacity }}>
      <motion.div
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <ChipTop color={color} size={48} />
      </motion.div>
    </motion.div>
  );
}

function RingText() {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  return (
    <motion.svg
      className="ring-text"
      viewBox="0 0 500 500"
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <defs>
        <path id={id} d="M250,250 m-212,0 a212,212 0 1,1 424,0 a212,212 0 1,1 -424,0" />
      </defs>
      <text>
        <textPath href={`#${id}`} startOffset="0" textLength="1325" lengthAdjust="spacing">
          YPIRANGA POKER ♥ TORNEIOS ♠ RANKING DO SEMESTRE ♦ EARLY BIRD ♣ YPIRANGA POKER ♥ TORNEIOS ♠ RANKING ♦
        </textPath>
      </text>
    </motion.svg>
  );
}

function useTilt(reduce: boolean) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 18 });
  const sy = useSpring(my, { stiffness: 110, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };
  return { rotateX, rotateY, onMove, reset };
}

function FloatingCard({ index, rank, suit, reduce }: { index: number; rank: string; suit: Suit; reduce: boolean }) {
  const mid = (HAND.length - 1) / 2;
  const angle = ((index - mid) * 26 * Math.PI) / 180;
  return (
    <motion.div
      className="stage-card"
      initial={{ x: "260%", y: "-260%", rotate: 60, opacity: 0, scale: 0.6 }}
      animate={{
        x: `${Math.sin(angle) * 175}%`,
        y: `${-Math.cos(angle) * 118 - 18}%`,
        rotate: (angle * 180) / Math.PI,
        opacity: 1,
        scale: 1,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 17, delay: 0.35 + index * DEAL }}
    >
      <motion.div
        animate={reduce ? undefined : { y: ["0%", "-7%", "0%"] }}
        transition={{ duration: 3.6 + index * 0.35, repeat: Infinity, ease: "easeInOut", delay: FLIP_AT + 1 }}
      >
        <motion.div
          className="flip"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.7, ease: [0.3, 0.7, 0.2, 1], delay: FLIP_AT + index * 0.16 }}
        >
          <PlayingCard rank={rank} suit={suit} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Cena principal: a ficha com a logo gira no centro de uma lente de vidro,
 * um royal flush de copas é distribuído em leque atrás dela, três fichas
 * orbitam ao redor e o anel de texto gira devagar. Tudo inclina com o ponteiro.
 */
export function HeroStage() {
  const reduce = !!useReducedMotion();
  const { rotateX, rotateY, onMove, reset } = useTilt(reduce);
  const glowX = useTransform(rotateY, [-14, 14], ["40%", "60%"]);
  const glowY = useTransform(rotateX, [12, -12], ["40%", "60%"]);

  return (
    <div
      className="stage"
      onPointerMove={onMove}
      onPointerLeave={reset}
      role="img"
      aria-label="Ficha do Ypiranga Poker girando com um royal flush de copas ao fundo"
    >
      <StageGlow x={glowX} y={glowY} />
      <motion.div className="stage-3d" style={{ rotateX, rotateY }}>
        <motion.div
          className="stage-orb"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
        <RingText />
        <div className="stage-center">
          {HAND.map((c, i) => (
            <FloatingCard key={c.rank} index={i} rank={c.rank} suit={c.suit} reduce={reduce} />
          ))}
          {ORBIT.map((o) => (
            <OrbitChip key={o.color} color={o.color} phase={o.phase} reduce={reduce} />
          ))}
          <motion.div
            className="stage-coin"
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 13, delay: 0.15 }}
          >
            <LogoCoin size="100%" />
          </motion.div>
        </div>
        {SPARKS.map(([left, top], i) => (
          <span
            key={i}
            className="spark"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${i * 0.37}s` }}
            aria-hidden="true"
          />
        ))}
      </motion.div>
    </div>
  );
}

function StageGlow({ x, y }: { x: MotionValue<string>; y: MotionValue<string> }) {
  return <motion.div className="stage-glow" style={{ left: x, top: y }} aria-hidden="true" />;
}
