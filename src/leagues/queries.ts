import { queryOptions } from '@tanstack/react-query';
import { fetchAllLeagues, fetchLeaguesBySport, fetchSeasons, type Sport } from './api';

export const leagueKeys = {
  all: ['leagues'] as const,
  lists: () => [...leagueKeys.all, 'list'] as const,
  list: () => [...leagueKeys.lists(), 'all'] as const,
  listBySport: (sport: Sport) => [...leagueKeys.lists(), { sport }] as const,
  seasons: () => [...leagueKeys.all, 'seasons'] as const,
  season: (id: string) => [...leagueKeys.seasons(), id] as const,
};

// Public API of this module: only the key factory and *Options() functions.
// Callers choose useQuery / useQueries / useSuspenseQuery / prefetchQuery.
export const leaguesListOptions = () =>
  queryOptions({
    queryKey: leagueKeys.list(),
    queryFn: ({ signal }) => fetchAllLeagues(signal),
  });

export const leaguesBySportOptions = (sport: Sport) =>
  queryOptions({
    queryKey: leagueKeys.listBySport(sport),
    queryFn: ({ signal }) => fetchLeaguesBySport(sport, signal),
  });

export const leagueSeasonsOptions = (id: string) =>
  queryOptions({
    queryKey: leagueKeys.season(id),
    queryFn: ({ signal }) => fetchSeasons(id, signal),
  });
