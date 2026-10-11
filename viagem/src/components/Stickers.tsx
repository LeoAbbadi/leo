import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { Glass } from "./Glass";
import { LogoMark } from "./Logo";

/**
 * Adesivos de viagem em volta das fotos. Dá para arrastar cada um; ao soltar,
 * ele volta para o lugar com mola. A lente é vidro líquido: passe por cima das
 * fotos para ver o fundo entortar.
 */

const W = "#fff";
const cut = { stroke: W, strokeWidth: 6, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

function Moon() {
  return (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="var(--sun-b)" {...cut} />
      <mask id="st-moon">
        <rect width="100" height="100" fill="#fff" />
        <circle cx="60" cy="42" r="21" fill="#000" />
      </mask>
      <circle cx="47" cy="52" r="24" fill={W} mask="url(#st-moon)" />
    </svg>
  );
}

function Shamrock() {
  const pts = Array.from({ length: 32 }, (_, i) => {
    const r = i % 2 ? 36 : 46;
    const a = (i / 32) * Math.PI * 2;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100">
      <polygon points={pts} fill="#2E9E62" {...cut} />
      <g fill={W}>
        <circle cx="50" cy="37" r="10" />
        <circle cx="38.5" cy="53" r="10" />
        <circle cx="61.5" cy="53" r="10" />
        <path d="M49 50 Q52 64 58 72" fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BrandBadge() {
  return (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="var(--sea-b)" {...cut} />
      <foreignObject x="18" y="22" width="64" height="52">
        <div className="sticker-mark">
          <LogoMark />
        </div>
      </foreignObject>
    </svg>
  );
}

function NamesSticker() {
  return (
    <svg viewBox="0 0 140 100">
      <rect x="10" y="12" width="120" height="76" rx="30" fill={W} transform="rotate(-8 70 50)" />
      <g transform="rotate(-8 70 50)" textAnchor="middle">
        <text x="70" y="47" className="sticker-names">
          Leo
        </text>
        <text x="70" y="74" className="sticker-names">
          <tspan className="sticker-amp">&amp;</tspan> Helena
        </text>
      </g>
    </svg>
  );
}

function PlaneSticker() {
  return (
    <svg viewBox="0 0 120 80">
      <ellipse cx="60" cy="40" rx="54" ry="34" fill="var(--sea-a)" {...cut} />
      <path
        d="M30 46 L88 32 L84 27 L67 31 L53 17 L47 19 L56 34 L41 37 L35 32 L30 33 L34 41 Z"
        fill={W}
        transform="rotate(-6 60 40)"
      />
    </svg>
  );
}

function StampSticker() {
  return (
    <svg viewBox="0 0 100 100">
      <mask id="st-perf">
        <rect width="100" height="100" fill="#fff" />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <circle cx={10 + i * 10} cy="6" r="3.4" fill="#000" />
            <circle cx={10 + i * 10} cy="94" r="3.4" fill="#000" />
            <circle cx="6" cy={10 + i * 10} r="3.4" fill="#000" />
            <circle cx="94" cy={10 + i * 10} r="3.4" fill="#000" />
          </g>
        ))}
      </mask>
      <rect x="6" y="6" width="88" height="88" fill={W} mask="url(#st-perf)" />
      <rect x="14" y="14" width="72" height="72" fill="var(--sun-b)" />
      <circle cx="50" cy="44" r="14" fill="var(--sun-a)" />
      <rect x="22" y="56" width="56" height="3" rx="1.5" fill={W} />
      <text x="50" y="78" textAnchor="middle" className="sticker-stamp">
        DUB
      </text>
    </svg>
  );
}

function EiffelSticker() {
  return (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="var(--sea-b)" {...cut} />
      <g fill={W}>
        <path d="M50 18 L52 34 L48 34 Z" />
        <path d="M46 34 L54 34 L57 54 L43 54 Z" />
        <rect x="40" y="53" width="20" height="3.5" rx="1" />
        <path d="M42 56.5 L58 56.5 L70 80 L62 80 Q50 66 38 80 L30 80 Z" />
        <rect x="37" y="66" width="26" height="3" rx="1" />
      </g>
    </svg>
  );
}

function GlobeSticker() {
  return (
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="#2E9E62" {...cut} />
      <g fill="none" stroke={W} strokeWidth="3">
        <circle cx="50" cy="50" r="27" />
        <ellipse cx="50" cy="50" rx="12" ry="27" />
        <path d="M23 50 H77 M27 37 H73 M27 63 H73" />
      </g>
    </svg>
  );
}

function PassportSticker() {
  return (
    <svg viewBox="0 0 80 100">
      <rect x="8" y="6" width="64" height="88" rx="10" fill="#1F3FA8" {...cut} />
      <g fill="none" stroke="var(--sun-a)" strokeWidth="2.4">
        <circle cx="40" cy="48" r="15" />
        <ellipse cx="40" cy="48" rx="6.5" ry="15" />
        <path d="M25 48 H55" />
      </g>
      <text x="40" y="24" textAnchor="middle" className="sticker-pass">
        PASSAPORTE
      </text>
      <text x="40" y="80" textAnchor="middle" className="sticker-pass">
        BRASIL
      </text>
    </svg>
  );
}

export const stickerArt = {
  moon: <Moon />,
  shamrock: <Shamrock />,
  brand: <BrandBadge />,
  names: <NamesSticker />,
  plane: <PlaneSticker />,
  stamp: <StampSticker />,
  eiffel: <EiffelSticker />,
  globe: <GlobeSticker />,
  passport: <PassportSticker />,
};

export type StickerName = keyof typeof stickerArt;

/** Posição no computador (x, y) e no celular (m = [x, y]), em % do palco. */
function place(x: string, y: string, m?: [string, string]) {
  return { "--x": x, "--y": y, "--mx": m?.[0] ?? x, "--my": m?.[1] ?? y } as CSSProperties;
}

export function Sticker({
  children,
  x,
  y,
  m,
  size,
  rotate = 0,
  delay = 0,
  label,
}: {
  children: ReactNode;
  x: string;
  y: string;
  m?: [string, string];
  size: number;
  rotate?: number;
  delay?: number;
  label: string;
}) {
  return (
    <motion.div
      className="sticker"
      style={{ ...place(x, y, m), width: size, rotate }}
      drag
      dragSnapToOrigin
      dragElastic={0.5}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
      whileHover={{ scale: 1.08, rotate: rotate + 6 }}
      whileDrag={{ scale: 1.16, rotate: 0, zIndex: 20, cursor: "grabbing" }}
      initial={{ scale: 0.4, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay }}
      role="img"
      aria-label={label}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + (size % 3), repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Lente de vidro líquido para arrastar sobre as fotos. */
export function GlassLens({ x, y, m, size = 128 }: { x: string; y: string; m?: [string, string]; size?: number }) {
  return (
    <motion.div
      className="lens"
      style={{ ...place(x, y, m), width: size, height: size }}
      drag
      dragMomentum={false}
      dragElastic={0.2}
      whileDrag={{ scale: 1.06, cursor: "grabbing" }}
      aria-label="Lente de vidro: arraste por cima das fotos"
      role="img"
    >
      <Glass className="lens-glass" radius={999} bezel={size * 0.42} strength={size * 0.75} blur={0}>
        <span className="lens-hint">arraste</span>
      </Glass>
    </motion.div>
  );
}
