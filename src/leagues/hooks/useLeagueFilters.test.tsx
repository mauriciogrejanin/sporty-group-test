import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useLeagueFilters } from './useLeagueFilters';

function renderFilters(initialEntry = '/') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  return renderHook(() => ({ ...useLeagueFilters(), search: useLocation().search }), { wrapper });
}

describe('useLeagueFilters', () => {
  it('reads q and sport from the URL', () => {
    const { result } = renderFilters('/?q=premier&sport=Soccer');

    expect(result.current.filters).toEqual({ query: 'premier', sport: 'Soccer' });
  });

  it('defaults to empty filters when the URL has no params', () => {
    const { result } = renderFilters();

    expect(result.current.filters).toEqual({ query: '', sport: '' });
  });

  it('writes the query to ?q=', () => {
    const { result } = renderFilters();

    act(() => result.current.setQuery('nba'));

    expect(result.current.search).toBe('?q=nba');
    expect(result.current.filters.query).toBe('nba');
  });

  it('removes the param when the value is empty and keeps the other one', () => {
    const { result } = renderFilters('/?q=premier&sport=Soccer');

    act(() => result.current.setQuery(''));

    expect(result.current.search).toBe('?sport=Soccer');
  });

  it('writes the sport to ?sport=', () => {
    const { result } = renderFilters('/?q=premier');

    act(() => result.current.setSport('Basketball'));

    expect(result.current.search).toBe('?q=premier&sport=Basketball');
  });

  it('clear removes every filter', () => {
    const { result } = renderFilters('/?q=premier&sport=Soccer');

    act(() => result.current.clear());

    expect(result.current.search).toBe('');
    expect(result.current.filters).toEqual({ query: '', sport: '' });
  });
});
