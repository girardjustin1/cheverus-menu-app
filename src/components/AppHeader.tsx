import { Box, Stack, Typography } from '@mui/material';
import { CHEVERUS } from '../theme/theme';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  title = 'Lunch Planner',
  subtitle = 'Cheverus Catholic · Sep/Oct 2026 menu',
}: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: 2,
        pt: 'calc(env(safe-area-inset-top) + 14px)',
        pb: 2,
        borderBottom: `4px solid ${CHEVERUS.yellow}`,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src="/cheverus-logo.png"
          alt="Cheverus Catholic School logo"
          sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#fff', flexShrink: 0 }}
        />
        <Box>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
