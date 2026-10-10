import { brl, longDate, num, tournamentStart, uid } from "./format";
import type { Interest, OutboxMessage, Settings, Tournament } from "./types";

/**
 * Textos das mensagens automáticas. Os modelos de WhatsApp precisam ser
 * cadastrados na Meta com exatamente estes textos (veja docs/whatsapp.md);
 * cada {{n}} é preenchido com o item n da lista de parâmetros.
 */
export const WHATSAPP_TEMPLATES = {
  aviso_inscricao: [
    "Nova inscrição no {{1}}.",
    "",
    "Jogador: {{2}}",
    "WhatsApp: {{3}}",
    "E-mail: {{4}}",
    "Torneio: {{5}}",
    "Early bird: {{6}}",
    "Situação: {{7}}",
    "Inscritos: {{8}}",
    "",
    "Veja todas as inscrições na área do clube.",
  ].join("\n"),
  inscricao_confirmada: [
    "Olá, {{1}}! Sua inscrição no {{2}} está confirmada.",
    "",
    "Data: {{3}}",
    "Horário: {{4}}",
    "Buy-in: {{5}}",
    "Garantido: {{6}}",
    "Stack inicial: {{7}} fichas",
    "Early bird: {{8}}",
    "Local: {{9}}",
    "",
    "Guarde esta mensagem como comprovante. Até a mesa!",
  ].join("\n"),
  inscricao_recebida: [
    "Olá, {{1}}! Recebemos seu interesse no {{2}}, {{3}} às {{4}}.",
    "",
    "Early bird: {{5}}",
    "",
    "O clube vai confirmar sua vaga e você recebe outra mensagem por aqui.",
  ].join("\n"),
} as const;

export type WhatsAppTemplate = keyof typeof WHATSAPP_TEMPLATES;

export function fillTemplate(template: WhatsAppTemplate, params: string[]): string {
  return WHATSAPP_TEMPLATES[template].replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? "");
}

/** Converte um telefone brasileiro para 55 + DDD + número. Retorna null se não for válido. */
export function normalizeBrPhone(input: string): string | null {
  let d = input.replace(/\D/g, "").replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return /^55\d{10,11}$/.test(d) ? d : null;
}

/** 5511912345678 → (11) 91234-5678. Outros formatos voltam como estão. */
export function displayPhone(phone: string): string {
  if (!/^55\d{10,11}$/.test(phone)) return phone;
  const local = phone.slice(2);
  const rest = local.slice(2);
  return `(${local.slice(0, 2)}) ${rest.slice(0, -4)}-${rest.slice(-4)}`;
}

// Parâmetros de modelos do WhatsApp não podem ter quebra de linha.
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

function whatsapp(
  kind: OutboxMessage["kind"],
  interest: Interest,
  to: string,
  template: WhatsAppTemplate,
  params: string[],
  subject: string,
): OutboxMessage {
  const clean = params.map(oneLine);
  return {
    id: uid("msg"),
    channel: "whatsapp",
    kind,
    interestId: interest.id,
    to,
    subject,
    template,
    params: clean,
    body: fillTemplate(template, clean),
    createdAt: new Date().toISOString(),
    sent: false,
  };
}

function earlyBirdText(interest: Interest, settings: Settings) {
  return interest.earlyBird ? `garantido, ${settings.earlyBirdBonus}` : "inscrição feita depois do prazo";
}

/** Mensagem para o jogador: confirmação com todos os dados do torneio. */
export function playerConfirmation(settings: Settings, t: Tournament, interest: Interest): OutboxMessage | null {
  const phone = normalizeBrPhone(interest.phone);
  if (!phone) return null;
  return whatsapp(
    "confirmacao_jogador",
    interest,
    phone,
    "inscricao_confirmada",
    [
      interest.name.split(" ")[0],
      t.name,
      longDate(tournamentStart(t)),
      t.time,
      brl(t.buyIn),
      brl(t.guaranteed),
      num(t.startingStack),
      earlyBirdText(interest, settings),
      `${settings.clubName}, ${settings.address}, ${settings.city}`,
    ],
    `Inscrição confirmada no ${t.name}`,
  );
}

/** Todas as mensagens geradas quando alguém clica em "Quero jogar". */
export function registrationMessages(
  settings: Settings,
  t: Tournament,
  interest: Interest,
  registeredCount: number,
): OutboxMessage[] {
  const start = tournamentStart(t);
  const when = `${longDate(start)} às ${t.time}`;
  const status = interest.status === "confirmado" ? "confirmada automaticamente" : "aguardando sua confirmação";
  const playerPhone = normalizeBrPhone(interest.phone);
  const messages: OutboxMessage[] = [];

  const ownerPhone = normalizeBrPhone(settings.ownerWhatsapp);
  if (ownerPhone) {
    messages.push(
      whatsapp(
        "aviso_dono",
        interest,
        ownerPhone,
        "aviso_inscricao",
        [
          t.name,
          interest.name,
          playerPhone ? displayPhone(playerPhone) : "não informado",
          interest.email,
          when,
          interest.earlyBird ? `sim, ${settings.earlyBirdBonus}` : "não",
          status,
          `${registeredCount} de ${t.maxPlayers} vagas`,
        ],
        `Nova inscrição: ${interest.name} no ${t.name}`,
      ),
    );
  }

  messages.push({
    id: uid("msg"),
    channel: "email",
    kind: "aviso_dono",
    interestId: interest.id,
    to: settings.ownerEmail,
    subject: `Nova inscrição: ${interest.name} no ${t.name} (${when})`,
    body: [
      `${interest.name} quer jogar o ${t.name}.`,
      ``,
      `Torneio: ${t.name}, ${when}`,
      `Buy-in: ${brl(t.buyIn)}`,
      `Jogador: ${interest.name}`,
      `E-mail: ${interest.email}`,
      `WhatsApp: ${playerPhone ? displayPhone(playerPhone) : "não informado"}`,
      `Early bird: ${interest.earlyBird ? `sim, ${settings.earlyBirdBonus}` : "não, inscrição fora do prazo"}`,
      `Situação: ${status}`,
      ``,
      `Veja todas as inscrições na área do clube.`,
    ].join("\n"),
    createdAt: new Date().toISOString(),
    sent: false,
  });

  if (playerPhone) {
    if (interest.status === "confirmado") {
      const msg = playerConfirmation(settings, t, interest);
      if (msg) messages.push(msg);
    } else {
      messages.push(
        whatsapp(
          "interesse_recebido",
          interest,
          playerPhone,
          "inscricao_recebida",
          [interest.name.split(" ")[0], t.name, longDate(start), t.time, earlyBirdText(interest, settings)],
          `Interesse recebido no ${t.name}`,
        ),
      );
    }
  }

  return messages;
}
