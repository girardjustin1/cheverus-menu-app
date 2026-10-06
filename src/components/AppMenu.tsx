import FamilyRestroomRoundedIcon from '@mui/icons-material/FamilyRestroomRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { initials, type Account } from '../lib/account';
import type { ParentDetails } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export type AppView = 'plan' | 'orders' | 'profile';

export interface AppMenuProps {
  account: Account;
  details: ParentDetails;
  view: AppView;
  onNavigate: (view: AppView) => void;
  ordersCount: number;
  draftsCount?: number;
  onSignOut: () => void;
}

/** Contents of the left push menu: who's signed in, family info, navigation, sign out. */
export function AppMenu({ account, details, view, onNavigate, ordersCount, draftsCount = 0, onSignOut }: AppMenuProps) {
  const child = [details.childName, details.classroom].filter(Boolean).join(' · ');
  const items: { view: AppView; label: string; secondary?: string; icon: React.ReactNode }[] = [
    { view: 'plan', label: 'Plan lunches', icon: <RestaurantMenuRoundedIcon /> },
    {
      view: 'orders',
      label: 'Past orders',
      secondary:
        [ordersCount ? `${ordersCount} sent` : '', draftsCount ? `${draftsCount} ${draftsCount === 1 ? 'draft' : 'drafts'}` : '']
          .filter(Boolean)
          .join(' · ') || 'None yet',
      icon: (
        <Badge badgeContent={ordersCount} color="secondary" max={99}>
          <HistoryRoundedIcon />
        </Badge>
      ),
    },
    {
      view: 'profile',
      label: 'Profile',
      secondary: child || 'Parent info · Child info',
      icon: <FamilyRestroomRoundedIcon />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 2,
          pt: 'calc(env(safe-area-inset-top) + 20px)',
          pb: 2.5,
          borderBottom: `4px solid ${CHEVERUS.yellow}`,
        }}
      >
        <Box
          component="img"
          src="/cheverus-logo.png"
          alt="Cheverus Catholic School logo"
          sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#fff', mb: 1.5 }}
        />
        <ButtonBase
          onClick={() => onNavigate('profile')}
          aria-label={`${account.fullName}, ${account.email}. Edit parent info`}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '8px', p: 0.5, mx: -0.5 }}
        >
          <Avatar sx={{ bgcolor: CHEVERUS.yellow, color: CHEVERUS.navy, fontWeight: 800 }}>
            {initials(account.fullName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {account.fullName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }} noWrap>
              {account.email}
            </Typography>
          </Box>
          <EditRoundedIcon sx={{ ml: 'auto', fontSize: 20, opacity: 0.85 }} />
        </ButtonBase>
      </Box>

      <List component="nav" aria-label="Main" sx={{ flex: 1, py: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.view}
            selected={view === item.view}
            aria-current={view === item.view ? 'page' : undefined}
            onClick={() => onNavigate(item.view)}
            sx={{ minHeight: 56, mx: 1, borderRadius: '8px' }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.secondary}
              slotProps={{ primary: { sx: { fontWeight: 700 } } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <List sx={{ pb: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
        <ListItemButton onClick={onSignOut} sx={{ minHeight: 56, mx: 1, borderRadius: '8px' }}>
          <ListItemIcon>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </ListItemButton>
      </List>
    </Box>
  );
}
