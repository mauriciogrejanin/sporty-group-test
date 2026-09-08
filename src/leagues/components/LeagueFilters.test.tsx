import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LeagueFilters } from './LeagueFilters';

function renderFilters(overrides: { query?: string; sport?: string } = {}) {
  const onQueryChange = vi.fn();
  const onSportChange = vi.fn();
  render(
    <LeagueFilters
      filters={{ query: overrides.query ?? '', sport: overrides.sport ?? '' }}
      sports={['Basketball', 'Soccer']}
      onQueryChange={onQueryChange}
      onSportChange={onSportChange}
    />,
  );
  return { onQueryChange, onSportChange, user: userEvent.setup() };
}

describe('LeagueFilters', () => {
  it('shows the current filter values', () => {
    renderFilters({ query: 'premier', sport: 'Soccer' });

    expect(screen.getByLabelText('Search leagues')).toHaveValue('premier');
    expect(screen.getByRole('combobox', { name: 'Sport' })).toHaveTextContent('Soccer');
  });

  it('lists "All sports" followed by the sports it receives', async () => {
    const { user } = renderFilters();

    await user.click(screen.getByRole('combobox', { name: 'Sport' }));

    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'All sports',
      'Basketball',
      'Soccer',
    ]);
  });

  it('reports the chosen sport, and an empty string for "All sports"', async () => {
    const { user, onSportChange } = renderFilters({ sport: 'Soccer' });

    await user.click(screen.getByRole('combobox', { name: 'Sport' }));
    await user.click(screen.getByRole('option', { name: 'Basketball' }));
    expect(onSportChange).toHaveBeenLastCalledWith('Basketball');

    await user.click(screen.getByRole('combobox', { name: 'Sport' }));
    await user.click(screen.getByRole('option', { name: 'All sports' }));
    expect(onSportChange).toHaveBeenLastCalledWith('');
  });

  it('reports typed text', async () => {
    const { user, onQueryChange } = renderFilters();

    await user.type(screen.getByLabelText('Search leagues'), 'n');

    expect(onQueryChange).toHaveBeenCalledWith('n');
  });

  it('clears the query from the clear button', async () => {
    const { user, onQueryChange } = renderFilters({ query: 'premier' });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onQueryChange).toHaveBeenCalledWith('');
  });
});
