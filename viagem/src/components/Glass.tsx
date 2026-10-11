import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type Ref } from "react";

/**
 * Vidro líquido no estilo da Apple.
 *
 * No Chrome e no Edge o fundo é refratado de verdade: um mapa de deslocamento
 * (gerado num canvas do tamanho exato do elemento) entorta o que está atrás
 * nas bordas, como a lateral grossa de uma lente. Nos outros navegadores o
 * mesmo componente vira vidro fosco com reflexo, sem quebrar nada.
 */

function detectRefraction() {
  if (typeof navigator === "undefined" || typeof document === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-transparency: reduce)").matches) return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  if (brands) return brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
  return /Chrome\/\d+/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent);
}

export const refractionSupported = detectRefraction();

const mapCache = new Map<string, string>();

/**
 * Mapa de deslocamento de um retângulo arredondado.
 * Vermelho = deslocamento horizontal, verde = vertical; 128 é neutro.
 * Só a faixa da borda (bezel) entorta; o miolo fica limpo.
 */
function displacementMap(w: number, h: number, radius: number, bezel: number): string {
  const key = `${w}x${h}:${radius}:${bezel}`;
  const hit = mapCache.get(key);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(radius, hw, hh);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      // distância com sinal até a borda (negativa = dentro)
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const sd = outside + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -sd;
      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bezel) {
        let nx: number;
        let ny: number;
        if (qx > 0 && qy > 0) {
          const len = Math.hypot(qx, qy) || 1;
          nx = qx / len;
          ny = qy / len;
        } else if (qx > qy) {
          nx = 1;
          ny = 0;
        } else {
          nx = 0;
          ny = 1;
        }
        // perfil convexo: entorta muito na beira e some em direção ao centro
        const t = 1 - depth / bezel;
        const mag = t * t * (3 - 2 * t) * t;
        dx = -Math.sign(px) * nx * mag;
        dy = -Math.sign(py) * ny * mag;
      }
      const i = (y * w + x) * 4;
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  if (mapCache.size > 40) mapCache.clear();
  mapCache.set(key, url);
  return url;
}

type Tag = "div" | "section" | "article" | "aside" | "header" | "nav" | "span" | "li";

export interface GlassProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  as?: Tag;
  /** Raio dos cantos em px. */
  radius?: number;
  /** Largura da borda que refrata, em px. */
  bezel?: number;
  /** Quanto o fundo entorta, em px. */
  strength?: number;
  /** Desfoque do fundo, em px (só no Chrome; nos outros é fixo). */
  blur?: number;
  /** Reflexo que acompanha o ponteiro. */
  shine?: boolean;
  /** Tom do vidro. */
  tone?: "clear" | "tinted" | "sun" | "sea";
}

export const Glass = forwardRef(function Glass(
  {
    as = "div",
    radius = 28,
    bezel,
    strength = 42,
    blur = 1.6,
    shine = true,
    tone = "clear",
    className = "",
    style,
    children,
    onPointerMove,
    ...rest
  }: GlassProps,
  forwarded: Ref<HTMLElement>,
) {
  const localRef = useRef<HTMLElement | null>(null);
  const id = `lg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!refractionSupported || !el) return;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const r = size ? Math.min(radius, size.w / 2, size.h / 2) : radius;
  const bz = Math.max(6, Math.min(bezel ?? r * 0.85, size ? Math.min(size.w, size.h) / 2 : 999));
  const map = size && size.w > 2 && size.h > 2 && size.w * size.h < 2_400_000 ? displacementMap(size.w, size.h, r, bz) : null;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!shine) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    el.style.setProperty("--lg-angle", `${Math.atan2(y - 50, x - 50) * (180 / Math.PI) + 90}deg`);
  };

  const M = motion[as] as typeof motion.div;
  const vars = {
    "--lg-r": `${radius}px`,
    ...(map ? { "--lg-filter": `url(#${id})` } : null),
  } as CSSProperties;

  return (
    <M
      ref={setRef as Ref<HTMLDivElement>}
      className={`lg lg-${tone} ${className}`}
      data-refract={map ? "" : undefined}
      style={{ ...vars, ...(style as object) }}
      onPointerMove={handleMove}
      {...rest}
    >
      {map && size && (
        <svg className="lg-defs" aria-hidden="true" focusable="false" width="0" height="0">
          <filter
            id={id}
            x="0"
            y="0"
            width={size.w}
            height={size.h}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="soft" />
            <feImage href={map} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="soft" in2="map" scale={strength} xChannelSelector="R" yChannelSelector="G" result="bent" />
            <feColorMatrix in="bent" type="saturate" values="1.45" />
          </filter>
        </svg>
      )}
      {shine && <span className="lg-shine" aria-hidden="true" />}
      {children as ReactNode}
    </M>
  );
});
