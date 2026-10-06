import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { validateAccount, type Account } from '../lib/account';
import { useAutofill } from '../prototype/autofill';
import { CHEVERUS, IPHONE_17 } from '../theme/theme';

export interface LoginScreenProps {
  onSignIn: (account: Account) => void;
  /** Prefill, e.g. the last account used on this device. */
  initial?: Partial<Account>;
}

export function LoginScreen({ onSignIn, initial }: LoginScreenProps) {
  const [values, setValues] = useState<Account>({ fullName: initial?.fullName ?? '', email: initial?.email ?? '' });
  const [submitted, setSubmitted] = useState(false);
  const autofill = useAutofill();
  const errors = validateAccount(values);
  const show = (field: keyof Account) => (submitted ? errors[field] : undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onSignIn(values);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        maxWidth: IPHONE_17.width + 28,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'primary.main',
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          textAlign: 'center',
          color: 'primary.contrastText',
          px: 3,
          pt: 'calc(env(safe-area-inset-top) + 56px)',
          pb: 4,
        }}
      >
        <Box
          component="img"
          src="/cheverus-logo.png"
          alt="Cheverus Catholic School logo"
          sx={{ width: 104, height: 104, borderRadius: '50%', bgcolor: '#fff', mb: 2, border: `4px solid ${CHEVERUS.yellow}` }}
        />
        <Typography variant="h1" component="h1">
          Lunch Planner
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          Plan lunch, drinks and Extended Day, then email the school.
        </Typography>
      </Stack>

      <Box
        component="form"
        noValidate
        onSubmit={submit}
        sx={{ flex: 1, bgcolor: 'background.default', borderRadius: '24px 24px 0 0', px: 3, pt: 4, pb: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <Typography variant="h2" component="h2" sx={{ mb: 0.5 }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your name signs the emails. Your plans and order history are saved under this email.
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Parent full name"
            autoComplete="name"
            value={values.fullName}
            {...autofill('fullName', values.fullName, (fullName) => setValues((v) => ({ ...v, fullName })))}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            error={Boolean(show('fullName'))}
            helperText={show('fullName')}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            slotProps={{ htmlInput: { inputMode: 'email', autoCapitalize: 'none' } }}
            value={values.email}
            {...autofill('email', values.email, (email) => setValues((v) => ({ ...v, email })))}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            error={Boolean(show('email'))}
            helperText={show('email')}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Continue
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: 'flex-start', color: 'text.secondary' }}>
          <LockOutlinedIcon sx={{ fontSize: 18, mt: '2px' }} />
          <Typography variant="caption">
            Prototype sign-in: no password, and nothing is sent anywhere. Your details stay on this device.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
