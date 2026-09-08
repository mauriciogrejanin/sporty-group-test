import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { League } from '../api';

interface LeagueCardProps {
  league: League;
  onSelect: (league: League) => void;
}

export function LeagueCard({ league, onSelect }: LeagueCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => onSelect(league)} sx={{ height: '100%', minHeight: 48 }}>
        <CardContent>
          <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h6" component="h2">
              {league.strLeague}
            </Typography>
            <Chip size="small" label={league.strSport} />
            <Typography variant="body2" color="text.secondary">
              {league.strLeagueAlternate}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
