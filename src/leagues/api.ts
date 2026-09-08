import { z } from 'zod';
import { getJson } from '../http/getJson';
import { parseItems } from '../http/parseItems';

const ENDPOINT = {
  allLeagues: `${import.meta.env.VITE_SPORTSDB_BASE_URL}/all_leagues.php`,
  leaguesBySport: `${import.meta.env.VITE_SPORTSDB_BASE_URL}/search_all_leagues.php`,
  seasons: `${import.meta.env.VITE_SPORTSDB_BASE_URL}/search_all_seasons.php`,
} as const;

const CONTEXT = {
  allLeagues: 'all_leagues',
  leaguesBySport: (sport: Sport) => `search_all_leagues:${sport}`,
  seasons: (leagueId: string) => `search_all_seasons:${leagueId}`,
} as const;

// Fixed list because all_sports.php is capped on the free key. The dropdown is
// derived from the merged data, never from this constant.
export const SPORTS = [
  'Soccer',
  'Basketball',
  'Motorsport',
  'Ice Hockey',
  'American Football',
] as const;
export type Sport = (typeof SPORTS)[number];

const leagueSchema = z.object({
  idLeague: z.string(),
  strLeague: z.string(),
  strSport: z.string(),
  strLeagueAlternate: z.string().nullable().optional(),
});

const seasonSchema = z.object({
  strSeason: z.string(),
  strBadge: z.url().nullable().optional(),
});

// Strict envelopes; items stay unknown and are validated one by one by parseItems.
const allLeaguesResponseSchema = z.object({ leagues: z.array(z.unknown()).nullable() });
const leaguesBySportResponseSchema = z.object({ countries: z.array(z.unknown()).nullable() });
const seasonsResponseSchema = z.object({ seasons: z.array(z.unknown()).nullable() });

export type League = z.infer<typeof leagueSchema>;
export type Season = z.infer<typeof seasonSchema>;

export async function fetchAllLeagues(signal?: AbortSignal): Promise<League[]> {
  const { leagues } = await getJson(ENDPOINT.allLeagues, allLeaguesResponseSchema, signal);
  return parseItems(leagues ?? [], leagueSchema, CONTEXT.allLeagues);
}

export async function fetchLeaguesBySport(sport: Sport, signal?: AbortSignal): Promise<League[]> {
  const url = `${ENDPOINT.leaguesBySport}?s=${encodeURIComponent(sport)}`;
  const { countries } = await getJson(url, leaguesBySportResponseSchema, signal);
  return parseItems(countries ?? [], leagueSchema, CONTEXT.leaguesBySport(sport));
}

export async function fetchSeasons(leagueId: string, signal?: AbortSignal): Promise<Season[]> {
  const url = `${ENDPOINT.seasons}?badge=1&id=${encodeURIComponent(leagueId)}`;
  const { seasons } = await getJson(url, seasonsResponseSchema, signal);
  return parseItems(seasons ?? [], seasonSchema, CONTEXT.seasons(leagueId));
}
