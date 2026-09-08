import { Alert, Button, Container, LinearProgress, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import type { League } from './api';
import { BadgeDialog } from './components/BadgeDialog/BadgeDialog';
import { LeagueFilters } from './components/LeagueFilters';
import { LeagueList } from './components/LeagueList';
import { LeagueListSkeleton } from './components/LeagueListSkeleton';
import { useLeagueFilters } from './hooks/useLeagueFilters';
import { useLeagueSources } from './hooks/useLeagueSources';
import { filterLeagues, uniqueSports } from './utils/filterLeagues';

export function LeaguesPage() {
  const { leagues, isPending, isEnriching, error, refetch } = useLeagueSources();
  const { filters, setQuery, setSport, clear } = useLeagueFilters();
  const [selected, setSelected] = useState<League | null>(null);

  const sports = useMemo(() => uniqueSports(leagues), [leagues]);
  const visible = useMemo(() => filterLeagues(leagues, filters), [leagues, filters]);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Stack spacing={2}>
        <LeagueFilters
          filters={filters}
          sports={sports}
          onQueryChange={setQuery}
          onSportChange={setSport}
        />

        {isEnriching && <LinearProgress aria-label="Loading more sports" />}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            Could not load leagues: {error.message}
          </Alert>
        )}

        {isPending ? (
          <LeagueListSkeleton />
        ) : (
          <LeagueList leagues={visible} onSelect={setSelected} onClear={clear} />
        )}
      </Stack>

      <BadgeDialog league={selected} onClose={() => setSelected(null)} />
    </Container>
  );
}
