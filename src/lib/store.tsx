import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LocalDataSource, type DataSource } from "./dataSource";
import { earlyBirdDeadline, uid } from "./format";
import { normalizeBrPhone, playerConfirmation, registrationMessages } from "./messages";
import type { Interest, Player, Result, Settings, Snapshot, Tournament } from "./types";

export interface InterestInput {
  tournamentId: string;
  name: string;
  email: string;
  phone: string;
}

interface DataContextValue {
  data: Snapshot | null;
  /** true enquanto os dados ficam só neste navegador (antes de conectar o banco). */
  demo: boolean;
  saveSettings(s: Settings): Promise<void>;
  saveTournament(t: Tournament): Promise<void>;
  deleteTournament(id: string): Promise<void>;
  savePlayer(p: Player): Promise<void>;
  deletePlayer(id: string): Promise<void>;
  registerInterest(input: InterestInput): Promise<Interest>;
  updateInterest(id: string, patch: Partial<Interest>): Promise<void>;
  deleteInterest(id: string): Promise<void>;
  setResults(tournamentId: string, results: Result[]): Promise<void>;
  resetDemo(): Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const source: DataSource = new LocalDataSource();

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot | null>(null);

  const refresh = useCallback(async () => {
    setData(await source.load());
  }, []);

  useEffect(() => {
    refresh();
    return source.subscribe(refresh);
  }, [refresh]);

  const value = useMemo<DataContextValue>(() => {
    const run = async (p: Promise<void>) => {
      await p;
      await refresh();
    };
    return {
      data,
      demo: source instanceof LocalDataSource,
      saveSettings: (s) => run(source.saveSettings(s)),
      saveTournament: (t) => run(source.saveTournament(t)),
      deleteTournament: (id) => run(source.deleteTournament(id)),
      savePlayer: (p) => run(source.savePlayer(p)),
      deletePlayer: (id) => run(source.deletePlayer(id)),
      deleteInterest: (id) => run(source.deleteInterest(id)),
      setResults: (tid, results) => run(source.setResults(tid, results)),
      resetDemo: () => run(source.reset()),
      async registerInterest(input) {
        if (!data) throw new Error("Os dados ainda estão carregando.");
        const t = data.tournaments.find((x) => x.id === input.tournamentId);
        if (!t) throw new Error("Torneio não encontrado.");
        const now = new Date();
        const phone = input.phone.trim() ? normalizeBrPhone(input.phone) : "";
        if (phone === null) throw new Error("Confira o WhatsApp: use DDD e número, como (11) 91234-5678.");
        const interest: Interest = {
          id: uid("in"),
          tournamentId: t.id,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone,
          createdAt: now.toISOString(),
          earlyBird: now <= earlyBirdDeadline(t, data.settings.earlyBirdHours),
          status: data.settings.autoConfirm ? "confirmado" : "pendente",
        };
        const registered = data.interests.filter((i) => i.tournamentId === t.id && i.status !== "cancelado").length + 1;
        await run(source.createInterest(interest, registrationMessages(data.settings, t, interest, registered)));
        return interest;
      },
      async updateInterest(id, patch) {
        const before = data?.interests.find((i) => i.id === id);
        await source.updateInterest(id, patch);
        // Quando o dono confirma uma vaga pendente, o jogador recebe a confirmação no WhatsApp.
        if (data && before && patch.status === "confirmado" && before.status !== "confirmado") {
          const t = data.tournaments.find((x) => x.id === before.tournamentId);
          const msg = t && playerConfirmation(data.settings, t, { ...before, ...patch });
          if (msg) await source.queueMessages([msg]);
        }
        await refresh();
      },
    };
  }, [data, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData precisa estar dentro de <DataProvider>.");
  return ctx;
}

/** Atualiza o horário atual em intervalos, para contagens regressivas. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
