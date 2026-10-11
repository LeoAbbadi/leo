import { LayoutGroup, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Glass } from "../components/Glass";
import { Button, Field, useToast } from "../components/ui";
import { courseBySlug } from "../content/courses";
import { brl, installmentsLabel, isValidCpf, isValidEmail, maskCpf } from "../lib/format";
import { gateway, type PaymentMethod } from "../lib/payments";

interface Errors {
  name?: string;
  email?: string;
  cpf?: string;
}

export function Checkout() {
  const { slug } = useParams();
  const course = courseBySlug(slug);
  const navigate = useNavigate();
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  if (!course) {
    return (
      <section className="section page-top narrow">
        <h1 className="page-title">Curso não encontrado</h1>
        <Link to="/aprender">Voltar</Link>
      </section>
    );
  }

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().split(/\s+/).length < 2) e.name = "Escreva nome e sobrenome.";
    if (!isValidEmail(email)) e.email = "Confira o e-mail. É nele que você recebe o acesso.";
    if (!isValidCpf(cpf)) e.cpf = "CPF inválido. Confira os 11 números.";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!accepted) {
      toast("Marque que leu os termos de compra para continuar.", "info");
      return;
    }
    setBusy(true);
    try {
      const order = await gateway.createCheckout({ courseSlug: course.slug, name, email, cpf, method });
      try {
        sessionStorage.setItem("leo-helena:last-order", JSON.stringify({ id: order.id, token: order.token }));
      } catch {
        /* sem armazenamento */
      }
      if (order.method === "card" && order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
        return;
      }
      navigate(`/pedido/${order.id}?t=${order.token}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento. Tente de novo.", "bad");
      setBusy(false);
    }
  };

  return (
    <section className="section page-top checkout">
      <form className="checkout-form" onSubmit={submit} noValidate>
        <Link to={`/cursos/${course.slug}`} className="back">
          ← Voltar para o curso
        </Link>
        <h1 className="page-title">Finalizar compra</h1>

        <fieldset className="fieldset">
          <legend>Seus dados</legend>
          <Field
            id="checkout-name"
            label="Nome completo"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Field
            id="checkout-email"
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="O acesso ao curso chega neste e-mail."
            error={errors.email}
          />
          <Field
            id="checkout-cpf"
            label="CPF"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            hint="Pedido pelo Mercado Pago para emitir o pagamento."
            error={errors.cpf}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend>Forma de pagamento</legend>
          <LayoutGroup id="method">
            <div className="segmented" role="radiogroup" aria-label="Forma de pagamento">
              {(
                [
                  ["pix", "Pix", "Aprovado na hora"],
                  ["card", "Cartão de crédito", installmentsLabel(course.priceCents, course.installments).replace(/^ou /, "Até ")],
                ] as const
              ).map(([value, label, sub]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={method === value}
                  className={`segment ${method === value ? "is-on" : ""}`}
                  onClick={() => setMethod(value)}
                >
                  {method === value && (
                    <motion.span layoutId="method-drop" className="segment-drop" transition={{ type: "spring", stiffness: 420, damping: 30 }} />
                  )}
                  <span className="segment-label">{label}</span>
                  <span className="segment-sub">{sub}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <p className="muted small">
            {method === "pix"
              ? "Você recebe um QR code e um código copia e cola, válidos por 30 minutos."
              : "Você vai para o checkout seguro do Mercado Pago para digitar o cartão. O site não vê nem guarda os dados do cartão."}
          </p>
        </fieldset>

        <label className="check">
          <input id="checkout-terms" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            Li e aceito os termos: acesso individual, garantia de 7 dias e reembolso integral dentro desse prazo.
          </span>
        </label>

        <Button type="submit" size="lg" className="btn-block" disabled={busy}>
          {busy ? "Gerando pagamento…" : method === "pix" ? `Gerar Pix de ${brl(course.priceCents)}` : "Ir para o pagamento"}
        </Button>
      </form>

      <aside className="checkout-aside">
        <Glass className="summary" radius={30} bezel={24} strength={32}>
          <span className="eyebrow">Resumo</span>
          <div className="summary-route mono">
            <span>{course.route[0]}</span>
            <span aria-hidden="true">✈</span>
            <span>{course.route[1]}</span>
          </div>
          <strong className="summary-title">{course.title}</strong>
          <span className="muted">{course.format}</span>
          <div className="summary-total">
            <span>Total</span>
            <strong>{brl(course.priceCents)}</strong>
          </div>
          <ul className="summary-trust">
            <li>Pagamento processado pelo Mercado Pago</li>
            <li>Confirmação automática e acesso imediato</li>
            <li>Garantia de 7 dias</li>
          </ul>
        </Glass>
      </aside>
    </section>
  );
}
