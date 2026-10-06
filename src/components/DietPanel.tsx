import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { DIET_PROFILE_LABELS, type DietPrefs, type DietProfile, type FillMode } from '../lib/diet';
import { CHEVERUS } from '../theme/theme';

export interface DietPanelProps {
  diet: DietPrefs;
  onChange: (patch: Partial<DietPrefs>) => void;
  onFill: (mode: FillMode) => void;
  /** Result of the last fill, e.g. "Filled lunch for 4 days". */
  status?: string;
  /** Open the modal on first render (stories). */
  defaultOpen?: boolean;
  /** Controlled open state (deep link `modal=diet`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the fill buttons act on the whole week or the selected day. */
  scope?: 'week' | 'day';
  /** 'row' = full-width card; 'compact' = small button for the combined control bar. */
  trigger?: 'row' | 'compact';
}

const PROFILES = Object.keys(DIET_PROFILE_LABELS) as DietProfile[];

function summary({ profile, nutAllergy }: DietPrefs) {
  const parts = [profile === 'none' ? 'No diet set' : DIET_PROFILE_LABELS[profile]];
  if (nutAllergy) parts.push('Nut allergy');
  return parts.join(' · ');
}

function caveat({ profile, nutAllergy }: DietPrefs): string | null {
  const notes: string[] = [];
  if (profile === 'vegan') {
    notes.push('Nothing on the menu is labeled vegan, so quick fill packs lunch from home and skips milk.');
  }
  if (profile === 'halal') notes.push('Only some hot lunches are marked halal; other days fall back to a packed lunch.');
  if (nutAllergy) {
    notes.push("The menu doesn't list allergens. The email will ask staff to check every meal — the app can't.");
  }
  return notes.length ? notes.join(' ') : null;
}

/** A row on the page that opens the diet & quick-fill modal. */
export function DietPanel({
  diet,
  onChange,
  onFill,
  status,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  scope = 'week',
  trigger = 'row',
}: DietPanelProps) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const open = openProp ?? ownOpen;
  const setOpen = (next: boolean) => {
    setOwnOpen(next);
    onOpenChange?.(next);
  };
  const note = caveat(diet);

  const fill = (mode: FillMode) => {
    onFill(mode);
    setOpen(false);
  };

  return (
    <>
      {trigger === 'compact' ? (
        <ButtonBase
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Help me pick: ${summary(diet)}`}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 48, pl: 1, pr: 0.5, textAlign: 'left', borderRadius: '8px', maxWidth: '100%' }}
        >
          <Box aria-hidden sx={{ fontSize: 22, lineHeight: 1 }}>
            🥗
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              Diet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }} noWrap>
              {diet.profile === 'none' && !diet.nutAllergy ? 'Quick fill' : summary(diet)}
            </Typography>
          </Box>
          <ChevronRightRoundedIcon color="primary" fontSize="small" />
        </ButtonBase>
      ) : (
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          p: 1.5,
          minHeight: 64,
          textAlign: 'left',
          borderRadius: '8px',
          border: `2px solid ${CHEVERUS.yellow}`,
          bgcolor: CHEVERUS.yellowSoft,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '10px',
            bgcolor: 'primary.main',
            display: 'grid',
            placeItems: 'center',
            fontSize: 26,
            lineHeight: 1,
            transform: 'rotate(-8deg)',
          }}
        >
          🎲
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
            Help me pick!
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Roll the dice for {scope === 'day' ? 'today’s' : 'this week’s'} lunch · {summary(diet)}
          </Typography>
          {status && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', fontWeight: 700 }} aria-live="polite">
              {status}
            </Typography>
          )}
        </Box>
        <ChevronRightRoundedIcon color="primary" />
      </ButtonBase>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" aria-labelledby="diet-dialog-title">
        <DialogTitle id="diet-dialog-title" sx={{ pr: 7 }}>
          🎲 Help me pick
          <IconButton aria-label="Close" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            DIET (OPTIONAL)
          </Typography>
          <Box role="radiogroup" aria-label="Diet" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5, mb: 1.5 }}>
            {PROFILES.map((profile) => {
              const on = diet.profile === profile;
              return (
                <Chip
                  key={profile}
                  role="radio"
                  aria-checked={on}
                  label={DIET_PROFILE_LABELS[profile]}
                  color={on ? 'primary' : 'default'}
                  variant={on ? 'filled' : 'outlined'}
                  onClick={() => onChange({ profile })}
                />
              );
            })}
          </Box>

          <FormControlLabel
            control={<Switch checked={diet.nutAllergy} onChange={(e) => onChange({ nutAllergy: e.target.checked })} />}
            label="Nut allergy"
          />

          <Alert severity={note ? 'warning' : 'info'} sx={{ my: 1.5 }}>
            {note ?? 'The menu labels meals Vegetarian (V) and Halal (H) only. Quick fill uses those labels.'}
          </Alert>

          <Stack spacing={1}>
            <Button fullWidth size="large" variant="contained" startIcon={<CasinoRoundedIcon />} onClick={() => fill('surprise')}>
              Roll the dice
            </Button>
            <Button fullWidth size="large" variant="outlined" startIcon={<AutoFixHighRoundedIcon />} onClick={() => fill('best')}>
              {scope === 'day' ? 'Best match for this day' : 'Best match for empty days'}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {scope === 'day'
              ? 'Roll the dice picks a random lunch that fits your diet. Best match fills it only if you haven’t chosen.'
              : 'Roll the dice picks a random lunch for every day left this week. Best match fills only the days you haven’t picked.'}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
