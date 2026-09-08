import { Box, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { League } from '../../api';
import { leagueSeasonsOptions } from '../../queries';

interface BadgeContentProps {
  league: League;
}

export const BADGE_SIZE = 240;

export function BadgeContent({ league }: BadgeContentProps) {
  const { data: seasons } = useSuspenseQuery(leagueSeasonsOptions(league.idLeague));
  const season = seasons.findLast((candidate) => candidate.strBadge);

  if (!season?.strBadge) {
    return <Typography>No badge available</Typography>;
  }

  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Typography color="text.secondary">Season {season.strSeason}</Typography>
      <Box
        sx={{
          width: '100%',
          height: BADGE_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src={season.strBadge}
          alt={`${league.strLeague} badge, season ${season.strSeason}`}
          width={BADGE_SIZE}
          height={BADGE_SIZE}
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>
    </Stack>
  );
}
