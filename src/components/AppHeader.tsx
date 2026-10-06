import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CHEVERUS, NARROW } from '../theme/theme';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  /** Shows the hamburger when given. */
  onMenuClick?: () => void;
  menuOpen?: boolean;
  /** Right-hand slot, e.g. the month picker. */
  action?: ReactNode;
}

export function AppHeader({
  title = 'Lunch Planner',
  subtitle = 'Cheverus Catholic School',
  onMenuClick,
  menuOpen,
  action,
}: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        pl: onMenuClick ? 0.5 : 2,
        pr: 2,
        pt: 'calc(env(safe-area-inset-top) + 12px)',
        pb: 1.5,
        borderBottom: `4px solid ${CHEVERUS.yellow}`,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', [NARROW]: { gap: 0.25 } }}>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            onClick={onMenuClick}
          >
            <MenuRoundedIcon />
          </IconButton>
        )}
        <Box
          component="img"
          src="/cheverus-logo.png"
          alt="Cheverus Catholic School logo"
          sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff', flexShrink: 0, [NARROW]: { width: 32, height: 32 } }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" component="h1" sx={{ fontSize: 'clamp(1rem, 4.6vw, 1.15rem)', lineHeight: 1.2 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', [NARROW]: { display: 'none' } }} noWrap>
            {subtitle}
          </Typography>
        </Box>
        {action}
      </Stack>
    </Box>
  );
}
