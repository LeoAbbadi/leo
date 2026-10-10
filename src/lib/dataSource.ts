import { createSeed } from "./seed";
import type { Interest, OutboxMessage, Player, Result, Settings, Snapshot, Tournament } from "./types";

/**
 * Contrato entre o site e onde os dados ficam guardados.
 * Hoje a implementação é local (navegador). Ao conectar o banco de dados,
 * basta criar outra implementação desta interface; as telas não mudam.
 */
export interface DataSource {
  load(): Promise<Snapshot>;
  saveSettings(settings: Settings): Promise<void>;
  saveTournament(t: Tournament): Promise<void>;
  deleteTournament(id: string): Promise<void>;
  savePlayer(p: Player): Promise<void>;
  deletePlayer(id: string): Promise<void>;
  createInterest(i: Interest, messages: OutboxMessage[]): Promise<void>;
  /** Coloca mensagens (e-mail, WhatsApp) na fila de envio. */
  queueMessages(messages: OutboxMessage[]): Promise<void>;
  updateInterest(id: string, patch: Partial<Interest>): Promise<void>;
  deleteInterest(id: string): Promise<void>;
  setResults(tournamentId: string, results: Result[]): Promise<void>;
  reset(): Promise<void>;
  /** Avisa quando os dados mudam em outra aba ou dispositivo. */
  subscribe(onChange: () => void): () => void;
}

// Trocar a versão da chave recomeça os dados de exemplo para todos os visitantes.
const STORAGE_KEY = "ypiranga-poker:v2";
const CHANNEL = "ypiranga-poker";

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

/** Completa dados salvos por versões anteriores do site. */
function migrate(snap: Snapshot): Snapshot {
  const saved: Partial<Settings> = snap.settings;
  const settings: Settings = saved.ownerWhatsapp !== undefined ? snap.settings : { ...createSeed().settings, ...saved };
  const outbox: OutboxMessage[] = (snap.outbox ?? []).map((m) => ({
    ...m,
    channel: m.channel ?? "email",
    kind: m.kind ?? "aviso_dono",
    interestId: m.interestId ?? "",
  }));
  return { ...snap, settings, outbox };
}

export class LocalDataSource implements DataSource {
  private memory: Snapshot | null = null;
  private channel: BroadcastChannel | null =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

  private read(): Snapshot {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrate(JSON.parse(raw) as Snapshot);
    } catch {
      // Armazenamento bloqueado (janela anônima, prévia): segue em memória.
    }
    if (!this.memory) this.memory = createSeed();
    return this.memory;
  }

  private write(next: Snapshot) {
    this.memory = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Sem armazenamento: os dados valem só enquanto a página estiver aberta.
    }
    this.channel?.postMessage("changed");
  }

  private mutate(fn: (s: Snapshot) => Snapshot) {
    this.write(fn(this.read()));
    return Promise.resolve();
  }

  async load() {
    const snap = this.read();
    // Primeira visita: grava os dados de exemplo.
    try {
      if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      /* sem armazenamento */
    }
    return structuredClone(snap);
  }

  saveSettings(settings: Settings) {
    return this.mutate((s) => ({ ...s, settings }));
  }

  saveTournament(t: Tournament) {
    return this.mutate((s) => ({ ...s, tournaments: upsert(s.tournaments, t) }));
  }

  deleteTournament(id: string) {
    return this.mutate((s) => ({
      ...s,
      tournaments: s.tournaments.filter((t) => t.id !== id),
      interests: s.interests.filter((i) => i.tournamentId !== id),
      results: s.results.filter((r) => r.tournamentId !== id),
    }));
  }

  savePlayer(p: Player) {
    return this.mutate((s) => ({ ...s, players: upsert(s.players, p) }));
  }

  deletePlayer(id: string) {
    return this.mutate((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== id),
      results: s.results.filter((r) => r.playerId !== id),
    }));
  }

  createInterest(i: Interest, messages: OutboxMessage[]) {
    return this.mutate((s) => ({ ...s, interests: [...s.interests, i], outbox: [...messages, ...s.outbox] }));
  }

  queueMessages(messages: OutboxMessage[]) {
    return this.mutate((s) => ({ ...s, outbox: [...messages, ...s.outbox] }));
  }

  updateInterest(id: string, patch: Partial<Interest>) {
    return this.mutate((s) => ({
      ...s,
      interests: s.interests.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }

  deleteInterest(id: string) {
    return this.mutate((s) => ({ ...s, interests: s.interests.filter((i) => i.id !== id) }));
  }

  setResults(tournamentId: string, results: Result[]) {
    return this.mutate((s) => ({
      ...s,
      results: [...s.results.filter((r) => r.tournamentId !== tournamentId), ...results],
      tournaments: s.tournaments.map((t) =>
        t.id === tournamentId ? { ...t, status: results.length ? "finalizado" : t.status } : t,
      ),
    }));
  }

  reset() {
    this.write(createSeed());
    return Promise.resolve();
  }

  subscribe(onChange: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) onChange();
    };
    const onMessage = () => onChange();
    window.addEventListener("storage", onStorage);
    this.channel?.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("storage", onStorage);
      this.channel?.removeEventListener("message", onMessage);
    };
  }
}
