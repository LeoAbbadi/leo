import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { ChipStack, ChipTop, PlayingCard, type Suit } from "./Cards";

const HAND: { rank: string; suit: Suit }[] = [
  { rank: "10", suit: "♠" },
  { rank: "J", suit: "♠" },
  { rank: "Q", suit: "♠" },
  { rank: "K", suit: "♠" },
  { rank: "A", suit: "♠" },
];

const DEAL = 0.14;
const FLIP_START = HAND.length * DEAL + 0.45;

/**
 * Cena principal: as cartas são distribuídas viradas para baixo,
 * viram uma a uma revelando um royal flush, e as fichas caem na mesa.
 * Acompanha o ponteiro com uma leve inclinação.
 */
export function HeroTable() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <div
      className="hero-table"
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      aria-label="Mesa de poker com um royal flush de espadas"
      role="img"
    >
      <div className="felt" aria-hidden="true">
        <span className="felt-line" />
      </div>

      <motion.div className="hand" style={{ rotateX, rotateY }}>
        {HAND.map((c, i) => {
          const mid = (HAND.length - 1) / 2;
          const offset = i - mid;
          return (
            <motion.div
              key={c.rank}
              className="hand-slot"
              initial={{ x: "160%", y: "-120%", rotate: 35, opacity: 0 }}
              animate={{ x: `${offset * 58}%`, y: `${Math.abs(offset) * 6}%`, rotate: offset * 7, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.2 + i * DEAL }}
              whileHover={{ y: `${Math.abs(offset) * 6 - 12}%`, transition: { duration: 0.2 } }}
            >
              <motion.div
                className="flip"
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.6, ease: [0.3, 0.7, 0.2, 1], delay: FLIP_START + i * 0.18 }}
              >
                <PlayingCard rank={c.rank} suit={c.suit} />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="stacks">
        <ChipStack count={7} color="red" delay={FLIP_START + 0.9} />
        <ChipStack count={10} color="brass" delay={FLIP_START + 1.05} />
        <ChipStack count={5} color="ivory" delay={FLIP_START + 1.2} />
      </div>

      <motion.div
        className="spinning-chip"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: FLIP_START + 1.5 }}
      >
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <ChipTop color="brass" size={84} />
        </motion.div>
      </motion.div>
    </div>
  );
}
