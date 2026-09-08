import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { SPORTS, type League } from '../api';
import { leaguesBySportOptions, leaguesListOptions } from '../queries';
import { mergeLeagues } from '../utils/mergeLeagues';

export interface LeagueSources {
  leagues: League[]; // merge of whatever has arrived so far
  isPending: boolean; // primary source not loaded yet
  isEnriching: boolean; // some per-sport source still loading
  error: Error | null; // primary source only
  refetch: () => void;
}

const EMPTY: League[] = [];

// all_leagues.php is the primary source (the requirement). The per-sport
// searches enrich it; each one fails on its own without touching the page.
export function useLeagueSources(): LeagueSources {
  const primary = useQuery(leaguesListOptions());

  const secondary = useQueries({
    queries: SPORTS.map((sport) => leaguesBySportOptions(sport)),
    combine: (results) => ({
      lists: results.map((result) => result.data ?? EMPTY),
      isPending: results.some((result) => result.isPending),
    }),
  });

  const leagues = useMemo(
    () => mergeLeagues([primary.data ?? EMPTY, ...secondary.lists]),
    [primary.data, secondary.lists],
  );

  return {
    leagues,
    isPending: primary.isPending,
    isEnriching: secondary.isPending,
    error: primary.error,
    refetch: () => void primary.refetch(),
  };
}
