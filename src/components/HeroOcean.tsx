import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Céu e mar do topo desenhados na placa de vídeo (WebGL): ondas em perspectiva,
 * reflexo dos dois sóis na água, nuvens iluminadas por baixo e névoa no horizonte.
 * Sem WebGL (ou com "reduzir movimento"), cai num degradê parado com as mesmas cores.
 */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHz;
uniform vec3 uSunA;
uniform vec3 uSunB;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float x = frag.x;
  float y = frag.y;
  vec3 skyTop = vec3(0.035, 0.09, 0.15);
  vec3 skyMid = vec3(0.13, 0.30, 0.42);
  vec3 skyLow = vec3(0.99, 0.72, 0.50);
  vec3 sunCol = vec3(1.0, 0.56, 0.36);
  vec3 seaCol = vec3(0.38, 0.6, 1.0);
  vec2 mid = (uSunA.xy + uSunB.xy) * 0.5;
  vec3 col;

  if (y < uHz) {
    float t = 1.0 - y / uHz;
    col = mix(skyLow, skyMid, smoothstep(0.0, 0.5, t));
    col = mix(col, skyTop, smoothstep(0.45, 1.0, t));
    vec2 cp = vec2(x / uRes.y * 1.6 + uTime * 0.012, y / uRes.y * 6.0);
    float c = fbm(cp + vec2(0.0, fbm(cp * 0.5)));
    float band = smoothstep(0.5, 0.82, c) * smoothstep(0.08, 0.45, t) * (1.0 - smoothstep(0.8, 1.0, t));
    float lit = exp(-length((frag - mid) / uRes.y) * 2.4);
    vec3 cloud = mix(vec3(0.22, 0.32, 0.42), vec3(1.0, 0.74, 0.52), lit);
    col = mix(col, cloud, band * 0.7);
    col += vec3(1.0, 0.78, 0.55) * 0.6 * exp(-length((frag - mid) / uRes.y) * 5.0);
    col += vec3(1.0, 0.62, 0.42) * 0.22 * exp(-(uHz - y) / uRes.y * 16.0);
  } else {
    float d = (y - uHz) / max(uRes.y - uHz, 1.0);
    float z = 1.0 / (d + 0.035);
    vec2 wp = vec2((x - uRes.x * 0.5) / uRes.y * z * 0.55, z * 0.8 + uTime * 0.28);
    float e = 0.03;
    vec2 drift = vec2(uTime * 0.04, 0.0);
    float h0 = fbm(wp * 1.4 + drift);
    float hx = fbm((wp + vec2(e, 0.0)) * 1.4 + drift);
    float hy = fbm((wp + vec2(0.0, e)) * 1.4 + drift);
    vec2 n = vec2(h0 - hx, h0 - hy) / e;
    float fres = pow(1.0 - d, 4.0);
    vec3 deep = vec3(0.015, 0.11, 0.15);
    vec3 teal = vec3(0.03, 0.36, 0.42);
    vec3 water = mix(teal, deep, smoothstep(0.15, 1.0, d));
    water += vec3(0.02, 0.18, 0.18) * clamp(n.y * 0.25 + 0.2, 0.0, 1.0) * (1.0 - d);
    vec3 refl = mix(skyLow, skyMid, clamp(0.35 - n.y * 0.08, 0.0, 1.0));
    col = mix(water, refl, clamp(fres * 0.9, 0.0, 1.0));

    float glint = smoothstep(0.58, 0.88, fbm(wp * 5.0 + uTime * 0.25));
    float wA = mix(uSunA.z * 0.35, uSunA.z * 1.4, d);
    float oA = x - uSunA.x + n.x * mix(3.0, 70.0, d);
    col += sunCol * exp(-oA * oA / (wA * wA)) * (0.25 + glint * 1.3) * (1.0 - d * 0.55);
    float wB = mix(uSunB.z * 0.35, uSunB.z * 1.4, d);
    float oB = x - uSunB.x + n.x * mix(3.0, 70.0, d);
    col += seaCol * exp(-oB * oB / (wB * wB)) * (0.2 + glint * 1.1) * (1.0 - d * 0.55);

    col += vec3(0.85, 1.0, 1.0) * pow(max(0.0, fbm(wp * 2.6 - drift) - 0.6), 2.0) * 2.5 * (1.0 - fres);
    col = mix(col, skyLow * 0.92, exp(-d * 30.0) * 0.75);
  }

  vec2 q = frag / uRes;
  col *= 0.82 + 0.18 * smoothstep(1.25, 0.25, length(q - vec2(0.45, 0.42)));
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface OceanGeometry {
  /** Altura do horizonte em px a partir do topo do elemento. */
  horizon: number;
  sunA: { x: number; y: number; r: number };
  sunB: { x: number; y: number; r: number };
}

export function HeroOcean({ geometry, offsetY, offsetX }: { geometry: OceanGeometry | null; offsetY: MotionValue<number>; offsetX: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geo = useRef(geometry);
  geo.current = geometry;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      setFailed(true);
      return;
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      hz: gl.getUniformLocation(prog, "uHz"),
      a: gl.getUniformLocation(prog, "uSunA"),
      b: gl.getUniformLocation(prog, "uSunB"),
    };

    // desenha em resolução menor e deixa o navegador ampliar: o mar é macio, não precisa de nitidez
    const quality = Math.min(window.devicePixelRatio || 1, 1.5) * 0.7;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const frame = (now: number) => {
      const g = geo.current;
      const w = Math.max(1, Math.round(canvas.clientWidth * quality));
      const h = Math.max(1, Math.round(canvas.clientHeight * quality));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      if (g) {
        const k = quality;
        const dy = offsetY.get();
        const dx = offsetX.get();
        gl.uniform2f(u.res, w, h);
        gl.uniform1f(u.time, reduce ? 12 : (now - start) / 1000);
        gl.uniform1f(u.hz, g.horizon * k);
        gl.uniform3f(u.a, (g.sunA.x + dx) * k, (g.sunA.y + dy) * k, g.sunA.r * k);
        gl.uniform3f(u.b, (g.sunB.x + dx) * k, (g.sunB.y + dy) * k, g.sunB.r * k);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
      cancelAnimationFrame(raf);
      if (visible || reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    // com "reduzir movimento" o quadro é parado; redesenha ao mudar de tamanho
    const ro = new ResizeObserver(() => reduce && requestAnimationFrame(frame));
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [offsetX, offsetY]);

  const hzPct = geometry ? `${geometry.horizon}px` : "42%";
  return failed ? (
    <div
      className="ocean ocean-fallback"
      style={{
        background: `linear-gradient(180deg, #091726 0%, #21495f calc(${hzPct} * 0.55), #fbb880 ${hzPct}, #0b5a63 ${hzPct}, #052129 100%)`,
      }}
    />
  ) : (
    <canvas ref={canvasRef} className="ocean" aria-hidden="true" />
  );
}
