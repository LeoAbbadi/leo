// Cria o pedido e o pagamento no Mercado Pago.
// Pix: devolve o QR code e o copia e cola. Cartão: devolve o link do checkout.
// O preço vem sempre da tabela `courses`, nunca do navegador.
import { createClient } from "npm:@supabase/supabase-js@2";
import { cors, env, json } from "../_shared/http.ts";
import { mp, mpDate } from "../_shared/mercadopago.ts";
import { isValidCpf, isValidEmail, onlyDigits } from "../_shared/validate.ts";

const PIX_MINUTES = 30;
const MAX_PENDING_PER_HOUR = 5;

interface Body {
  courseSlug?: string;
  name?: string;
  email?: string;
  cpf?: string;
  method?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Dados inválidos." }, 400);
  }

  const name = (body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 160);
  const cpf = onlyDigits(body.cpf ?? "");
  const method = body.method === "card" ? "card" : body.method === "pix" ? "pix" : null;
  if (name.split(" ").length < 2) return json({ error: "Escreva nome e sobrenome." }, 400);
  if (!isValidEmail(email)) return json({ error: "E-mail inválido." }, 400);
  if (!isValidCpf(cpf)) return json({ error: "CPF inválido." }, 400);
  if (!method) return json({ error: "Escolha Pix ou cartão." }, 400);

  const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

  const { data: course } = await sb
    .from("courses")
    .select("slug, title, price_cents, max_installments")
    .eq("slug", body.courseSlug ?? "")
    .eq("active", true)
    .maybeSingle();
  if (!course) return json({ error: "Curso não encontrado." }, 404);

  // freio simples contra robôs gerando pedidos em série
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await sb
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("status", "pending")
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PENDING_PER_HOUR) {
    return json({ error: "Muitos pagamentos em aberto para este e-mail. Use um dos já gerados ou tente mais tarde." }, 429);
  }

  const expiresAt = method === "pix" ? new Date(Date.now() + PIX_MINUTES * 60_000) : null;
  const { data: order, error } = await sb
    .from("orders")
    .insert({
      course_slug: course.slug,
      name,
      email,
      cpf,
      amount_cents: course.price_cents,
      method,
      expires_at: expiresAt?.toISOString() ?? null,
    })
    .select("*")
    .single();
  if (error || !order) {
    console.error(error);
    return json({ error: "Não foi possível criar o pedido." }, 500);
  }

  const supabaseUrl = env("SUPABASE_URL");
  const site = env("SITE_URL").replace(/\/$/, "");
  const notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;
  const [first, ...rest] = name.split(" ");
  const payer = { email, first_name: first, last_name: rest.join(" "), identification: { type: "CPF", number: cpf } };

  try {
    if (method === "pix") {
      const payment = await mp<{
        id: number;
        point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
      }>("/v1/payments", {
        method: "POST",
        idempotencyKey: order.id,
        body: {
          transaction_amount: course.price_cents / 100,
          description: course.title,
          payment_method_id: "pix",
          external_reference: order.id,
          notification_url: notificationUrl,
          date_of_expiration: mpDate(expiresAt!),
          payer,
        },
      });
      const tx = payment.point_of_interaction?.transaction_data;
      const { data: updated } = await sb
        .from("orders")
        .update({
          provider_payment_id: String(payment.id),
          pix_copy_paste: tx?.qr_code ?? null,
          pix_qr_base64: tx?.qr_code_base64 ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select("*")
        .single();
      return json({ order: publicOrder(updated ?? order), token: order.public_token });
    }

    // Cartão: Checkout Pro do Mercado Pago (parcelas, 3DS e antifraude ficam com eles)
    const back = `${site}/?pedido=${order.id}&t=${order.public_token}`;
    const pref = await mp<{ id: string; init_point: string }>("/checkout/preferences", {
      method: "POST",
      idempotencyKey: order.id,
      body: {
        items: [{ id: course.slug, title: course.title, quantity: 1, unit_price: course.price_cents / 100, currency_id: "BRL" }],
        payer: { name: first, surname: rest.join(" "), email, identification: payer.identification },
        external_reference: order.id,
        notification_url: notificationUrl,
        back_urls: { success: back, pending: back, failure: back },
        auto_return: "approved",
        statement_descriptor: "LEOEHELENA",
        payment_methods: {
          installments: course.max_installments,
          excluded_payment_types: [{ id: "ticket" }],
        },
      },
    });
    const { data: updated } = await sb
      .from("orders")
      .update({ provider_preference_id: pref.id, checkout_url: pref.init_point, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .select("*")
      .single();
    return json({ order: publicOrder(updated ?? order), token: order.public_token });
  } catch (e) {
    await sb.from("orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
    return json({ error: e instanceof Error ? e.message : "Falha ao falar com o Mercado Pago." }, 502);
  }
});

/** Só o que o navegador precisa ver (sem CPF). */
function publicOrder(o: Record<string, unknown>) {
  const { cpf: _cpf, public_token: _t, provider_preference_id: _p, ...rest } = o;
  return { ...rest, cpf: null };
}
