const SITE_URL = Deno.env.get("SITE_URL") ?? "*";

export const cors = {
  "Access-Control-Allow-Origin": SITE_URL === "*" ? "*" : new URL(SITE_URL).origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

export function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Variável de ambiente ${name} não configurada.`);
  return v;
}
