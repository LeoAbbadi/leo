export type TournamentStatus = "agendado" | "em_andamento" | "finalizado" | "cancelado";

export interface Tournament {
  id: string;
  name: string;
  /** Data local no formato AAAA-MM-DD. */
  date: string;
  /** Horário local no formato HH:MM. */
  time: string;
  buyIn: number;
  rebuy: number | null;
  addon: number | null;
  guaranteed: number;
  startingStack: number;
  blindMinutes: number;
  lateRegLevels: number;
  maxPlayers: number;
  /** Multiplica os pontos de ranking deste torneio (ex.: Main Event vale 2x). */
  pointsMultiplier: number;
  description: string;
  status: TournamentStatus;
  featured: boolean;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  createdAt: string;
}

export type InterestStatus = "pendente" | "confirmado" | "cancelado";

export interface Interest {
  id: string;
  tournamentId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  earlyBird: boolean;
  status: InterestStatus;
}

export interface Result {
  id: string;
  tournamentId: string;
  playerId: string;
  position: number;
}

/** E-mail que o sistema deve enviar ao dono do clube. */
export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
  sent: boolean;
}

export interface Settings {
  clubName: string;
  tagline: string;
  city: string;
  address: string;
  whatsapp: string;
  ownerEmail: string;
  /** Inscrições feitas até X horas antes do início ganham early bird. */
  earlyBirdHours: number;
  earlyBirdBonus: string;
  seasonName: string;
  seasonStart: string;
  seasonEnd: string;
  seasonPrize: string;
  /** Pontos por posição: índice 0 = 1º lugar. Quem termina depois da última posição da tabela não pontua. */
  pointsTable: number[];
}

export interface Snapshot {
  settings: Settings;
  tournaments: Tournament[];
  players: Player[];
  interests: Interest[];
  results: Result[];
  outbox: OutboxEmail[];
}
