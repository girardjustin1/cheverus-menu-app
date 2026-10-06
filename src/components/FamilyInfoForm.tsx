import { Box, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { validateAccount, type Account } from '../lib/account';
import { alpha } from '@mui/material/styles';
import { GENDER_LABELS, GRADES, type ChildGender, type ParentDetails } from '../lib/plan';
import { useAutofill } from '../prototype/autofill';
import { CHEVERUS } from '../theme/theme';

export interface FamilyInfoFormProps {
  details: ParentDetails;
  onChange: (patch: Partial<ParentDetails>) => void;
  /** Shown as the sign-off placeholder, e.g. the signed-in account's name. */
  signOffPlaceholder?: string;
  /** When given, a Parent section lets the signed-in parent edit their name and email. */
  account?: Account;
  onAccountChange?: (patch: Partial<Account>) => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography variant="overline" color="text.secondary" component="h3" sx={{ lineHeight: 1.5 }}>
      {children}
    </Typography>
  );
}

/** Parent name updates live; email is committed on blur so saved data moves once, not per keystroke. */
function ParentAccountFields({ account, onChange }: { account: Account; onChange: (patch: Partial<Account>) => void }) {
  const [email, setEmail] = useState(account.email);
  const errors = validateAccount({ fullName: account.fullName, email });
  return (
    <>
      <TextField
        label="Parent full name"
        autoComplete="name"
        value={account.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        slotProps={{ htmlInput: { inputMode: 'email', autoCapitalize: 'none' } }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => {
          if (!errors.email && email.trim() !== account.email) onChange({ email: email.trim() });
        }}
        error={Boolean(errors.email)}
        helperText={errors.email ?? 'Your plans and past orders are saved under this email.'}
      />
    </>
  );
}

const GENDERS = Object.keys(GENDER_LABELS) as ChildGender[];

export type ProfileSection = 'parent' | 'child';

/** Parent Info: who signs the email (plus the account, when signed in). */
export function ParentInfoFields({ details, onChange, signOffPlaceholder, account, onAccountChange }: FamilyInfoFormProps) {
  const autofill = useAutofill();
  return (
    <Stack spacing={3}>
      {account && onAccountChange && <ParentAccountFields account={account} onChange={onAccountChange} />}
      <TextField
        label="Sign emails as"
        placeholder={signOffPlaceholder}
        helperText={signOffPlaceholder && !details.parentName ? `Leave blank to sign as ${signOffPlaceholder}` : undefined}
        value={details.parentName}
        {...autofill('parentName', details.parentName, (parentName) => onChange({ parentName }))}
        onChange={(e) => onChange({ parentName: e.target.value })}
      />
    </Stack>
  );
}

/** Child Info: name, gender, grade and teacher. */
export function ChildInfoFields({ details, onChange }: Pick<FamilyInfoFormProps, 'details' | 'onChange'>) {
  const autofill = useAutofill();
  // Keep a grade saved before the dropdown existed (e.g. free text) selectable.
  const grades = details.classroom && !GRADES.includes(details.classroom) ? [details.classroom, ...GRADES] : GRADES;
  return (
    <Stack spacing={3}>
      <TextField
        label="Child's name"
        value={details.childName}
        {...autofill('childName', details.childName, (childName) => onChange({ childName }))}
        onChange={(e) => onChange({ childName: e.target.value })}
      />
      <Box role="group" aria-labelledby="gender-label">
        <Typography id="gender-label" variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.75 }}>
          Gender
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={details.gender || null}
          onChange={(_, gender: ChildGender | null) => onChange({ gender: gender ?? '' })}
          aria-labelledby="gender-label"
          sx={{
            bgcolor: alpha(CHEVERUS.navy, 0.06),
            borderRadius: '10px',
            p: 0.5,
            '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '8px !important', fontWeight: 700, px: 1 },
            '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
              bgcolor: CHEVERUS.navy,
              color: '#FFFFFF',
            },
          }}
        >
          {GENDERS.map((g) => (
            <ToggleButton key={g} value={g}>
              {GENDER_LABELS[g]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <TextField
        select
        label="Grade"
        value={details.classroom}
        onChange={(e) => onChange({ classroom: e.target.value })}
        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 360 } } } } } }}
      >
        {grades.map((grade) => (
          <MenuItem key={grade} value={grade} sx={{ minHeight: 48 }}>
            {grade}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Teacher's name"
        placeholder="e.g. Ms. Smith"
        value={details.teacherName}
        {...autofill('teacherName', details.teacherName, (teacherName) => onChange({ teacherName }))}
        onChange={(e) => onChange({ teacherName: e.target.value })}
      />
    </Stack>
  );
}

/** Both sections stacked — used inline where there's no Profile page (e.g. a standalone email card). */
export function FamilyInfoForm(props: FamilyInfoFormProps) {
  return (
    <Stack spacing={3}>
      <SectionLabel>{props.account ? 'Parent' : 'Email details'}</SectionLabel>
      <ParentInfoFields {...props} />
      <SectionLabel>Child</SectionLabel>
      <ChildInfoFields details={props.details} onChange={props.onChange} />
    </Stack>
  );
}
