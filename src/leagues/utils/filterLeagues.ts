import type { League } from '../api';

export interface LeagueFilters {
  query: string;
  sport: string; // '' means all sports
}

export function filterLeagues(leagues: readonly League[], filters: LeagueFilters): League[] {
  const query = filters.query.trim().toLowerCase();

  return leagues.filter((league) => {
    if (filters.sport && league.strSport !== filters.sport) return false;
    if (!query) return true;

    return (
      league.strLeague.toLowerCase().includes(query) ||
      (league.strLeagueAlternate ?? '').toLowerCase().includes(query)
    );
  });
}

export function uniqueSports(leagues: readonly League[]): string[] {
  return [...new Set(leagues.map((league) => league.strSport))].sort((a, b) => a.localeCompare(b));
}
