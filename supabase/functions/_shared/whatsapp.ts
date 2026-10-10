// Envio de mensagens pelo WhatsApp oficial (WhatsApp Cloud API, da Meta).
// Todas as mensagens saem do mesmo número: o número do clube cadastrado na Meta.
//
// Segredos necessários no servidor (nunca no código do site):
//   WHATSAPP_TOKEN            token permanente de um usuário do sistema da Meta
//   WHATSAPP_PHONE_NUMBER_ID  ID do número do clube (não é o telefone em si)
//   WHATSAPP_GRAPH_VERSION    opcional, versão da API (padrão abaixo)
//
// Os modelos (templates) e seus textos estão em src/lib/messages.ts e precisam
// estar aprovados no WhatsApp Manager com os mesmos nomes. Veja docs/whatsapp.md.

const DEFAULT_GRAPH_VERSION = "v21.0";

export interface WhatsAppSendResult {
  messageId: string;
}

export async function sendWhatsAppTemplate(
  to: string,
  template: string,
  params: string[],
  language = "pt_BR",
): Promise<WhatsAppSendResult> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const version = Deno.env.get("WHATSAPP_GRAPH_VERSION") ?? DEFAULT_GRAPH_VERSION;
  if (!token || !phoneNumberId) {
    throw new Error("Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID nos segredos do servidor.");
  }

  const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: language },
        components: [
          {
            type: "body",
            parameters: params.map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`O WhatsApp recusou a mensagem para ${to} (${template}): ${reason}`);
  }
  return { messageId: json?.messages?.[0]?.id ?? "" };
}
