// Recebe os avisos (webhooks) do Mercado Pago e libera o curso.
//
// Três conferências antes de liberar:
//  1. a assinatura x-signature bate com a chave secreta (o aviso veio mesmo do Mercado Pago);
//  2. o pagamento é consultado direto na API (não confiamos no conteúdo do aviso);
//  3. o valor pago é igual ao preço do pedido.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendAccessEmail } from "../_shared/email.ts";
import { env, json } from "../_shared/http.ts";
import { mp, verifySignature } from "../_shared/mercadopago.ts";

type Status = "pending" | "paid" | "failed" | "expired" | "refunded";

interface Payment {
  id: number;
  status: string;
  status_detail?: string;
  transaction_amount: number;
  currency_id: string;
  external_reference?: string;
  payment_method_id?: string;
}

function mapStatus(p: Payment): Status {
  switch (p.status) {
    case "approved":
      return "paid";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "rejected":
      return "failed";
    case "cancelled":
      return p.payment_method_id === "pix" ? "expired" : "failed";
    default:
      return "pending"; // pending, in_process, authorized, in_mediation
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const url = new URL(req.url);
  const payload = await req.json().catch(() => ({}));
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? payload.type ?? payload.topic ?? null;
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? payload?.data?.id?.toString() ?? null;
  const requestId = req.headers.get("x-request-id");

  const { valid } = await verifySignature({
    signature: req.headers.get("x-signature"),
    requestId,
    dataId,
    secret: env("MP_WEBHOOK_SECRET"),
  });

  const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const log = (outcome: string) =>
    sb.from("payment_events").insert({
      provider: "mercadopago",
      topic,
      resource_id: dataId,
      request_id: requestId,
      signature_valid: valid,
      outcome,
      payload,
    });

  if (!valid) {
    await log("assinatura inválida: ignorado");
    return json({ error: "Assinatura inválida." }, 401);
  }
  if (topic !== "payment" || !dataId) {
    await log("tipo de aviso ignorado");
    return json({ ok: true, ignored: true });
  }

  let payment: Payment;
  try {
    payment = await mp<Payment>(`/v1/payments/${encodeURIComponent(dataId)}`);
  } catch {
    await log("falha ao consultar o pagamento");
    // 500 faz o Mercado Pago tentar de novo mais tarde
    return json({ error: "Falha ao consultar o pagamento." }, 500);
  }

  const orderId = payment.external_reference;
  const { data: order } = orderId
    ? await sb.from("orders").select("id, email, name, amount_cents, currency, status, course_slug").eq("id", orderId).maybeSingle()
    : { data: null };
  if (!order) {
    await log(`pedido não encontrado (${orderId ?? "sem referência"})`);
    return json({ ok: true, ignored: true });
  }

  const amountMatches =
    Math.round(payment.transaction_amount * 100) === order.amount_cents && payment.currency_id === order.currency;
  let status = mapStatus(payment);
  if (status === "paid" && !amountMatches) status = "pending"; // valor diferente: não libera, o dono confere

  const verification = {
    signatureValid: true,
    confirmedWithProvider: true,
    amountMatches,
    source: "webhook",
    checkedAt: new Date().toISOString(),
    providerStatus: payment.status,
    providerStatusDetail: payment.status_detail ?? null,
  };

  const { error } = await sb.rpc("apply_payment", {
    p_order: order.id,
    p_status: status,
    p_payment_id: String(payment.id),
    p_verification: verification,
  });
  if (error) {
    console.error(error);
    await log(`erro ao gravar: ${error.message}`);
    return json({ error: "Falha ao gravar o pagamento." }, 500);
  }

  await log(amountMatches ? `pedido ${order.id}: ${status}` : `pedido ${order.id}: valor divergente, acesso não liberado`);

  if (status === "paid" && order.status !== "paid") {
    const { data: course } = await sb.from("courses").select("title").eq("slug", order.course_slug).single();
    await sendAccessEmail(order.email, order.name, course?.title ?? "Seu curso").catch((e) => console.error(e));
  }

  return json({ ok: true });
});
