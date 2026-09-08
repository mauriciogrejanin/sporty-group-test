import { describe, expect, it } from 'vitest';
import type { League } from '../api';
import { filterLeagues, uniqueSports } from './filterLeagues';

const premier: League = {
  idLeague: '1',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: 'Premier League, EPL',
};
const laLiga: League = {
  idLeague: '2',
  strLeague: 'Spanish La Liga',
  strSport: 'Soccer',
  strLeagueAlternate: null,
};
const nba: League = {
  idLeague: '3',
  strLeague: 'NBA',
  strSport: 'Basketball',
  strLeagueAlternate: 'National Basketball Association',
};
const f1: League = {
  idLeague: '4',
  strLeague: 'Formula 1',
  strSport: 'Motorsport',
};

const all = [premier, laLiga, nba, f1];

describe('filterLeagues', () => {
  it('returns everything when both filters are empty', () => {
    expect(filterLeagues(all, { query: '', sport: '' })).toEqual(all);
  });

  it('matches the league name', () => {
    expect(filterLeagues(all, { query: 'liga', sport: '' })).toEqual([laLiga]);
  });

  it('matches the alternate name', () => {
    expect(filterLeagues(all, { query: 'epl', sport: '' })).toEqual([premier]);
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(filterLeagues(all, { query: '  PREMIER ', sport: '' })).toEqual([premier]);
  });

  it('filters by sport', () => {
    expect(filterLeagues(all, { query: '', sport: 'Soccer' })).toEqual([premier, laLiga]);
  });

  it('combines query and sport', () => {
    expect(filterLeagues(all, { query: 'league', sport: 'Soccer' })).toEqual([premier]);
    expect(filterLeagues(all, { query: 'league', sport: 'Basketball' })).toEqual([]);
  });

  it('copes with a null or missing alternate name', () => {
    expect(filterLeagues([laLiga, f1], { query: 'formula', sport: '' })).toEqual([f1]);
  });
});

describe('uniqueSports', () => {
  it('returns the distinct sports sorted alphabetically', () => {
    expect(uniqueSports(all)).toEqual(['Basketball', 'Motorsport', 'Soccer']);
  });

  it('returns an empty list for no leagues', () => {
    expect(uniqueSports([])).toEqual([]);
  });
});
