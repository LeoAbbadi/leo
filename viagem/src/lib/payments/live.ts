import { getSupabase } from "../supabase";
import type { Enrollment, Gateway, Order } from "./types";

/** Linha da tabela `orders` (ou da função `order_status`) como vem do banco. */
interface OrderRow {
  id: string;
  public_token?: string;
  course_slug: string;
  name: string;
  email: string;
  cpf: string | null;
  amount_cents: number;
  method: Order["method"];
  status: Order["status"];
  provider_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  pix_copy_paste: string | null;
  pix_qr_base64: string | null;
  checkout_url: string | null;
  verification: Order["verification"] | null;
}

const toOrder = (r: OrderRow, token = ""): Order => ({
  id: r.id,
  token: r.public_token ?? token,
  courseSlug: r.course_slug,
  name: r.name,
  email: r.email,
  cpf: r.cpf ?? "",
  amountCents: r.amount_cents,
  method: r.method,
  status: r.status,
  provider: "mercadopago",
  providerPaymentId: r.provider_payment_id ?? undefined,
  createdAt: r.created_at,
  paidAt: r.paid_at ?? undefined,
  expiresAt: r.expires_at ?? undefined,
  pix: r.pix_copy_paste ? { copyPaste: r.pix_copy_paste, qrBase64: r.pix_qr_base64 ?? undefined } : undefined,
  checkoutUrl: r.checkout_url ?? undefined,
  verification: r.verification ?? undefined,
});

export const liveGateway: Gateway = {
  mode: "live",

  async createCheckout(input) {
    const sb = await getSupabase();
    const { data, error } = await sb.functions.invoke<{ order: OrderRow; token: string }>("create-checkout", {
      body: input,
    });
    if (error || !data) throw new Error(error?.message ?? "Não foi possível criar o pagamento.");
    return toOrder(data.order, data.token);
  },

  async getOrder(id, token) {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc("order_status", { p_id: id, p_token: token });
    if (error) throw new Error(error.message);
    const row = (Array.isArray(data) ? data[0] : data) as OrderRow | undefined;
    return row ? toOrder(row, token) : null;
  },

  async enrollments() {
    const sb = await getSupabase();
    // A política de segurança do banco só devolve as matrículas do e-mail logado.
    const { data, error } = await sb
      .from("enrollments")
      .select("email, course_slug, order_id, granted_at, revoked_at")
      .is("revoked_at", null);
    if (error) throw new Error(error.message);
    return (data ?? []).map(
      (r): Enrollment => ({
        email: r.email,
        courseSlug: r.course_slug,
        orderId: r.order_id,
        grantedAt: r.granted_at,
        revokedAt: r.revoked_at ?? undefined,
      }),
    );
  },

  async listOrders() {
    const sb = await getSupabase();
    const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return (data as OrderRow[]).map((r) => toOrder(r));
  },

  async markPaid(id) {
    const sb = await getSupabase();
    const { error } = await sb.rpc("admin_mark_order_paid", { p_id: id });
    if (error) throw new Error(error.message);
  },

  subscribe() {
    // No modo real as telas consultam o pedido a cada poucos segundos.
    return () => {};
  },
};
