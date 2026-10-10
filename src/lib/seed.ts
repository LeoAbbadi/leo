import { isoDate } from "./format";
import { registrationMessages } from "./messages";
import type { Interest, Player, Result, Settings, Snapshot, Tournament } from "./types";

/**
 * Dados de exemplo para o modo demonstração. As datas são geradas a partir
 * de hoje para a grade sempre ter torneios futuros e um ranking já em andamento.
 */

type Template = Omit<Tournament, "id" | "date" | "status">;

const WEEKLY: Record<number, Template> = {
  1: {
    name: "Segunda Turbo",
    time: "20:00",
    buyIn: 100,
    rebuy: 100,
    addon: 80,
    guaranteed: 5000,
    startingStack: 20000,
    blindMinutes: 12,
    lateRegLevels: 8,
    maxPlayers: 60,
    pointsMultiplier: 1,
    description: "Estrutura rápida para começar a semana. Rebuy ilimitado até o fim do late registration.",
    featured: false,
  },
  3: {
    name: "Quarta Deep Stack",
    time: "20:00",
    buyIn: 200,
    rebuy: null,
    addon: 100,
    guaranteed: 10000,
    startingStack: 40000,
    blindMinutes: 20,
    lateRegLevels: 10,
    maxPlayers: 80,
    pointsMultiplier: 1,
    description: "Stack profundo e níveis de 20 minutos para quem gosta de jogar poker de verdade.",
    featured: false,
  },
  5: {
    name: "Sexta Big Night",
    time: "21:00",
    buyIn: 250,
    rebuy: 250,
    addon: 150,
    guaranteed: 20000,
    startingStack: 30000,
    blindMinutes: 15,
    lateRegLevels: 12,
    maxPlayers: 120,
    pointsMultiplier: 1.5,
    description: "O torneio mais cheio da semana. Vale 1,5x pontos no ranking.",
    featured: false,
  },
  6: {
    name: "Main Event de Sábado",
    time: "16:00",
    buyIn: 500,
    rebuy: null,
    addon: 250,
    guaranteed: 50000,
    startingStack: 60000,
    blindMinutes: 25,
    lateRegLevels: 10,
    maxPlayers: 150,
    pointsMultiplier: 2,
    description: "O principal torneio do clube. Garantido de R$ 50 mil e pontos em dobro no ranking.",
    featured: true,
  },
  0: {
    name: "Domingo Bounty",
    time: "17:00",
    buyIn: 300,
    rebuy: null,
    addon: null,
    guaranteed: 15000,
    startingStack: 30000,
    blindMinutes: 20,
    lateRegLevels: 8,
    maxPlayers: 90,
    pointsMultiplier: 1,
    description: "Metade do buy-in vira recompensa pela cabeça de cada jogador eliminado.",
    featured: false,
  },
};

const PLAYER_NAMES: [string, string][] = [
  ["Rafael Monteiro", "Rafa"],
  ["Camila Duarte", "Cami"],
  ["Thiago Albuquerque", "Thiagão"],
  ["Juliana Prado", "Ju"],
  ["Marcos Vieira", "Marquinhos"],
  ["Fernanda Lopes", "Nanda"],
  ["Bruno Carvalho", "Bruninho"],
  ["Larissa Nunes", "Lari"],
  ["Diego Fontana", "Fontana"],
  ["Patrícia Rocha", "Paty"],
  ["Gustavo Teixeira", "Guga"],
  ["Renata Azevedo", "Rê"],
  ["Felipe Moraes", "Lipe"],
  ["Aline Barros", "Aline"],
  ["Eduardo Ramos", "Dudu"],
  ["Vanessa Pires", "Vane"],
  ["Leonardo Castro", "Leo"],
  ["Priscila Melo", "Pri"],
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seasonFor(today: Date) {
  const y = today.getFullYear();
  const first = today.getMonth() < 6;
  return {
    name: `Ranking ${first ? "1º" : "2º"} semestre ${y}`,
    start: first ? `${y}-01-01` : `${y}-07-01`,
    end: first ? `${y}-06-30` : `${y}-12-31`,
  };
}

export function createSeed(today = new Date()): Snapshot {
  const season = seasonFor(today);
  const settings: Settings = {
    clubName: "Ypiranga Poker",
    tagline: "Torneios de poker toda semana",
    city: "São Paulo, SP",
    address: "Rua Exemplo, 100",
    whatsapp: "(11) 90000-0000",
    instagram: "",
    ownerEmail: "dono@exemplo.com",
    ownerWhatsapp: "5511900000000",
    autoConfirm: true,
    earlyBirdHours: 24,
    earlyBirdBonus: "+5.000 fichas no stack inicial",
    seasonName: season.name,
    seasonStart: season.start,
    seasonEnd: season.end,
    seasonPrize: "R$ 5.000 em vagas de torneio e o troféu de campeão do semestre",
    pointsTable: [100, 80, 65, 55, 45, 38, 32, 27, 23, 20],
  };

  const players: Player[] = PLAYER_NAMES.map(([name, nickname], i) => ({
    id: `pl_${i + 1}`,
    name,
    nickname,
    email: `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@exemplo.com`,
    phone: `(11) 9${4000 + i * 311}-${1000 + i * 457}`,
    createdAt: new Date(today.getTime() - (60 - i) * 86_400_000).toISOString(),
  }));

  const tournaments: Tournament[] = [];
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let offset = -24; offset <= 14; offset++) {
    const day = new Date(midnight.getTime() + offset * 86_400_000);
    const tpl = WEEKLY[day.getDay()];
    if (!tpl) continue;
    const date = isoDate(day);
    tournaments.push({
      ...tpl,
      id: `tr_${date}`,
      date,
      status: offset < 0 ? "finalizado" : "agendado",
    });
  }

  const rand = mulberry32(today.getFullYear() * 1000 + today.getMonth());
  const results: Result[] = [];
  for (const t of tournaments.filter((x) => x.status === "finalizado")) {
    const pool = [...players].sort(() => rand() - 0.5);
    const field = pool.slice(0, 11 + Math.floor(rand() * 7));
    field.forEach((p, idx) =>
      results.push({ id: `rs_${t.id}_${idx + 1}`, tournamentId: t.id, playerId: p.id, position: idx + 1 }),
    );
  }

  const upcoming = tournaments.filter((t) => t.status === "agendado");
  const interests: Interest[] = [];
  upcoming.slice(0, 4).forEach((t, ti) => {
    players.slice(ti * 3, ti * 3 + 3 + (ti % 2)).forEach((p, pi) => {
      interests.push({
        id: `in_${t.id}_${p.id}`,
        tournamentId: t.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        createdAt: new Date(today.getTime() - (pi + 1) * 3_600_000 * (ti + 2)).toISOString(),
        earlyBird: pi % 3 !== 2,
        status: ti === 1 && pi === 2 ? "cancelado" : "confirmado",
      });
    });
  });

  // Exemplos de mensagens das duas inscrições mais recentes.
  const outbox = [...interests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2)
    .reverse()
    .flatMap((i) => {
      const t = tournaments.find((x) => x.id === i.tournamentId)!;
      const count = interests.filter((x) => x.tournamentId === t.id && x.status !== "cancelado").length;
      return registrationMessages(settings, t, i, count).map((m) => ({ ...m, createdAt: i.createdAt }));
    })
    .reverse();

  return { settings, tournaments, players, interests, results, outbox };
}
