import { animate, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { driveImage } from "../content/photos";
import { HeroOcean, type OceanGeometry } from "./HeroOcean";
import { MARK, usePathFollower } from "./Logo";

/**
 * Cena do topo: costa oeste da Irlanda ao pôr do sol. O céu e o mar vêm do
 * WebGL (HeroOcean); por cima, em SVG, os dois sóis da marca se pondo juntos,
 * a rocha no mar (como Dún Briste), os penhascos, pássaros, a rota tracejada
 * com o avião e o pino de destino. Tudo se mexe em camadas com a rolagem e o ponteiro.
 * Com uma foto do Drive (site.hero.photoDriveId), a foto entra no lugar da paisagem.
 */

const VW = 1600;
const VH = 1000;
const HZ = 380;
const S = 3;
const CX = 1010;
const sx = (x: number) => CX + (x - 61.5) * S;
const sy = (y: number) => HZ + (y - 81) * S;
const helena = { cx: sx(MARK.helena.cx), cy: sy(MARK.helena.cy), r: MARK.helena.r * S };
const leo = { cx: sx(MARK.leo.cx), cy: sy(MARK.leo.cy), r: MARK.leo.r * S };
const FLIGHT = "M380 150 C 540 104, 676 150, 716 240 S 738 360, 734 388";
const PIN = { x: 734, y: 396 };

interface Box {
  x: number;
  w: number;
}

export function HeroScene({ photoDriveId = "" }: { photoDriveId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const flight = useMotionValue(0);
  usePathFollower(routeRef, planeRef, flight);
  const trail = useTransform(flight, (p) => Math.max(0, p - 0.03));
  const planeOpacity = useTransform(flight, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const pinScale = useTransform(flight, [0.9, 1], [0.6, 1]);

  // em tela em pé (celular), enquadra os sóis e a rocha em vez do centro largo
  const [portrait, setPortrait] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-aspect-ratio: 1/1)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-aspect-ratio: 1/1)");
    const on = () => setPortrait(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const vb: Box = portrait ? { x: 560, w: 640 } : { x: 0, w: VW };

  // posição na tela do horizonte e dos sóis, para o WebGL casar com o SVG
  const [geo, setGeo] = useState<OceanGeometry | null>(null);
  const scaleRef = useRef(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const s = Math.max(w / vb.w, h / VH);
      scaleRef.current = s;
      const offX = (w - vb.w * s) / 2 - vb.x * s;
      const offY = (h - VH * s) / 2;
      const map = (c: { cx: number; cy: number; r: number }) => ({ x: offX + c.cx * s, y: offY + c.cy * s, r: c.r * s });
      setGeo({ horizon: offY + HZ * s, sunA: map(helena), sunB: map(leo) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vb.x, vb.w]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunsY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const stackY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const cliffY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const px = useSpring(0, { stiffness: 50, damping: 18 });
  const sunsX = useTransform(px, (v) => v * -14);
  const stackX = useTransform(px, (v) => v * 10);
  const cliffX = useTransform(px, (v) => v * 22);
  const frontX = useTransform(px, (v) => v * 40);
  // os mesmos deslocamentos dos sóis, em px de tela, para o reflexo no mar acompanhar
  const sunsYScreen = useTransform(sunsY, (v) => v * scaleRef.current);
  const sunsXScreen = useTransform(sunsX, (v) => v * scaleRef.current);

  useEffect(() => {
    let stop = false;
    let timer: number | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const fly = (delay: number) => {
      flight.set(0);
      controls = animate(flight, 1, { duration: 4.2, delay, ease: [0.45, 0, 0.25, 1] });
      controls.then(() => {
        if (!stop) timer = window.setTimeout(() => fly(0), 6000);
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
  };

  const set = (cy: number, delay: number) => ({
    initial: { cy: cy + 160 },
    animate: { cy },
    transition: { type: "spring" as const, stiffness: 30, damping: 12, delay },
  });

  const route = (
    <>
      <path ref={routeRef} d={FLIGHT} fill="none" stroke="none" />
      <path d={FLIGHT} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="3.5" strokeDasharray="10 12" strokeLinecap="round" mask="url(#hs-trail)" />
      <motion.g ref={planeRef} style={{ opacity: planeOpacity }}>
        <path d="M-16 -11 L16 0 L-16 11 L-9 0 Z" fill="#fff" />
      </motion.g>
      <motion.g style={{ scale: pinScale, x: PIN.x, y: PIN.y }}>
        <circle className="hs-pin-pulse" r="22" />
        <path d="M0 0 C -14 -16 -16 -24 -16 -32 A 16 16 0 1 1 16 -32 C 16 -24 14 -16 0 0 Z" fill="#FFB46A" stroke="#fff" strokeWidth="2.5" />
        <circle cy="-32" r="6" fill="#0B1626" />
      </motion.g>
      <path d="M772 508 C 850 580, 960 650, 1120 708" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeDasharray="10 12" strokeLinecap="round" />
    </>
  );

  const trailMask = (
    <mask id="hs-trail" maskUnits="userSpaceOnUse">
      <motion.path d={FLIGHT} fill="none" stroke="#fff" strokeWidth="18" style={{ pathLength: trail }} />
    </mask>
  );

  if (photoDriveId) {
    return (
      <div className="hero-scene" ref={ref}>
        <motion.img
          className="hero-photo"
          src={driveImage(photoDriveId, 2200)}
          alt=""
          referrerPolicy="no-referrer"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <svg className="hero-overlay-svg" viewBox={`${vb.x} 0 ${vb.w} ${VH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>{trailMask}</defs>
          {route}
        </svg>
      </div>
    );
  }

  return (
    <div className="hero-scene" ref={ref} onPointerMove={onMove} onPointerLeave={() => px.set(0)}>
      <HeroOcean geometry={geo} offsetY={sunsYScreen} offsetX={sunsXScreen} />
      <svg className="hero-overlay-svg" viewBox={`${vb.x} 0 ${vb.w} ${VH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="hs-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFC27A" />
            <stop offset="1" stopColor="#FF6A4D" />
          </linearGradient>
          <linearGradient id="hs-leo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5C95FF" />
            <stop offset="1" stopColor="#2453D9" />
          </linearGradient>
          <linearGradient id="hs-rock" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5A4A3A" />
            <stop offset="0.18" stopColor="#2A3236" />
            <stop offset="1" stopColor="#0C1A1F" />
          </linearGradient>
          <linearGradient id="hs-rock-far" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6E6A66" />
            <stop offset="0.25" stopColor="#3A4C55" />
            <stop offset="1" stopColor="#22343C" />
          </linearGradient>
          <linearGradient id="hs-grass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B8C46A" />
            <stop offset="0.3" stopColor="#4E9A5E" />
            <stop offset="1" stopColor="#1F5A40" />
          </linearGradient>
          <linearGradient id="hs-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13262B" />
            <stop offset="1" stopColor="#050D10" />
          </linearGradient>
          <clipPath id="hs-above">
            <rect x="0" y="0" width={VW} height={HZ} />
          </clipPath>
          <clipPath id="hs-hel">
            <motion.circle cx={helena.cx} cy={helena.cy} r={helena.r} {...set(helena.cy, 0.3)} />
          </clipPath>
          {trailMask}
        </defs>

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
            initial={{ cy: leo.cy + 160, opacity: 0 }}
            animate={{ cy: leo.cy, opacity: 1 }}
            transition={{ cy: { type: "spring", stiffness: 30, damping: 12, delay: 0.45 }, opacity: { duration: 0.6, delay: 1.4 } }}
          />
        </motion.g>

        {/* terra distante à esquerda e ilhota */}
        <path d="M0 384 L0 366 L90 360 L200 364 L300 372 L340 384 Z" fill="#3E5966" opacity="0.75" />
        <motion.g style={{ x: stackX, y: stackY }}>
          <path d="M250 398 L258 384 L272 377 L296 376 L308 384 L316 398 Z" fill="url(#hs-rock-far)" opacity="0.85" />
          <rect className="hs-foam" x="244" y="397" width="78" height="3" rx="1.5" fill="#fff" opacity="0.5" />
        </motion.g>

        {/* rocha no mar, como Dún Briste */}
        <motion.g style={{ x: stackX, y: stackY }}>
          <path d="M700 504 L706 420 L714 406 L752 402 L762 412 L770 504 Z" fill="url(#hs-rock)" />
          <path d="M714 406 L752 402 L762 412 L761 418 L752 409 L716 412 L707 424 L706 420 Z" fill="url(#hs-grass)" />
          <g stroke="#0B171B" strokeWidth="2" opacity="0.45">
            <path d="M724 416 L721 504 M742 413 L745 504 M757 420 L762 504" />
          </g>
          <path d="M706 420 L700 504" stroke="#FFB27A" strokeWidth="2.5" opacity="0.7" />
          <ellipse className="hs-foam" cx="735" cy="506" rx="50" ry="5" fill="#fff" opacity="0.5" />
        </motion.g>

        {/* penhascos à direita */}
        <motion.g style={{ x: cliffX, y: cliffY }}>
          <path d="M1040 446 L1070 330 L1190 292 L1330 270 L1470 250 L1600 238 L1600 470 Z" fill="url(#hs-rock-far)" opacity="0.9" />
          <path d="M1070 330 L1190 292 L1330 270 L1470 250 L1600 238 L1600 248 L1470 260 L1330 280 L1190 302 L1074 342 Z" fill="url(#hs-grass)" opacity="0.8" />
          <path d="M1090 720 L1104 380 L1170 316 L1310 282 L1460 246 L1600 222 L1600 780 Z" fill="url(#hs-rock)" />
          <path d="M1104 380 L1170 316 L1310 282 L1460 246 L1600 222 L1600 232 L1460 256 L1310 292 L1176 326 L1108 390 Z" fill="url(#hs-grass)" opacity="0.85" />
          <path d="M1104 380 L1090 720" stroke="#FFB27A" strokeWidth="4" opacity="0.55" />
          <g stroke="#0A161A" strokeWidth="3" opacity="0.3">
            <path d="M1170 330 L1160 740 M1260 300 L1262 750 M1380 276 L1392 760 M1500 250 L1516 770" />
          </g>
          <rect className="hs-foam" x="1060" y="716" width="140" height="6" rx="3" fill="#fff" opacity="0.7" />
        </motion.g>

        {/* rochas da frente */}
        <motion.g style={{ x: frontX, y: frontY }}>
          <path d="M1150 1040 L1190 840 L1290 780 L1430 758 L1600 740 L1600 1040 Z" fill="url(#hs-front)" />
          <path d="M1190 840 L1290 780 L1430 758 L1600 740 L1600 756 L1430 774 L1294 796 L1196 856 Z" fill="url(#hs-grass)" opacity="0.85" />
          <path d="M-20 1040 L-20 900 L110 878 L230 912 L290 1040 Z" fill="url(#hs-front)" />
        </motion.g>

        {/* pássaros */}
        <g className="hs-birds" fill="none" stroke="#0B1626" strokeWidth="3.5" strokeLinecap="round">
          <path className="hs-bird" d="M860 250 q11 -11 22 0 q11 -11 22 0" />
          <path className="hs-bird hs-bird-2" d="M915 222 q8 -8 16 0 q8 -8 16 0" />
          <path className="hs-bird hs-bird-3" d="M830 212 q6 -6 12 0 q6 -6 12 0" />
        </g>

        {route}
      </svg>
    </div>
  );
}
