import { motion, useReducedMotion } from "motion/react";
import logoUrl from "../assets/ypiranga-logo.webp";

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      width={size}
      height={size}
      alt=""
      className={`logo ${className}`}
      draggable={false}
    />
  );
}

const EDGE_LAYERS = 8;

/**
 * Ficha 3D com a logo: frente com a marca, verso vermelho com o “Y”.
 * Gira de tempos em tempos como uma moeda jogada na mesa.
 */
export function LogoCoin({ size = 220, period = 7 }: { size?: number | string; period?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="coin"
      style={{ width: size, height: size }}
      animate={reduce ? undefined : { rotateY: [0, 0, 180, 180, 360] }}
      transition={{ duration: period * 2, times: [0, 0.42, 0.5, 0.92, 1], repeat: Infinity, ease: "easeInOut" }}
    >
      {Array.from({ length: EDGE_LAYERS }, (_, i) => (
        <span
          key={i}
          className="coin-edge"
          style={{ transform: `translateZ(${i - EDGE_LAYERS / 2 + 0.5}px)` }}
          aria-hidden="true"
        />
      ))}
      <div className="coin-face coin-front">
        <img src={logoUrl} alt="Ypiranga Poker" draggable={false} />
        <span className="coin-gloss" aria-hidden="true" />
      </div>
      <div className="coin-face coin-back" aria-hidden="true">
        <span className="coin-y">Y</span>
        <span className="coin-suits">♠ ♥ ♣ ♦</span>
        <span className="coin-gloss" />
      </div>
    </motion.div>
  );
}
