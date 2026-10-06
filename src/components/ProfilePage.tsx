import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import type { Account } from '../lib/account';
import type { ParentDetails } from '../lib/plan';
import { ChildInfoFields, ParentInfoFields, type ProfileSection } from './FamilyInfoForm';

export interface ProfilePageProps {
  tab: ProfileSection;
  onTabChange: (tab: ProfileSection) => void;
  details: ParentDetails;
  onDetailsChange: (patch: Partial<ParentDetails>) => void;
  account: Account;
  onAccountChange: (patch: Partial<Account>) => void;
  onDone: () => void;
}

/** Profile with Parent Info / Child Info tabs. Each tab is its own deep link. */
export function ProfilePage({ tab, onTabChange, details, onDetailsChange, account, onAccountChange, onDone }: ProfilePageProps) {
  return (
    <Box>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="h2" component="h2">
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Used to sign and fill in every email. Saved on this device only.
        </Typography>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, next: ProfileSection) => onTabChange(next)}
        variant="fullWidth"
        aria-label="Profile sections"
        sx={{ mt: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Tab value="parent" label="Parent Info" id="profile-tab-parent" aria-controls="profile-panel" sx={{ minHeight: 52 }} />
        <Tab value="child" label="Child Info" id="profile-tab-child" aria-controls="profile-panel" sx={{ minHeight: 52 }} />
      </Tabs>
      <Box id="profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`} sx={{ p: 2, pt: 3.5 }}>
        {tab === 'parent' ? (
          <ParentInfoFields
            details={details}
            onChange={onDetailsChange}
            signOffPlaceholder={account.fullName}
            account={account}
            onAccountChange={onAccountChange}
          />
        ) : (
          <ChildInfoFields details={details} onChange={onDetailsChange} />
        )}
        <Button variant="contained" size="large" fullWidth sx={{ mt: 4 }} onClick={onDone}>
          Done
        </Button>
      </Box>
    </Box>
  );
}
