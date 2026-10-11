import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import QRCode from "qrcode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import type { OrderStatus } from "../lib/payments";

/** Botão com aperto "líquido": achata e volta com mola. */
type ButtonProps = HTMLMotionProps<"button"> & { variant?: "primary" | "ghost" | "glass" | "danger"; size?: "md" | "lg" };

const squish = { scaleX: 1.04, scaleY: 0.94 };
const spring = { type: "spring" as const, stiffness: 500, damping: 18 };

export function Button({ variant = "primary", size = "md", className = "", ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={squish}
      whileHover={{ y: -1 }}
      transition={spring}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...rest}
    />
  );
}

const MotionLink = motion.create(Link);

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  to: string;
  variant?: "primary" | "ghost" | "glass";
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <MotionLink to={to} whileTap={squish} whileHover={{ y: -1 }} transition={spring} className={`btn btn-${variant} btn-${size} ${className}`}>
      {children}
    </MotionLink>
  );
}

/** Seção que sobe ao aparecer, mas já começa visível (nada fica escondido). */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 28 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, id, className = "", ...rest }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <label className={`field ${error ? "field-error" : ""} ${className}`} htmlFor={fid}>
      <span className="field-label">{label}</span>
      <input id={fid} aria-invalid={error ? true : undefined} aria-describedby={`${fid}-hint`} {...rest} />
      <span className="field-hint" id={`${fid}-hint`}>
        {error ?? hint ?? " "}
      </span>
    </label>
  );
}

const statusText: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Recusado",
  expired: "Vencido",
  refunded: "Reembolsado",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`pill pill-${status}`}>
      <span className="pill-dot" aria-hidden="true" />
      {statusText[status]}
    </span>
  );
}

/** QR code desenhado em SVG com as cores do site. */
export function Qr({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState<string>("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0B1626", light: "#00000000" } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(""));
    return () => {
      alive = false;
    };
  }, [value]);
  return <div className="qr" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/* ---------- avisos rápidos ---------- */

interface Toast {
  id: number;
  text: string;
  tone: "ok" | "info" | "bad";
}

const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.tone}`}
              initial={{ y: 24, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/** Copia texto; se o navegador recusar, seleciona o campo para copiar na mão. */
export async function copyText(text: string, fallbackEl?: HTMLInputElement | HTMLTextAreaElement | null) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    fallbackEl?.focus();
    fallbackEl?.select();
    return false;
  }
}
