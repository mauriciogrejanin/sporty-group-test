import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAllLeagues,
  fetchLeaguesBySport,
  fetchSeasons,
  type League,
  type Season,
} from './api';

vi.mock('../http/reportContractViolation', () => ({ reportContractViolation: vi.fn() }));

const premierLeague: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: 'Premier League',
};

const argentineLnb: League = {
  idLeague: '4734',
  strLeague: 'Argentine LNB',
  strSport: 'Basketball',
  strLeagueAlternate: 'Liga Nacional de Básquet',
};

function stubFetch(body: unknown) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 })),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function calledUrl(fetchMock: ReturnType<typeof stubFetch>): string {
  const input = fetchMock.mock.calls[0]?.[0];
  if (typeof input === 'string') return input;
  throw new Error('Expected fetch to be called with a string URL');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchAllLeagues', () => {
  it('calls all_leagues.php and returns the valid items as sent', async () => {
    const fetchMock = stubFetch({
      leagues: [premierLeague, { ...argentineLnb, extra: 'dropped' }],
    });

    await expect(fetchAllLeagues()).resolves.toEqual([premierLeague, argentineLnb]);
    expect(calledUrl(fetchMock)).toContain('/all_leagues.php');
  });

  it('returns an empty list when the API sends leagues: null', async () => {
    stubFetch({ leagues: null });

    await expect(fetchAllLeagues()).resolves.toEqual([]);
  });
});

describe('fetchLeaguesBySport', () => {
  it('reads the list from the "countries" key and drops invalid items', async () => {
    const fetchMock = stubFetch({ countries: [argentineLnb, { idLeague: 1 }, premierLeague] });

    await expect(fetchLeaguesBySport('Basketball')).resolves.toEqual([argentineLnb, premierLeague]);
    expect(calledUrl(fetchMock)).toContain('/search_all_leagues.php?s=Basketball');
  });

  it('URL-encodes sports with spaces', async () => {
    const fetchMock = stubFetch({ countries: null });

    await expect(fetchLeaguesBySport('Ice Hockey')).resolves.toEqual([]);
    expect(calledUrl(fetchMock)).toContain('?s=Ice%20Hockey');
  });
});

describe('fetchSeasons', () => {
  it('calls search_all_seasons.php with badge=1 and the league id', async () => {
    const seasons: Season[] = [
      { strSeason: '2022-2023', strBadge: null },
      { strSeason: '2023-2024', strBadge: 'https://cdn.test/badge.png' },
    ];
    const fetchMock = stubFetch({ seasons });

    await expect(fetchSeasons('4328')).resolves.toEqual(seasons);
    expect(calledUrl(fetchMock)).toContain('/search_all_seasons.php?badge=1&id=4328');
  });

  it('returns an empty list for seasons: null', async () => {
    stubFetch({ seasons: null });

    await expect(fetchSeasons('4328')).resolves.toEqual([]);
  });

  it('drops seasons whose badge is not a URL', async () => {
    stubFetch({
      seasons: [
        { strSeason: '2022-2023', strBadge: 'not-a-url' },
        { strSeason: '2023-2024', strBadge: 'https://cdn.test/badge.png' },
      ],
    });

    await expect(fetchSeasons('4328')).resolves.toEqual([
      { strSeason: '2023-2024', strBadge: 'https://cdn.test/badge.png' },
    ]);
  });
});
