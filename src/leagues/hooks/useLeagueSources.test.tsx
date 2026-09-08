import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { League } from '../api';
import { useLeagueSources } from './useLeagueSources';

vi.mock('../../http/reportContractViolation', () => ({ reportContractViolation: vi.fn() }));

const premier: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: null,
};
const laLiga: League = {
  idLeague: '4335',
  strLeague: 'Spanish La Liga',
  strSport: 'Soccer',
  strLeagueAlternate: null,
};
const nba: League = {
  idLeague: '4387',
  strLeague: 'NBA',
  strSport: 'Basketball',
  strLeagueAlternate: 'National Basketball Association',
};

type Responder = (url: string) => Promise<Response>;

function json(body: unknown): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
}

function stubFetch(respond: Responder) {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>((input) => {
      if (typeof input !== 'string') throw new Error('Expected a string URL');
      return respond(input);
    }),
  );
}

// Default API: primary returns two Soccer leagues, Basketball adds one,
// Motorsport fails on the network, the other sports come back empty.
function defaultRespond(url: string): Promise<Response> {
  if (url.includes('/all_leagues.php')) return json({ leagues: [premier, laLiga] });
  if (url.includes('s=Basketball')) return json({ countries: [nba] });
  if (url.includes('s=Motorsport')) return Promise.reject(new TypeError('Failed to fetch'));
  return json({ countries: null });
}

function renderSources() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache(),
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useLeagueSources(), { wrapper });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useLeagueSources', () => {
  it('starts pending and enriching with no leagues', () => {
    stubFetch(defaultRespond);

    const { result } = renderSources();

    expect(result.current.isPending).toBe(true);
    expect(result.current.isEnriching).toBe(true);
    expect(result.current.leagues).toEqual([]);
  });

  it('merges the primary source with the per-sport sources', async () => {
    stubFetch(defaultRespond);

    const { result } = renderSources();

    await waitFor(() => expect(result.current.isEnriching).toBe(false));
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.leagues.map((league) => league.idLeague)).toEqual([
      nba.idLeague,
      premier.idLeague,
      laLiga.idLeague,
    ]);
  });

  it('ignores a failing per-sport source', async () => {
    stubFetch(defaultRespond);

    const { result } = renderSources();

    await waitFor(() => expect(result.current.isEnriching).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.leagues).toHaveLength(3);
  });

  it('reports a primary failure as error but keeps what the other sources returned', async () => {
    stubFetch((url) =>
      url.includes('/all_leagues.php') ? json({ unexpected: true }) : defaultRespond(url),
    );

    const { result } = renderSources();

    await waitFor(() => expect(result.current.error).not.toBeNull());
    await waitFor(() => expect(result.current.isEnriching).toBe(false));
    expect(result.current.isPending).toBe(false);
    expect(result.current.leagues.map((league) => league.idLeague)).toEqual([nba.idLeague]);
  });
});
