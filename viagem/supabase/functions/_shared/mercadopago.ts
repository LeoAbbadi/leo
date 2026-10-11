import { env } from "./http.ts";

const API = "https://api.mercadopago.com";

/** Chamada autenticada à API do Mercado Pago. */
export async function mp<T = Record<string, unknown>>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.idempotencyKey ? { "X-Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Mercado Pago respondeu", res.status, JSON.stringify(data));
    throw new Error(`Mercado Pago recusou a operação (${res.status}).`);
  }
  return data as T;
}

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Confere o cabeçalho x-signature dos avisos (webhooks) do Mercado Pago.
 *
 * Cabeçalho: "ts=1704908010,v1=<hex>". A mensagem assinada é
 * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" (partes ausentes saem),
 * com HMAC-SHA256 usando a chave secreta do painel de Webhooks.
 */
export async function verifySignature(opts: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}): Promise<{ valid: boolean; ts?: string }> {
  const { signature, requestId, dataId, secret } = opts;
  if (!signature || !secret) return { valid: false };
  const parts = Object.fromEntries(
    signature.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k.trim(), v.join("=").trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return { valid: false };

  let manifest = "";
  if (dataId) manifest += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = toHex(await crypto.subtle.sign("HMAC", key, enc.encode(manifest)));
  return { valid: safeEqual(expected, v1.toLowerCase()), ts };
}

/** Data no formato que o Mercado Pago aceita: 2026-10-11T18:30:00.000+00:00 */
export const mpDate = (d: Date) => d.toISOString().replace("Z", "+00:00");
