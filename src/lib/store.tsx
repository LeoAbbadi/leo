import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LocalDataSource, type DataSource } from "./dataSource";
import { brl, dateTime, earlyBirdDeadline, longDate, tournamentStart, uid } from "./format";
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
      updateInterest: (id, patch) => run(source.updateInterest(id, patch)),
      deleteInterest: (id) => run(source.deleteInterest(id)),
      setResults: (tid, results) => run(source.setResults(tid, results)),
      resetDemo: () => run(source.reset()),
      async registerInterest(input) {
        if (!data) throw new Error("Os dados ainda estão carregando.");
        const t = data.tournaments.find((x) => x.id === input.tournamentId);
        if (!t) throw new Error("Torneio não encontrado.");
        const now = new Date();
        const earlyBird = now <= earlyBirdDeadline(t, data.settings.earlyBirdHours);
        const interest: Interest = {
          id: uid("in"),
          tournamentId: t.id,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          createdAt: now.toISOString(),
          earlyBird,
          status: "pendente",
        };
        const start = tournamentStart(t);
        const email = {
          id: uid("em"),
          to: data.settings.ownerEmail,
          subject: `Novo interesse: ${interest.name} no ${t.name} (${dateTime(start)})`,
          body: [
            `${interest.name} quer jogar o ${t.name}.`,
            ``,
            `Torneio: ${t.name}, ${longDate(start)} às ${t.time}`,
            `Buy-in: ${brl(t.buyIn)}`,
            `Jogador: ${interest.name}`,
            `E-mail: ${interest.email}`,
            `Telefone: ${interest.phone || "não informado"}`,
            `Early bird: ${earlyBird ? `SIM (${data.settings.earlyBirdBonus})` : "não, inscrição fora do prazo"}`,
            ``,
            `Confirme a vaga na área do clube.`,
          ].join("\n"),
          createdAt: now.toISOString(),
          sent: false,
        };
        await run(source.createInterest(interest, email));
        return interest;
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
