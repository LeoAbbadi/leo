import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Glass } from "../components/Glass";
import { LogoMark } from "../components/Logo";
import { Button, ButtonLink, Qr, StatusPill, copyText, useToast } from "../components/ui";
import { courseBySlug } from "../content/courses";
import { brl, fmtDateTime } from "../lib/format";
import { gateway, type Order as OrderT } from "../lib/payments";
import { useSession } from "../lib/session";

function useCountdown(iso?: string) {
  const [left, setLeft] = useState(() => (iso ? Date.parse(iso) - Date.now() : 0));
  useEffect(() => {
    if (!iso) return;
    const t = window.setInterval(() => setLeft(Date.parse(iso) - Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [iso]);
  const s = Math.max(0, Math.floor(left / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Order() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [order, setOrder] = useState<OrderT | null | undefined>(undefined);
  const [simulating, setSimulating] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { signIn } = useSession();
  const copyRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setOrder(await gateway.getOrder(id, token));
    } catch {
      setOrder(null);
    }
  }, [id, token]);

  useEffect(() => {
    load();
    const unsub = gateway.subscribe(load);
    return unsub;
  }, [load]);

  // enquanto espera, consulta o pedido a cada 3 segundos
  useEffect(() => {
    if (order?.status !== "pending") return;
    const t = window.setInterval(load, 3000);
    return () => window.clearInterval(t);
  }, [order?.status, load]);

  const prevStatus = useRef(order?.status);
  useEffect(() => {
    if (prevStatus.current === "pending" && order?.status === "paid") toast("Pagamento confirmado. Curso liberado!");
    prevStatus.current = order?.status;
  }, [order?.status, toast]);

  const countdown = useCountdown(order?.expiresAt);

  if (order === undefined) {
    return (
      <section className="section page-top narrow">
        <p className="muted">Carregando pedido…</p>
      </section>
    );
  }
  if (order === null) {
    return (
      <section className="section page-top narrow">
        <h1 className="page-title">Pedido não encontrado</h1>
        <p>
          O link do pedido está incompleto ou expirou. Se você já pagou, entre na <Link to="/aluno">Área do aluno</Link>{" "}
          com o e-mail da compra.
        </p>
      </section>
    );
  }

  const course = courseBySlug(order.courseSlug);
  const simulate = async (outcome: "paid" | "failed" | "expired") => {
    if (!gateway.simulate) return;
    setSimulating(true);
    await gateway.simulate(order.id, outcome);
    setSimulating(false);
  };
  const goStudy = async () => {
    const r = await signIn(order.email);
    if (r === "link") toast(`Mandamos um link de acesso para ${order.email}.`, "info");
    else navigate(`/aluno/${order.courseSlug}`);
  };

  return (
    <section className="section page-top order">
      <div className="order-head">
        <span className="eyebrow mono">Pedido {order.id.slice(0, 8).toUpperCase()}</span>
        <StatusPill status={order.status} />
      </div>

      <AnimatePresence mode="wait">
        {order.status === "pending" && order.method === "pix" && (
          <motion.div key="pix" className="order-grid" initial={{ y: 16 }} animate={{ y: 0 }} exit={{ y: -10, opacity: 0 }}>
            <Glass className="pix" radius={34} bezel={26} strength={34}>
              <h1 className="h2">Pague com Pix</h1>
              <p className="muted">Abra o app do seu banco, escolha pagar com Pix e aponte a câmera para o código.</p>
              <div className="pix-qr">
                {order.pix?.qrBase64 ? (
                  <img src={`data:image/png;base64,${order.pix.qrBase64}`} alt="QR code do Pix" width="220" height="220" />
                ) : (
                  <Qr value={order.pix?.copyPaste ?? ""} label="QR code do Pix" />
                )}
                <span className="pix-scan" aria-hidden="true" />
              </div>
              <div className="pix-timer">
                <span>Vence em</span>
                <strong className="mono">{countdown}</strong>
              </div>
              <label className="field" htmlFor="pix-code">
                <span className="field-label">Pix copia e cola</span>
                <span className="copy-row">
                  <input id="pix-code" ref={copyRef} readOnly value={order.pix?.copyPaste ?? ""} onFocus={(e) => e.target.select()} />
                  <Button
                    type="button"
                    variant="glass"
                    onClick={async () => {
                      const ok = await copyText(order.pix?.copyPaste ?? "", copyRef.current);
                      toast(ok ? "Código copiado." : "Código selecionado. Copie com Ctrl+C ou segure para copiar.", ok ? "ok" : "info");
                    }}
                  >
                    Copiar
                  </Button>
                </span>
              </label>
            </Glass>
            <OrderSide order={order} />
          </motion.div>
        )}

        {order.status === "pending" && order.method === "card" && (
          <motion.div key="card" className="order-grid" initial={{ y: 16 }} animate={{ y: 0 }} exit={{ y: -10, opacity: 0 }}>
            <Glass className="pix" radius={34} bezel={26} strength={34}>
              <h1 className="h2">Pagamento com cartão</h1>
              {order.checkoutUrl ? (
                <>
                  <p className="muted">Termine o pagamento na página segura do Mercado Pago. Esta página atualiza sozinha quando ele for aprovado.</p>
                  <a className="btn btn-primary btn-lg" href={order.checkoutUrl}>
                    Ir para o Mercado Pago
                  </a>
                </>
              ) : (
                <p className="muted">
                  No site de verdade, você iria agora para o checkout do Mercado Pago digitar o cartão e escolher as
                  parcelas. Na demonstração, use os botões abaixo para simular a resposta do banco.
                </p>
              )}
              <Waiting />
            </Glass>
            <OrderSide order={order} />
          </motion.div>
        )}

        {order.status === "paid" && (
          <motion.div
            key="paid"
            className="order-done"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
          >
            <Glass className="done-card" radius={40} bezel={32} strength={44}>
              <LogoMark className="done-logo" intro />
              <h1 className="h2">Pagamento confirmado</h1>
              <p>
                {course?.title} está liberado para <strong>{order.email}</strong>.
              </p>
              <Verification order={order} />
              <Button size="lg" onClick={goStudy}>
                Começar a assistir
              </Button>
            </Glass>
          </motion.div>
        )}

        {(order.status === "failed" || order.status === "expired" || order.status === "refunded") && (
          <motion.div key="bad" className="order-done" initial={{ y: 16 }} animate={{ y: 0 }}>
            <Glass className="done-card" radius={40} bezel={32} strength={44}>
              <h1 className="h2">
                {order.status === "failed" ? "Pagamento recusado" : order.status === "expired" ? "O Pix venceu" : "Pedido reembolsado"}
              </h1>
              <p className="muted">
                {order.status === "failed"
                  ? "O banco não aprovou o pagamento. Confira os dados do cartão ou tente com Pix."
                  : order.status === "expired"
                    ? "O código passou dos 30 minutos sem pagamento. Gere um novo, leva só alguns segundos."
                    : "O valor foi devolvido e o acesso ao curso foi removido."}
              </p>
              {order.status !== "refunded" && <ButtonLink to={`/checkout/${order.courseSlug}`}>Tentar de novo</ButtonLink>}
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>

      {gateway.simulate && order.status === "pending" && (
        <div className="demo-controls" role="group" aria-label="Simular resposta do banco">
          <span className="eyebrow">Demonstração · simular resposta do banco</span>
          <div>
            <Button variant="glass" disabled={simulating} onClick={() => simulate("paid")}>
              {simulating ? "Confirmando…" : order.method === "pix" ? "Simular Pix pago" : "Simular cartão aprovado"}
            </Button>
            <Button variant="ghost" disabled={simulating} onClick={() => simulate(order.method === "pix" ? "expired" : "failed")}>
              {order.method === "pix" ? "Simular vencimento" : "Simular recusa"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Waiting() {
  return (
    <div className="waiting" role="status">
      <span className="waiting-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      Aguardando a confirmação do pagamento
    </div>
  );
}

function OrderSide({ order }: { order: OrderT }) {
  const course = courseBySlug(order.courseSlug);
  return (
    <aside className="order-side">
      <Waiting />
      <dl className="kv">
        <div>
          <dt>Curso</dt>
          <dd>{course?.title}</dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd>{brl(order.amountCents)}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{order.email}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{fmtDateTime(order.createdAt)}</dd>
        </div>
      </dl>
      <p className="muted small">
        Pode fechar esta página: quando o pagamento cair, o acesso é liberado no seu e-mail do mesmo jeito.
      </p>
    </aside>
  );
}

export function Verification({ order }: { order: OrderT }) {
  const v = order.verification;
  if (!v) return null;
  const rows: [string, boolean][] = [
    ["Aviso do Mercado Pago com assinatura válida", v.signatureValid],
    ["Pagamento consultado direto no Mercado Pago", v.confirmedWithProvider],
    ["Valor pago igual ao preço do curso", v.amountMatches],
  ];
  return (
    <ul className="verify">
      {rows.map(([label, ok]) => (
        <li key={label} className={ok ? "ok" : "na"}>
          <span aria-hidden="true">{ok ? "✓" : "–"}</span>
          {label}
          {!ok && v.source === "manual" && <em> (confirmado à mão)</em>}
        </li>
      ))}
    </ul>
  );
}
