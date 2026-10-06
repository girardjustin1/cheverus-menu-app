import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { HashRouter } from '../lib/RouterProvider';
import { CHEVERUS, APP_MAX_WIDTH } from '../theme/theme';
import { AutofillProvider } from './AutofillProvider';

/**
 * Click-through prototype: starts at sign-in, keeps everything in memory (nothing saved),
 * and fills any text field with sample data when tapped.
 */
export function Prototype() {
  const [run, setRun] = useState(0);
  return (
    <>
      <Box
        sx={{
          maxWidth: APP_MAX_WIDTH,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.5,
          pt: 'calc(env(safe-area-inset-top) + 4px)',
          bgcolor: CHEVERUS.navyDeep,
          color: CHEVERUS.yellow,
        }}
      >
        <Typography variant="caption" sx={{ flex: 1, fontWeight: 800, letterSpacing: '0.04em' }}>
          PROTOTYPE · tap any field to fill it
        </Typography>
        <Button
          size="small"
          startIcon={<RestartAltRoundedIcon />}
          onClick={() => {
            // Start over: clear the deep link, then remount everything.
            window.history.replaceState(null, '', window.location.pathname);
            setRun((n) => n + 1);
            window.scrollTo({ top: 0 });
          }}
          sx={{ color: CHEVERUS.yellow, minHeight: 32, px: 1 }}
        >
          Restart
        </Button>
      </Box>
      <AutofillProvider>
        {/* Hash router = deep links work here too. The fixture keeps data in memory and starts at sign-in. */}
        <HashRouter key={run}>
          <AppShell fixture={{ account: null }} />
        </HashRouter>
      </AutofillProvider>
    </>
  );
}
