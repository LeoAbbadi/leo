import { animate, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { driveImage } from "../content/photos";
import { MARK, usePathFollower } from "./Logo";

/**
 * Cena do topo: pôr do sol nos penhascos da Irlanda, com os dois sóis da marca
 * se pondo juntos no mar, pássaros, nuvens e um avião cruzando o céu.
 * Cada camada se move numa velocidade com a rolagem e com o ponteiro.
 * Quando houver uma foto no Drive (site.hero.photoDriveId), ela entra no lugar.
 */

const VW = 1600;
const VH = 900;
const HZ = 610;
const S = 5.4;
const CX = 1090;
const sx = (x: number) => CX + (x - 61.5) * S;
const sy = (y: number) => HZ + (y - 81) * S;
const helena = { cx: sx(MARK.helena.cx), cy: sy(MARK.helena.cy), r: MARK.helena.r * S };
const leo = { cx: sx(MARK.leo.cx), cy: sy(MARK.leo.cy), r: MARK.leo.r * S };
const FLIGHT = "M-60 330 C 300 250 620 150 980 170 S 1500 120 1700 60";

export function HeroScene({ photoDriveId = "" }: { photoDriveId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const flight = useMotionValue(0);
  usePathFollower(routeRef, planeRef, flight);
  const trail = useTransform(flight, (p) => Math.max(0, p - 0.025));
  const planeOpacity = useTransform(flight, [0, 0.02, 0.95, 1], [0, 1, 1, 0]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunsY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const cloudsY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const px = useSpring(0, { stiffness: 50, damping: 18 });
  const py = useSpring(0, { stiffness: 50, damping: 18 });
  const sunsX = useTransform(px, (v) => v * -18);
  const nearX = useTransform(px, (v) => v * 28);
  const farX = useTransform(px, (v) => v * 10);
  const cloudsX = useTransform(px, (v) => v * -36);
  const nearTilt = useTransform(py, (v) => v * 10);

  useEffect(() => {
    let stop = false;
    let timer: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const fly = (delay: number) => {
      flight.set(0);
      controls = animate(flight, 1, { duration: 7, delay, ease: [0.4, 0, 0.3, 1] });
      controls.then(() => {
        if (!stop) timer = window.setTimeout(() => fly(0), 4000);
      });
    };
    fly(1.4);
    return () => {
      stop = true;
      controls?.stop();
      window.clearTimeout(timer);
    };
  }, [flight]);

  // em tela em pé (celular), enquadra os dois sóis em vez do centro da cena
  const [portrait, setPortrait] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-aspect-ratio: 1/1)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-aspect-ratio: 1/1)");
    const on = () => setPortrait(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  if (photoDriveId) {
    return (
      <div className="hero-scene" ref={ref}>
        <motion.img
          className="hero-photo"
          src={driveImage(photoDriveId, 2000)}
          alt=""
          referrerPolicy="no-referrer"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
      </div>
    );
  }

  const set = (cy: number, delay: number) => ({
    initial: { cy: cy + 260 },
    animate: { cy },
    transition: { type: "spring" as const, stiffness: 30, damping: 12, delay },
  });

  return (
    <div className="hero-scene" ref={ref} onPointerMove={onMove} onPointerLeave={() => (px.set(0), py.set(0))}>
      <svg viewBox={portrait ? `600 0 900 ${VH}` : `0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1B3477" />
            <stop offset="0.45" stopColor="#5C7DCC" />
            <stop offset="0.8" stopColor="#F2B08F" />
            <stop offset="1" stopColor="#FFD2A6" />
          </linearGradient>
          <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A4FB0" />
            <stop offset="1" stopColor="#081638" />
          </linearGradient>
          <linearGradient id="hs-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFC27A" />
            <stop offset="1" stopColor="#FF6A4D" />
          </linearGradient>
          <linearGradient id="hs-leo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4F8BFF" />
            <stop offset="1" stopColor="#2453D9" />
          </linearGradient>
          <radialGradient id="hs-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFD9A8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFD9A8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hs-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5FBF7E" />
            <stop offset="1" stopColor="#2F7A55" />
          </linearGradient>
          <clipPath id="hs-above">
            <rect width={VW} height={HZ} />
          </clipPath>
          <clipPath id="hs-hel">
            <motion.circle cx={helena.cx} cy={helena.cy} r={helena.r} {...set(helena.cy, 0.3)} />
          </clipPath>
          <mask id="hs-trail" maskUnits="userSpaceOnUse">
            <motion.path d={FLIGHT} fill="none" stroke="#fff" strokeWidth="16" style={{ pathLength: trail }} />
          </mask>
        </defs>

        <rect width={VW} height={VH} fill="url(#hs-sky)" />
        <ellipse cx={CX + 40} cy={HZ} rx="720" ry="360" fill="url(#hs-glow)" />

        {/* nuvens */}
        <motion.g className="hs-clouds" style={{ x: cloudsX, y: cloudsY }}>
          <g className="hs-cloud hs-cloud-a">
            <rect x="140" y="170" width="360" height="34" rx="17" />
            <rect x="230" y="146" width="170" height="40" rx="20" />
          </g>
          <g className="hs-cloud hs-cloud-b">
            <rect x="1180" y="250" width="300" height="26" rx="13" />
            <rect x="1250" y="232" width="120" height="30" rx="15" />
          </g>
          <g className="hs-cloud hs-cloud-c">
            <rect x="640" y="380" width="420" height="22" rx="11" />
          </g>
        </motion.g>

        {/* avião */}
        <path ref={routeRef} d={FLIGHT} fill="none" stroke="none" />
        <path d={FLIGHT} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="5" strokeDasharray="0.5 16" strokeLinecap="round" mask="url(#hs-trail)" />
        <motion.g ref={planeRef} style={{ opacity: planeOpacity }}>
          <path d="M-20 -14 L20 0 L-20 14 L-11 0 Z" fill="#fff" />
        </motion.g>

        {/* os dois sóis se pondo juntos */}
        <motion.g style={{ x: sunsX, y: sunsY }} clipPath="url(#hs-above)">
          <motion.circle cx={helena.cx} cy={helena.cy} r={helena.r} fill="url(#hs-sun)" {...set(helena.cy, 0.3)} />
          <motion.circle cx={leo.cx} cy={leo.cy} r={leo.r} fill="url(#hs-leo)" {...set(leo.cy, 0.45)} />
          <motion.circle
            cx={leo.cx}
            cy={leo.cy}
            r={leo.r}
            fill="#FFF1E2"
            clipPath="url(#hs-hel)"
            initial={{ cy: leo.cy + 260, opacity: 0 }}
            animate={{ cy: leo.cy, opacity: 1 }}
            transition={{ cy: { type: "spring", stiffness: 30, damping: 12, delay: 0.45 }, opacity: { duration: 0.6, delay: 1.4 } }}
          />
        </motion.g>

        {/* mar */}
        <rect y={HZ} width={VW} height={VH - HZ} fill="url(#hs-sea)" />
        <rect y={HZ - 1} width={VW} height="3" fill="#FFE4C4" opacity="0.7" />
        <motion.g style={{ x: sunsX }} className="hs-reflect">
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} style={{ animationDelay: `${i * 0.45}s` }}>
              <rect x={helena.cx - 130 + i * 14} y={HZ + 18 + i * 32} width={260 - i * 34} height="8" rx="4" fill="#FF8A5C" opacity={0.8 - i * 0.1} />
              <rect x={leo.cx - 150 + i * 16} y={HZ + 34 + i * 32} width={300 - i * 38} height="8" rx="4" fill="#5B8FFF" opacity={0.75 - i * 0.1} />
            </g>
          ))}
        </motion.g>

        {/* promontório distante à direita */}
        <motion.g style={{ x: farX, y: farY }}>
          <path d="M1370 612 L1400 586 L1470 578 L1540 582 L1600 576 L1600 612 Z" fill="#2B3F78" />
          <path d="M1400 586 L1470 578 L1540 582 L1600 576 L1600 581 L1540 587 L1470 583 L1402 590 Z" fill="#4C9C72" opacity="0.8" />
        </motion.g>

        {/* penhascos: camadas do fundo para a frente */}
        <motion.g style={{ x: farX, y: farY }}>
          <path d="M610 612 L640 560 L760 548 L880 556 L920 612 Z" fill="#33467F" />
          <path d="M640 560 L760 548 L880 556 L884 562 L760 554 L642 566 Z" fill="#5AAE80" opacity="0.85" />
        </motion.g>
        <motion.g style={{ x: nearX, y: nearY, rotate: nearTilt }}>
          <path d="M300 640 L330 500 L520 478 L660 492 L700 640 Z" fill="#1E2C5C" />
          <path d="M330 500 L520 478 L660 492 L664 500 L520 486 L332 509 Z" fill="url(#hs-grass)" />
          <g stroke="#2B3D75" strokeWidth="3" opacity="0.8">
            <path d="M420 500 L410 640 M500 490 L492 640 M580 488 L590 640" />
          </g>
          <path d="M-20 920 L-20 380 L140 360 L300 380 L380 400 L470 920 Z" fill="#0F1834" />
          <path d="M-20 380 L140 360 L300 380 L380 400 L382 410 L300 391 L140 371 L-20 392 Z" fill="url(#hs-grass)" />
          <g stroke="#1B2752" strokeWidth="4" opacity="0.9">
            <path d="M120 372 L104 900 M220 372 L214 900 M320 386 L340 900" />
          </g>
          {/* espuma batendo na base */}
          <g className="hs-foam" fill="#fff">
            <rect x="420" y="700" width="90" height="5" rx="2.5" opacity="0.7" />
            <rect x="660" y="634" width="70" height="4" rx="2" opacity="0.6" />
            <rect x="880" y="616" width="50" height="3" rx="1.5" opacity="0.5" />
          </g>
        </motion.g>

        {/* pássaros */}
        <g className="hs-birds" fill="none" stroke="#0F1834" strokeWidth="4" strokeLinecap="round">
          <path className="hs-bird" d="M560 300 q12 -12 24 0 q12 -12 24 0" />
          <path className="hs-bird hs-bird-2" d="M630 270 q9 -9 18 0 q9 -9 18 0" />
          <path className="hs-bird hs-bird-3" d="M520 250 q7 -7 14 0 q7 -7 14 0" />
        </g>
      </svg>
    </div>
  );
}
