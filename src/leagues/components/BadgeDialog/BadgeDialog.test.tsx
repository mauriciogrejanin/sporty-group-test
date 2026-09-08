import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { League, Season } from '../../api';
import { BadgeDialog } from './BadgeDialog';

vi.mock('../../../http/reportContractViolation', () => ({ reportContractViolation: vi.fn() }));

const premier: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: 'Premier League',
};

const seasons: Season[] = [
  { strSeason: '2021-2022', strBadge: 'https://cdn.test/2021.png' },
  { strSeason: '2022-2023', strBadge: 'https://cdn.test/2022.png' },
  { strSeason: '2023-2024', strBadge: null },
];

function json(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

function stubFetch(respond: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(respond));
}

function renderDialog(league: League | null) {
  const onClose = vi.fn();
  const queryClient = new QueryClient({
    queryCache: new QueryCache(),
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <BadgeDialog league={league} onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose, user: userEvent.setup() };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BadgeDialog', () => {
  it('renders nothing when there is no selected league', () => {
    stubFetch(() => json({ seasons }));

    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the league name, a skeleton, then the most recent badge', async () => {
    stubFetch(() => json({ seasons }));

    renderDialog(premier);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('English Premier League');
    expect(screen.getByLabelText('Loading badge')).toBeInTheDocument();

    const img = await screen.findByRole('img', {
      name: 'English Premier League badge, season 2022-2023',
    });
    expect(img).toHaveAttribute('src', 'https://cdn.test/2022.png');
    expect(screen.getByText('Season 2022-2023')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading badge')).not.toBeInTheDocument();
  });

  it('explains when no season has a badge', async () => {
    stubFetch(() => json({ seasons: [{ strSeason: '2023-2024', strBadge: null }] }));

    renderDialog(premier);

    expect(await screen.findByText('No badge available')).toBeInTheDocument();
  });

  it('shows an error with "Try again" that recovers once the request succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let failing = true;
    stubFetch(() => (failing ? json('boom', 500) : json({ seasons })));

    const { user } = renderDialog(premier);

    expect(await screen.findByText(/Could not load the badge/)).toBeInTheDocument();

    failing = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('img')).toHaveAttribute('src', 'https://cdn.test/2022.png');
  });

  it('calls onClose from the close button', async () => {
    stubFetch(() => json({ seasons }));

    const { user, onClose } = renderDialog(premier);

    await user.click(await screen.findByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
