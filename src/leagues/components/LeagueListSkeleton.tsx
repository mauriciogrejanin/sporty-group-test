import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

const PLACEHOLDERS = 8;

export function LeagueListSkeleton() {
  return (
    <Grid container spacing={2} aria-busy="true" aria-label="Loading leagues">
      {Array.from({ length: PLACEHOLDERS }, (_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton variant="rounded" height={120} />
        </Grid>
      ))}
    </Grid>
  );
}
