import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { CHEVERUS, IPHONE_17 } from '../theme/theme';

export interface SplashProps {
  /** Shows an error with a Try again button instead of the spinner. */
  error?: string;
  onRetry?: () => void;
}

/** Shown while the session and saved plan load from the server. */
export function Splash({ error, onRetry }: SplashProps) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        maxWidth: IPHONE_17.width + 28,
        mx: 'auto',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        component="img"
        src="/cheverus-logo.png"
        alt="Cheverus Catholic School logo"
        sx={{ width: 96, height: 96, borderRadius: '50%', bgcolor: '#fff', border: `4px solid ${CHEVERUS.yellow}` }}
      />
      <Typography variant="h1" component="h1">
        Lunch Planner
      </Typography>
      {error ? (
        <>
          <Typography variant="body2" sx={{ opacity: 0.9 }} role="alert">
            {error}
          </Typography>
          <Button variant="contained" color="secondary" onClick={onRetry}>
            Try again
          </Button>
        </>
      ) : (
        <CircularProgress aria-label="Loading" sx={{ color: CHEVERUS.yellow }} />
      )}
    </Box>
  );
}
