import type { Tournament } from "./types";

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const numFormatter = new Intl.NumberFormat("pt-BR");

export const brl = (n: number) => brlFormatter.format(n);
export const num = (n: number) => numFormatter.format(n);

export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** AAAA-MM-DD no fuso local. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(date: string, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
}

export const tournamentStart = (t: Pick<Tournament, "date" | "time">) => parseLocalDate(t.date, t.time);

export function earlyBirdDeadline(t: Pick<Tournament, "date" | "time">, hours: number): Date {
  return new Date(tournamentStart(t).getTime() - hours * 3_600_000);
}

const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const dayMonthFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const longFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const shortDateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const clean = (s: string) => s.replace(".", "").replace(" de ", " ");

export const weekdayShort = (d: Date) => clean(weekdayFmt.format(d)).toUpperCase();
export const dayMonth = (d: Date) => clean(dayMonthFmt.format(d));
export const longDate = (d: Date) => longFmt.format(d);
export const shortDate = (d: Date) => shortDateFmt.format(d);
export const dateTime = (d: Date) => dateTimeFmt.format(d);

export interface Countdown {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdown(target: Date, now: Date): Countdown {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3_600),
    minutes: Math.floor((s % 3_600) / 60),
    seconds: s % 60,
  };
}

export function countdownLabel(c: Countdown): string {
  if (c.done) return "encerrado";
  if (c.days > 0) return `${c.days}d ${c.hours}h`;
  if (c.hours > 0) return `${c.hours}h ${String(c.minutes).padStart(2, "0")}min`;
  return `${c.minutes}min ${String(c.seconds).padStart(2, "0")}s`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function ordinal(n: number): string {
  return `${n}º`;
}
