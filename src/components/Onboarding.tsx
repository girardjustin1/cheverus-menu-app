import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import type { Account } from '../lib/account';
import type { ParentDetails } from '../lib/plan';
import { CHEVERUS, APP_MAX_WIDTH } from '../theme/theme';
import { ChildInfoFields, ParentInfoFields, type ProfileSection } from './FamilyInfoForm';

export interface OnboardingProps {
  step: ProfileSection;
  onStepChange: (step: ProfileSection) => void;
  account: Account;
  onAccountChange: (patch: Partial<Account>) => void;
  details: ParentDetails;
  onDetailsChange: (patch: Partial<ParentDetails>) => void;
  /** Finish or skip — either way, go plan. */
  onFinish: () => void;
}

const STEPS: Record<ProfileSection, { n: number; title: string; body: string }> = {
  parent: { n: 1, title: 'Parent info', body: 'How you sign the emails and where they go.' },
  child: { n: 2, title: 'Child info', body: 'Who the lunches are for. You can change this later in Profile.' },
};

/** Sign-up steps after sign-in: Parent info, then Child info. Each step is a deep link. */
export function Onboarding({ step, onStepChange, account, onAccountChange, details, onDetailsChange, onFinish }: OnboardingProps) {
  const s = STEPS[step];
  const firstName = account.fullName.split(/\s+/)[0];

  return (
    <Box sx={{ minHeight: '100dvh', maxWidth: APP_MAX_WIDTH, mx: 'auto', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main' }}>
      <Stack sx={{ color: 'primary.contrastText', px: 3, pt: 'calc(env(safe-area-inset-top) + 24px)', pb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            component="img"
            src="/cheverus-logo.png"
            alt="Cheverus Catholic School logo"
            sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#fff', border: `3px solid ${CHEVERUS.yellow}` }}
          />
          <Box>
            <Typography variant="h2" component="h1">
              Welcome, {firstName}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Two quick steps, then you can start planning.
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ mt: 2.5, fontWeight: 800, letterSpacing: '0.06em', color: CHEVERUS.yellow }}>
          STEP {s.n} OF 2
        </Typography>
        <LinearProgress
          variant="determinate"
          value={s.n * 50}
          aria-label={`Step ${s.n} of 2`}
          sx={{ mt: 0.75, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: CHEVERUS.yellow } }}
        />
      </Stack>

      <Box sx={{ flex: 1, bgcolor: 'background.default', borderRadius: '24px 24px 0 0', px: 3, pt: 4, pb: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        <Typography variant="h2" component="h2">
          {s.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3.5 }}>
          {s.body}
        </Typography>

        {step === 'parent' ? (
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

        <Stack direction="row" spacing={1} sx={{ mt: 4 }}>
          {step === 'child' && (
            <Button variant="outlined" size="large" startIcon={<ArrowBackRoundedIcon />} onClick={() => onStepChange('parent')}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => (step === 'parent' ? onStepChange('child') : onFinish())}
          >
            {step === 'parent' ? 'Continue' : 'Start planning'}
          </Button>
        </Stack>
        <Button fullWidth onClick={onFinish} sx={{ mt: 1.5 }}>
          Skip for now
        </Button>
      </Box>
    </Box>
  );
}
