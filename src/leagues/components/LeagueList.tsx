import { Button, Grid, Stack, Typography } from '@mui/material';
import type { League } from '../api';
import { LeagueCard } from './LeagueCard';

interface LeagueListProps {
  leagues: League[];
  onSelect: (league: League) => void;
  onClear: () => void;
}

export function LeagueList({ leagues, onSelect, onClear }: LeagueListProps) {
  if (leagues.length === 0) {
    return (
      <Stack spacing={2} sx={{ py: 6, alignItems: 'center' }}>
        <Typography>No leagues match your filters</Typography>
        <Button variant="outlined" onClick={onClear}>
          Clear filters
        </Button>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {leagues.map((league) => (
        <Grid key={league.idLeague} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <LeagueCard league={league} onSelect={onSelect} />
        </Grid>
      ))}
    </Grid>
  );
}
