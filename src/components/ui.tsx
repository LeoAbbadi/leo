import { AnimatePresence, animate, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/** Número que sobe até o valor final. Começa já mostrando o valor certo. */
export function CountUp({ value, format = String }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, format]);
  return <span ref={ref}>{format(value)}</span>;
}

/** Faixa que corre na horizontal, como o letreiro do salão. */
export function Ticker({ items }: { items: ReactNode[] }) {
  if (!items.length) return null;
  const row = (hidden: boolean) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span className="ticker-item" key={i}>
          {item}
          <span className="ticker-sep" aria-hidden="true">
            ♠
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose(): void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={`modal ${wide ? "modal-wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <header className="modal-head">
              <h2 id={titleId}>{title}</h2>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
                ×
              </button>
            </header>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldShell {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, id, ...rest }: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <input id={fid} aria-invalid={error ? true : undefined} {...rest} />
      {error ? <small className="field-error">{error}</small> : hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  id,
  children,
  ...rest
}: FieldShell & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <select id={fid} {...rest}>
        {children}
      </select>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function TextArea({ label, hint, id, ...rest }: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <textarea id={fid} {...rest} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** Botão de ação destrutiva com confirmação na própria página. */
export function ConfirmButton({
  children,
  confirmLabel = "Confirmar",
  onConfirm,
}: {
  children: ReactNode;
  confirmLabel?: string;
  onConfirm(): void;
}) {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(t);
  }, [asking]);
  return asking ? (
    <span className="confirm-inline">
      <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAsking(false)}>
        Cancelar
      </button>
    </span>
  ) : (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAsking(true)}>
      {children}
    </button>
  );
}

export function Pill({ tone, children }: { tone: "ok" | "warn" | "danger" | "muted" | "brand"; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

interface Toast {
  id: number;
  text: string;
}

const ToastContext = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="toast"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
