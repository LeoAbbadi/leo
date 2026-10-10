import type { CSSProperties } from "react";

export type Suit = "♠" | "♥" | "♦" | "♣";

const isRed = (s: Suit) => s === "♥" || s === "♦";

interface PlayingCardProps {
  rank: string;
  suit: Suit;
  className?: string;
  style?: CSSProperties;
}

/** Carta com frente e verso; gire com rotateY para revelar. */
export function PlayingCard({ rank, suit, className = "", style }: PlayingCardProps) {
  return (
    <div className={`pcard ${className}`} style={style}>
      <div className={`pcard-face pcard-front ${isRed(suit) ? "is-red" : ""}`}>
        <span className="pcard-index">
          {rank}
          <br />
          {suit}
        </span>
        <span className="pcard-pip">{suit}</span>
        <span className="pcard-index pcard-index-bottom">
          {rank}
          <br />
          {suit}
        </span>
      </div>
      <div className="pcard-face pcard-back" aria-hidden="true">
        <span className="pcard-back-y">Y</span>
      </div>
    </div>
  );
}

export type ChipColor = "red" | "white" | "black" | "metal";

/** Ficha vista de cima, com as listras da borda. */
export function ChipTop({ color = "red", size = 56, className = "" }: { color?: ChipColor; size?: number; className?: string }) {
  return (
    <svg
      className={`chip-top chip-${color} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" className="chip-body" />
      <circle cx="50" cy="50" r="41" className="chip-stripes" strokeWidth="12" strokeDasharray="13 13.2" fill="none" />
      <circle cx="50" cy="50" r="30" className="chip-inlay" />
      <circle cx="50" cy="50" r="26" className="chip-ring" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}
