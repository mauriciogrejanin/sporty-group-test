import type { League } from '../api';

// Union of several sources by idLeague. On a duplicate the record that carries
// an alternate name wins, because all_leagues.php omits it and the per-sport
// endpoint fills it in. Output is sorted by sport, then name.
export function mergeLeagues(sources: readonly (readonly League[])[]): League[] {
  const byId = new Map<string, League>();

  for (const source of sources) {
    for (const league of source) {
      const existing = byId.get(league.idLeague);
      const fillsAlternate = !existing?.strLeagueAlternate && Boolean(league.strLeagueAlternate);
      if (!existing || fillsAlternate) byId.set(league.idLeague, league);
    }
  }

  return [...byId.values()].sort(
    (a, b) => a.strSport.localeCompare(b.strSport) || a.strLeague.localeCompare(b.strLeague),
  );
}
