import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState, type PointerEvent } from "react";
import { driveImage, type Photo } from "../content/photos";
import { Glass } from "./Glass";

/**
 * Cartão-postal do diário. Mostra a foto do Google Drive quando existe;
 * enquanto isso, uma ilustração do lugar no mesmo estilo da marca.
 */
export function Postcard({ photo, index }: { photo: Photo; index: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);
  const [broken, setBroken] = useState(false);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const tilt = [-2.2, 1.6, -1.2, 2.4][index % 4];
  const showPhoto = photo.driveId && !broken;

  return (
    <motion.figure
      className="postcard"
      style={{ rotate: tilt, rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ rotate: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <Glass className="postcard-frame" radius={26} bezel={20} strength={30}>
        <div className="postcard-photo">
          {showPhoto ? (
            <img
              src={driveImage(photo.driveId, 900)}
              alt={photo.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setBroken(true)}
            />
          ) : (
            <Scene name={photo.scene} label={photo.alt} />
          )}
          <span className="stamp" aria-hidden="true">
            <span>{photo.place.slice(0, 3).toUpperCase()}</span>
          </span>
        </div>
        <figcaption>
          <span className="eyebrow">{photo.place}</span>
          <span className="postcard-caption">{photo.caption}</span>
        </figcaption>
      </Glass>
    </motion.figure>
  );
}

/** Ilustrações simples dos lugares, só com formas geométricas. */
function Scene({ name, label }: { name: Photo["scene"]; label: string }) {
  return (
    <svg className={`scene scene-${name}`} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`sky-${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--pc-sky-a)" />
          <stop offset="1" stopColor="var(--pc-sky-b)" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#sky-${name})`} />
      {name === "dublin" && <Dublin />}
      {name === "paris" && <Paris />}
      {name === "cliffs" && <Cliffs />}
      {name === "howth" && <Howth />}
      {name === "voo" && <circle cx="150" cy="150" r="60" fill="var(--sun-b)" />}
    </svg>
  );
}

const ink = "var(--pc-ink)";

function Water({ y, sun = 150 }: { y: number; sun?: number }) {
  return (
    <g>
      <rect y={y} width="300" height={300 - y} fill="var(--pc-water)" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          className="pc-ripple"
          x={sun - 50 + i * 8}
          y={y + 12 + i * 16}
          width={100 - i * 18}
          height="4"
          rx="2"
          fill="var(--sun-a)"
          opacity={0.7 - i * 0.14}
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </g>
  );
}

function Dublin() {
  return (
    <g>
      <circle cx="210" cy="150" r="46" fill="var(--sun-b)" />
      {/* casario do cais */}
      <g fill={ink} opacity="0.88">
        <rect x="0" y="138" width="38" height="62" />
        <rect x="36" y="150" width="30" height="50" />
        <rect x="64" y="128" width="26" height="72" />
        <rect x="236" y="142" width="32" height="58" />
        <rect x="266" y="126" width="34" height="74" />
        <path d="M64 128 L77 116 L90 128 Z" />
      </g>
      <g fill="var(--pc-window)">
        {[8, 20, 44, 70, 80, 244, 256, 274, 286].map((x, i) => (
          <rect key={i} x={x} y={i % 2 ? 160 : 150} width="5" height="8" rx="1" />
        ))}
      </g>
      <Water y={200} sun={210} />
      {/* Ha'penny Bridge */}
      <path d="M40 204 Q150 120 260 204" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" />
      <path d="M40 204 Q150 138 260 204" fill="none" stroke={ink} strokeWidth="2.5" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 58 + i * 15.3;
        const t = (x - 40) / 220;
        const yTop = 204 - 2 * t * (1 - t) * 84 - 2;
        const yIn = 204 - 2 * t * (1 - t) * 66;
        return <line key={i} x1={x} x2={x} y1={yTop} y2={yIn} stroke={ink} strokeWidth="1.6" />;
      })}
      <rect x="140" y="152" width="20" height="4" rx="2" fill={ink} />
    </g>
  );
}

function Paris() {
  return (
    <g>
      <circle cx="96" cy="170" r="40" fill="var(--sun-b)" />
      <g fill={ink}>
        <rect x="0" y="236" width="300" height="64" opacity="0.9" />
        {/* Torre Eiffel estilizada */}
        <path d="M150 40 L153 78 L147 78 Z" />
        <rect x="143" y="76" width="14" height="5" rx="1" />
        <path d="M144 81 L156 81 L163 150 L137 150 Z" />
        <rect x="128" y="148" width="44" height="6" rx="1.5" />
        <path d="M133 154 L167 154 L196 238 L176 238 Q150 196 124 238 L104 238 Z" />
        <rect x="118" y="196" width="64" height="6" rx="1.5" />
      </g>
      <g fill="var(--pc-window)">
        {[24, 48, 72, 220, 244, 268].map((x) => (
          <rect key={x} x={x} y="250" width="6" height="9" rx="1" />
        ))}
      </g>
      <circle className="pc-twinkle" cx="150" cy="38" r="3" fill="var(--sun-a)" />
    </g>
  );
}

function Cliffs() {
  return (
    <g>
      <circle cx="232" cy="120" r="34" fill="var(--sun-b)" />
      <Water y={210} sun={232} />
      <path d="M0 96 L70 104 L96 300 L0 300 Z" fill={ink} />
      <path d="M70 104 L134 120 L150 300 L96 300 Z" fill={ink} opacity="0.75" />
      <path d="M134 120 L180 140 L188 300 L150 300 Z" fill={ink} opacity="0.55" />
      <path d="M0 96 L70 104 L134 120 L180 140 L180 146 L134 127 L70 111 L0 103 Z" fill="var(--pc-grass)" />
      <path d="M210 70 q6 -6 12 0 q6 -6 12 0" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M244 52 q4 -4 8 0 q4 -4 8 0" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Howth() {
  return (
    <g>
      <circle cx="90" cy="150" r="42" fill="var(--sun-b)" />
      <Water y={200} sun={90} />
      <path d="M150 204 L300 204 L300 220 L170 220 Z" fill={ink} />
      <g>
        <path d="M222 96 L238 96 L244 204 L216 204 Z" fill="var(--pc-light)" />
        <path d="M219.5 140 L240.5 140 L242 166 L218 166 Z" fill={ink} />
        <rect x="218" y="86" width="24" height="12" rx="2" fill={ink} />
        <path d="M216 86 L230 72 L244 86 Z" fill={ink} />
        <circle className="pc-twinkle" cx="230" cy="92" r="4" fill="var(--sun-a)" />
      </g>
    </g>
  );
}
