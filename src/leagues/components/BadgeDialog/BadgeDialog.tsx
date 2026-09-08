import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { League } from '../../api';
import { BadgeContent } from './BadgeContent';
import { BadgeSkeleton } from './BadgeSkeleton';

interface BadgeDialogProps {
  league: League | null;
  onClose: () => void;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function BadgeDialog({ league, onClose }: BadgeDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { reset } = useQueryErrorResetBoundary();

  return (
    <Dialog
      open={league !== null}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      {league && (
        <>
          <DialogTitle component="div">
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>{league.strLeague}</span>
              <IconButton aria-label="Close" onClick={onClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => resetErrorBoundary()}>
                      Try again
                    </Button>
                  }
                >
                  Could not load the badge: {describe(error)}
                </Alert>
              )}
            >
              <Suspense fallback={<BadgeSkeleton />}>
                <BadgeContent league={league} />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
