import { Skeleton, Stack } from '@mui/material';
import { BADGE_SIZE } from './BadgeContent';

export function BadgeSkeleton() {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }} aria-busy="true" aria-label="Loading badge">
      <Skeleton variant="text" width={140} />
      <Skeleton variant="rounded" width={BADGE_SIZE} height={BADGE_SIZE} />
    </Stack>
  );
}
