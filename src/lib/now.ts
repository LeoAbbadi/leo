import { useEffect, useState } from "react";
import { initialStops, type Stop } from "../content/now";
import { isLive } from "./env";
import { getSupabase } from "./supabase";

/**
 * Onde vocês estão: a última parada registrada. No modo real fica na tabela
 * `travel_log` do Supabase (todo mundo lê, só os donos gravam); no modo
 * demonstração fica neste navegador.
 */

const KEY = "leo-helena:stops:v1";
const listeners = new Set<() => void>();

function readLocal(): Stop[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Stop[];
  } catch {
    /* sem armazenamento */
  }
  return initialStops;
}

const byArrival = (a: Stop, b: Stop) => b.arrived.localeCompare(a.arrived);

export async function loadStops(): Promise<Stop[]> {
  if (!isLive) return [...readLocal()].sort(byArrival);
  try {
    const sb = await getSupabase();
    const { data, error } = await sb.from("travel_log").select("city, country, lat, lon, timezone, arrived, note").order("arrived", { ascending: false }).limit(50);
    if (error || !data?.length) return [...initialStops].sort(byArrival);
    return data as Stop[];
  } catch {
    return [...initialStops].sort(byArrival);
  }
}

export async function addStop(stop: Stop): Promise<void> {
  if (isLive) {
    const sb = await getSupabase();
    const { error } = await sb.from("travel_log").insert(stop);
    if (error) throw new Error(error.message);
  } else {
    const next = [stop, ...readLocal()];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* sem armazenamento */
    }
  }
  listeners.forEach((l) => l());
}

export async function removeLatestStop(): Promise<void> {
  if (isLive) {
    const sb = await getSupabase();
    const { data } = await sb.from("travel_log").select("id").order("arrived", { ascending: false }).order("id", { ascending: false }).limit(1);
    if (data?.[0]) await sb.from("travel_log").delete().eq("id", data[0].id);
  } else {
    const list = [...readLocal()].sort(byArrival).slice(1);
    try {
      localStorage.setItem(KEY, JSON.stringify(list.length ? list : initialStops));
    } catch {
      /* sem armazenamento */
    }
  }
  listeners.forEach((l) => l());
}

/** Paradas, da mais recente para a mais antiga. A primeira é "agora". */
export function useStops() {
  const [stops, setStops] = useState<Stop[]>(() => (isLive ? initialStops : [...readLocal()].sort(byArrival)));
  useEffect(() => {
    let alive = true;
    const load = () => loadStops().then((s) => alive && setStops(s));
    load();
    listeners.add(load);
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, []);
  return stops;
}

/** Hora local de um fuso, atualizada a cada 15 s. */
export function useLocalTime(timezone: string) {
  const fmt = () => {
    try {
      return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date());
    } catch {
      return "";
    }
  };
  const [t, setT] = useState(fmt);
  useEffect(() => {
    setT(fmt());
    const id = window.setInterval(() => setT(fmt()), 15_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone]);
  return t;
}

const weatherText: Record<number, string> = {
  0: "Céu limpo",
  1: "Quase limpo",
  2: "Algumas nuvens",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina",
  51: "Garoa",
  53: "Garoa",
  55: "Garoa forte",
  61: "Chuva fraca",
  63: "Chuva",
  65: "Chuva forte",
  71: "Neve fraca",
  73: "Neve",
  75: "Neve forte",
  80: "Pancadas de chuva",
  81: "Pancadas de chuva",
  82: "Temporal",
  95: "Trovoadas",
};

/** Tempo agora no lugar (Open-Meteo, grátis e sem chave). Some quietinho se falhar. */
export function useWeather(lat: number, lon: number) {
  const [w, setW] = useState<{ temp: number; text: string } | null>(null);
  useEffect(() => {
    setW(null);
    const ctrl = new AbortController();
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { current?: { temperature_2m: number; weather_code: number } }) => {
        if (d.current) setW({ temp: Math.round(d.current.temperature_2m), text: weatherText[d.current.weather_code] ?? "" });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [lat, lon]);
  return w;
}

export interface Place {
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
  timezone: string;
}

/** Busca cidades pelo nome (Open-Meteo Geocoding, grátis e sem chave). */
export async function searchCity(q: string): Promise<Place[]> {
  if (q.trim().length < 2) return [];
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=pt&format=json`);
  if (!r.ok) throw new Error("busca indisponível");
  const d: { results?: { name: string; country: string; admin1?: string; latitude: number; longitude: number; timezone: string }[] } = await r.json();
  return (d.results ?? []).map((x) => ({ name: x.name, country: x.country, admin: x.admin1, lat: x.latitude, lon: x.longitude, timezone: x.timezone }));
}
