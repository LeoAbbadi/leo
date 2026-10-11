// deno test supabase/functions/_shared/mercadopago.test.ts
import { verifySignature } from "./mercadopago.ts";

const secret = "chave-secreta-de-teste";

async function sign(manifest: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(manifest));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

Deno.test("aceita aviso assinado corretamente", async () => {
  const v1 = await sign("id:123456;request-id:abc-123;ts:1704908010;");
  const r = await verifySignature({ signature: `ts=1704908010,v1=${v1}`, requestId: "abc-123", dataId: "123456", secret });
  assert(r.valid, "deveria ser válido");
});

Deno.test("id alfanumérico entra em minúsculas", async () => {
  const v1 = await sign("id:abc9;request-id:r1;ts:1;");
  const r = await verifySignature({ signature: `ts=1,v1=${v1}`, requestId: "r1", dataId: "ABC9", secret });
  assert(r.valid, "deveria normalizar o id");
});

Deno.test("recusa aviso com id trocado", async () => {
  const v1 = await sign("id:123456;request-id:abc-123;ts:1704908010;");
  const r = await verifySignature({ signature: `ts=1704908010,v1=${v1}`, requestId: "abc-123", dataId: "999999", secret });
  assert(!r.valid, "deveria recusar");
});

Deno.test("recusa sem cabeçalho ou com chave errada", async () => {
  const none = await verifySignature({ signature: null, requestId: "x", dataId: "1", secret });
  assert(!none.valid, "sem cabeçalho deveria recusar");
  const v1 = await sign("id:1;request-id:x;ts:5;");
  const wrong = await verifySignature({ signature: `ts=5,v1=${v1}`, requestId: "x", dataId: "1", secret: "outra" });
  assert(!wrong.valid, "chave errada deveria recusar");
});
