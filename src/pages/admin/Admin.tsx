import { LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Glass } from "../../components/Glass";
import { LogoMark } from "../../components/Logo";
import { Button, Field, StatusPill, useToast } from "../../components/ui";
import { courseBySlug } from "../../content/courses";
import { isLive } from "../../lib/env";
import { brl, fmtDateTime } from "../../lib/format";
import { gateway, type Order, type OrderStatus } from "../../lib/payments";
import { resetDemo } from "../../lib/payments/demo";
import { DEMO_ADMIN, useSession } from "../../lib/session";
import { NowEditor } from "./NowEditor";

function AdminSignIn() {
  const { adminSignIn, signIn } = useSession();
  const toast = useToast();
  const [email, setEmail] = useState(isLive ? "" : DEMO_ADMIN.email);
  const [password, setPassword] = useState(isLive ? "" : DEMO_ADMIN.password);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isLive) {
        await signIn(email);
        toast(`Link de acesso enviado para ${email}.`, "info");
      } else if (!(await adminSignIn(email, password))) {
        toast("E-mail ou senha não conferem.", "bad");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível entrar.", "bad");
    }
  };

  return (
    <section className="section page-top narrow">
      <Glass className="signin" radius={36} bezel={28} strength={36}>
        <LogoMark className="signin-logo" intro />
        <h1 className="h2">Área dos donos</h1>
        <form onSubmit={submit} noValidate>
          <Field id="admin-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {!isLive && (
            <Field
              id="admin-password"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={`Demonstração: ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`}
            />
          )}
          <Button type="submit" size="lg" className="btn-block">
            Entrar
          </Button>
        </form>
      </Glass>
    </section>
  );
}

type Filter = "all" | "pending" | "paid" | "problem";
const filters: [Filter, string][] = [
  ["all", "Todos"],
  ["pending", "Aguardando"],
  ["paid", "Pagos"],
  ["problem", "Problemas"],
];
const problem: OrderStatus[] = ["failed", "expired", "refunded"];

export function Admin() {
  const { isAdmin, ready, signOut, email } = useSession();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"agora" | "pedidos">("agora");
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setOrders(await gateway.listOrders());
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pedidos.");
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const unsub = gateway.subscribe(load);
    const t = isLive ? window.setInterval(load, 15000) : undefined;
    return () => {
      unsub();
      window.clearInterval(t);
    };
  }, [isAdmin, load]);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const paid = list.filter((o) => o.status === "paid");
    const revenue = paid.reduce((s, o) => s + o.amountCents, 0);
    return {
      revenue,
      paid: paid.length,
      pending: list.filter((o) => o.status === "pending").length,
      average: paid.length ? Math.round(revenue / paid.length) : 0,
    };
  }, [orders]);

  if (!ready) return null;
  if (!isAdmin) return <AdminSignIn />;

  const shown = (orders ?? []).filter((o) =>
    filter === "all" ? true : filter === "problem" ? problem.includes(o.status) : o.status === filter,
  );

  return (
    <section className="section page-top admin">
      <div className="section-head row">
        <div>
          <span className="eyebrow">Área dos donos</span>
          <h1 className="page-title">{view === "agora" ? "Aonde estamos agora?" : "Pedidos do curso"}</h1>
          <p className="muted">Conectado como {email}</p>
        </div>
        <div className="row-actions">
          {!isLive && (
            <Button variant="ghost" onClick={() => (resetDemo(), toast("Pedidos de teste apagados.", "info"))}>
              Apagar pedidos de teste
            </Button>
          )}
          <Button variant="ghost" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      <LayoutGroup id="admin-view">
        <div className="segmented small-seg" role="tablist" aria-label="Seções">
          {(
            [
              ["agora", "Onde estamos"],
              ["pedidos", "Pedidos do curso"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`segment ${view === v ? "is-on" : ""}`}
              onClick={() => setView(v)}
            >
              {view === v && (
                <motion.span
                  layoutId="admin-view-drop"
                  className="segment-drop"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              <span className="segment-label">{label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      {view === "agora" ? (
        <NowEditor />
      ) : (
        <>
          <div className="stats">
            {[
              ["Receita confirmada", brl(stats.revenue)],
              ["Vendas pagas", String(stats.paid)],
              ["Aguardando pagamento", String(stats.pending)],
              ["Ticket médio", brl(stats.average)],
            ].map(([k, v]) => (
              <Glass key={k} className="stat" radius={24} bezel={16} strength={22}>
                <span className="eyebrow">{k}</span>
                <strong>{v}</strong>
              </Glass>
            ))}
          </div>

          <LayoutGroup id="filters">
            <div className="segmented small-seg" role="tablist" aria-label="Filtrar pedidos">
              {filters.map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  className={`segment ${filter === f ? "is-on" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {filter === f && (
                    <motion.span
                      layoutId="filter-drop"
                      className="segment-drop"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <span className="segment-label">{label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {error && <p className="error-text">{error}</p>}

          <Glass className="table-wrap" radius={28} bezel={20} strength={24}>
            {orders === null ? (
              <p className="muted pad">Carregando pedidos…</p>
            ) : shown.length === 0 ? (
              <div className="pad">
                <strong>Nenhum pedido aqui.</strong>
                <p className="muted">
                  {isLive
                    ? "Os pedidos aparecem assim que alguém gera um Pix ou vai para o checkout."
                    : "Faça uma compra de teste em Cursos → Comprar agora para ver o pedido chegar aqui."}
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Curso</th>
                      <th>Forma</th>
                      <th className="num">Valor</th>
                      <th>Situação</th>
                      <th>Verificação</th>
                      <th aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((o) => {
                      const v = o.verification;
                      return (
                        <tr key={o.id}>
                          <td>
                            <span className="mono">{o.id.slice(0, 8).toUpperCase()}</span>
                            <span className="sub">{fmtDateTime(o.createdAt)}</span>
                          </td>
                          <td>
                            {o.name}
                            <span className="sub">{o.email}</span>
                          </td>
                          <td>{courseBySlug(o.courseSlug)?.title ?? o.courseSlug}</td>
                          <td>{o.method === "pix" ? "Pix" : "Cartão"}</td>
                          <td className="num mono">{brl(o.amountCents)}</td>
                          <td>
                            <StatusPill status={o.status} />
                          </td>
                          <td>
                            {v ? (
                              <span className="verify-mini" title="Assinatura · consulta no Mercado Pago · valor">
                                <i className={v.signatureValid ? "ok" : "na"}>A</i>
                                <i className={v.confirmedWithProvider ? "ok" : "na"}>C</i>
                                <i className={v.amountMatches ? "ok" : "na"}>V</i>
                                {v.source === "manual" && <span className="sub">à mão</span>}
                              </span>
                            ) : (
                              <span className="sub">—</span>
                            )}
                          </td>
                          <td className="actions">
                            {o.status === "pending" && (
                              <Button
                                variant="glass"
                                onClick={async () => {
                                  await gateway.markPaid(o.id);
                                  toast("Pedido confirmado e curso liberado.");
                                  load();
                                }}
                              >
                                Confirmar à mão
                              </Button>
                            )}
                            {o.status === "paid" && gateway.simulate && (
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  gateway.simulate!(o.id, "refunded").then(() => toast("Reembolso simulado. Acesso removido.", "info"))
                                }
                              >
                                Simular reembolso
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Glass>
          <p className="muted small legend">
            Verificação: <b>A</b> assinatura do aviso conferida · <b>C</b> pagamento consultado no Mercado Pago · <b>V</b> valor igual ao
            preço. Reembolsos de verdade são feitos no painel do Mercado Pago; o site recebe o aviso e remove o acesso sozinho.
          </p>
        </>
      )}
    </section>
  );
}
