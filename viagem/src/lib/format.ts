const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (cents: number) => brlFmt.format(cents / 100);

/** "12x de R$ 33,08" (valor sem juros; o Mercado Pago mostra os juros no checkout). */
export function installmentsLabel(cents: number, max: number) {
  if (max <= 1) return "à vista no Pix ou cartão";
  return `ou ${max}x de ${brl(Math.ceil(cents / max))}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso)).replace(/\./g, "");
export const fmtDateTime = (iso: string) => timeFmt.format(new Date(iso));

/** Dias completos desde uma data (AAAA-MM-DD). */
export function daysSince(isoDate: string, now = new Date()) {
  const start = new Date(`${isoDate}T00:00:00`);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
}

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function maskCpf(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/** Confere os dígitos verificadores do CPF. */
export function isValidCpf(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digit(9) === Number(d[9]) && digit(10) === Number(d[10]);
}

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
