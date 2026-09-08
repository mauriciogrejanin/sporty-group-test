import { useSearchParams } from 'react-router-dom';
import type { LeagueFilters } from '../utils/filterLeagues';

const PARAM = {
  query: 'q',
  sport: 'sport',
} as const;

export interface UseLeagueFiltersResult {
  filters: LeagueFilters;
  setQuery: (query: string) => void;
  setSport: (sport: string) => void;
  clear: () => void;
}

export function useLeagueFilters(): UseLeagueFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: LeagueFilters = {
    query: searchParams.get(PARAM.query) ?? '',
    sport: searchParams.get(PARAM.sport) ?? '',
  };

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  return {
    filters,
    setQuery: (query) => setParam(PARAM.query, query),
    setSport: (sport) => setParam(PARAM.sport, sport),
    clear: () => setSearchParams({}, { replace: true }),
  };
}
