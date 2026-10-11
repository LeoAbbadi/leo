/**
 * E-mail de "curso liberado" pelo Resend (opcional).
 * Sem RESEND_API_KEY a função simplesmente não envia.
 */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendAccessEmail(to: string, name: string, courseTitle: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  const site = Deno.env.get("SITE_URL");
  if (!key || !from || !site) return;
  const first = esc(name.split(" ")[0]);
  const title = esc(courseTitle);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `${courseTitle} liberado!`,
      html: `<p>Oi, ${first}!</p>
<p>Seu pagamento foi confirmado e o curso <strong>${title}</strong> já está liberado.</p>
<p><a href="${esc(site)}/#/aluno">Entrar na Área do aluno</a> com este e-mail (${esc(to)}).</p>
<p>Boa viagem,<br>Leo &amp; Helena</p>`,
    }),
  });
  if (!res.ok) console.error("Resend respondeu", res.status, await res.text());
}
