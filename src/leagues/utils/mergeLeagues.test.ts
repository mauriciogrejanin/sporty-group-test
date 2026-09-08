import { describe, expect, it } from 'vitest';
import type { League } from '../api';
import { mergeLeagues } from './mergeLeagues';

const premierBare: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: null,
};
const premierFull: League = { ...premierBare, strLeagueAlternate: 'Premier League' };
const nba: League = {
  idLeague: '4387',
  strLeague: 'NBA',
  strSport: 'Basketball',
  strLeagueAlternate: 'National Basketball Association',
};
const laLiga: League = {
  idLeague: '4335',
  strLeague: 'Spanish La Liga',
  strSport: 'Soccer',
  strLeagueAlternate: 'La Liga',
};

describe('mergeLeagues', () => {
  it('removes duplicates by idLeague', () => {
    expect(mergeLeagues([[premierBare], [premierBare]])).toEqual([premierBare]);
  });

  it('prefers the record with an alternate name, whichever source it comes from', () => {
    expect(mergeLeagues([[premierBare], [premierFull]])).toEqual([premierFull]);
    expect(mergeLeagues([[premierFull], [premierBare]])).toEqual([premierFull]);
  });

  it('sorts by sport, then by league name', () => {
    expect(mergeLeagues([[laLiga, premierFull], [nba]])).toEqual([nba, premierFull, laLiga]);
  });

  it('returns an empty list for no sources or empty sources', () => {
    expect(mergeLeagues([])).toEqual([]);
    expect(mergeLeagues([[], []])).toEqual([]);
  });
});
