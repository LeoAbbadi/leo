import { parseLocalDate } from "./format";
import type { Player, Snapshot } from "./types";

export interface RankingRow {
  player: Player;
  points: number;
  played: number;
  wins: number;
  itm: number;
  best: number | null;
}

export function pointsFor(position: number, table: number[], multiplier = 1): number {
  const base = table[position - 1] ?? 0;
  return Math.round(base * multiplier);
}

/**
 * Soma os pontos de cada jogador nos torneios finalizados dentro do semestre.
 * Desempate: pontos, vitórias, vezes que pontuou e melhor colocação.
 */
export function computeRanking(data: Snapshot): RankingRow[] {
  const { settings, tournaments, players, results } = data;
  const start = parseLocalDate(settings.seasonStart);
  const end = parseLocalDate(settings.seasonEnd, "23:59");
  const inSeason = new Map(
    tournaments
      .filter((t) => t.status === "finalizado")
      .filter((t) => {
        const d = parseLocalDate(t.date, t.time);
        return d >= start && d <= end;
      })
      .map((t) => [t.id, t]),
  );

  const rows = new Map<string, RankingRow>();
  for (const r of results) {
    const t = inSeason.get(r.tournamentId);
    if (!t) continue;
    const player = players.find((p) => p.id === r.playerId);
    if (!player) continue;
    const row = rows.get(player.id) ?? { player, points: 0, played: 0, wins: 0, itm: 0, best: null };
    const pts = pointsFor(r.position, settings.pointsTable, t.pointsMultiplier);
    row.points += pts;
    row.played += 1;
    if (r.position === 1) row.wins += 1;
    if (pts > 0) row.itm += 1;
    row.best = row.best === null ? r.position : Math.min(row.best, r.position);
    rows.set(player.id, row);
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.itm - a.itm ||
      (a.best ?? 999) - (b.best ?? 999) ||
      a.player.name.localeCompare(b.player.name),
  );
}
