import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { isPublished, type MenuMonth } from '../data/months';
import { fmtMonthDay, fmtWeekdayShort, mondayOf, parseISODate, relativeDayLabel } from '../lib/dates';
import { defaultWeek, firstPlannableDay, groupWeeks, isPastDate, isPastWeek, type PlanMode } from '../lib/plan';
import { APP_MAX_WIDTH, CHEVERUS } from '../theme/theme';
import type { WeekProgress } from './WeekSelector';

export interface PlanSelection {
  mode: PlanMode;
  monthId: string;
  /** Monday of the chosen week; empty when the month has no menu yet. */
  weekMonday: string;
  /** Chosen day (single-day mode) or first school day of the week. */
  date: string;
}

export interface PlanSetupDialogProps {
  open: boolean;
  /** Current choices, used as the starting point. `mode` is undefined on first visit. */
  current: Omit<PlanSelection, 'mode'> & { mode?: PlanMode };
  months: MenuMonth[];
  today: string;
  progress?: Record<string, WeekProgress>;
  firstName?: string;
  onApply: (selection: PlanSelection) => void;
  onClose: () => void;
}

const segmentSx = {
  bgcolor: alpha(CHEVERUS.navy, 0.06),
  borderRadius: '10px',
  p: 0.5,
  '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '8px !important', fontWeight: 700, flexDirection: 'column', py: 1, lineHeight: 1.2 },
  '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
    bgcolor: CHEVERUS.navy,
    color: '#FFFFFF',
    boxShadow: 2,
  },
} as const;

function Label({ children }: { children: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.06em', display: 'block', mb: 1 }}>
      {children}
    </Typography>
  );
}

function OptionTile({ selected, disabled, onClick, children, label }: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        textAlign: 'left',
        px: 1.5,
        py: 1,
        minHeight: 52,
        borderRadius: '8px',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : alpha(CHEVERUS.navy, 0.12),
        bgcolor: selected ? CHEVERUS.yellowSoft : 'background.paper',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </ButtonBase>
  );
}

/** "Plan" modal: week or day, then month, week (and day). */
export function PlanSetupDialog({ open, current, months, today, progress = {}, firstName, onApply, onClose }: PlanSetupDialogProps) {
  const [mode, setMode] = useState<PlanMode>(current.mode ?? 'week');
  const [monthId, setMonthId] = useState(current.monthId);
  const [weekMonday, setWeekMonday] = useState(current.weekMonday);
  const [date, setDate] = useState(current.date);

  // Re-seed from the current plan each time the modal opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMode(current.mode ?? 'week');
      setMonthId(current.monthId);
      setWeekMonday(current.weekMonday);
      setDate(current.date);
    }
  }

  const month = months.find((m) => m.id === monthId) ?? months[0];
  const weeks = groupWeeks(month.days);
  const week = weeks.find((w) => w.monday === weekMonday);

  const pickMonth = (id: string) => {
    const next = months.find((m) => m.id === id)!;
    setMonthId(id);
    const nextWeeks = groupWeeks(next.days);
    const w = nextWeeks.length ? defaultWeek(nextWeeks, today) : undefined;
    setWeekMonday(w?.monday ?? '');
    setDate(w ? firstPlannableDay(w, today) : '');
  };

  const pickWeek = (monday: string) => {
    setWeekMonday(monday);
    const w = weeks.find((x) => x.monday === monday)!;
    const keep = w.days.find((d) => d.date === date && !d.noSchool && !isPastDate(d.date, today));
    setDate(keep?.date ?? firstPlannableDay(w, today));
  };

  const firstVisit = current.mode === undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby="plan-dialog-title"
      scroll="paper"
      // Full-height card the width of the app column (the whole screen on a phone).
      slotProps={{ paper: { sx: { maxWidth: APP_MAX_WIDTH, mx: 'auto', borderRadius: 0 } } }}
    >
      <DialogTitle id="plan-dialog-title" sx={{ pr: 7, pt: 'calc(env(safe-area-inset-top) + 16px)' }}>
        {firstVisit && firstName ? `Hi ${firstName}! ` : ''}What are we planning?
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 'calc(env(safe-area-inset-top) + 8px)' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Label>PLAN FOR</Label>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={mode}
          onChange={(_, next: PlanMode | null) => next && setMode(next)}
          aria-label="Plan for"
          sx={segmentSx}
        >
          <ToggleButton value="week">
            <span>🗓️ Weekly planner</span>
            <Typography component="span" variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
              Mon–Fri, one email
            </Typography>
          </ToggleButton>
          <ToggleButton value="day">
            <span>☀️ Just the day</span>
            <Typography component="span" variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
              Quick single day
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ mt: 3 }}>
          <Label>MONTH</Label>
          <Box role="radiogroup" aria-label="Month" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {months.map((m) => (
              <Chip
                key={m.id}
                role="radio"
                aria-checked={m.id === monthId}
                // Months without a posted menu (or already over) are greyed out.
                disabled={m.end < today || !isPublished(m)}
                label={m.label}
                color={m.id === monthId ? 'primary' : 'default'}
                variant={m.id === monthId ? 'filled' : 'outlined'}
                onClick={() => pickMonth(m.id)}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Label>WEEK</Label>
          {weeks.length === 0 ? (
            <Alert severity="info">The {month.label} menu hasn't been posted yet.</Alert>
          ) : (
            <Box role="radiogroup" aria-label="Week" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 1 }}>
              {weeks.map((w) => {
                const p = progress[w.monday];
                const past = isPastWeek(w, today);
                return (
                  <OptionTile
                    key={w.monday}
                    selected={w.monday === weekMonday}
                    disabled={past}
                    onClick={() => pickWeek(w.monday)}
                    label={`${w.monday === mondayOf(today) ? 'This week, ' : ''}Week of ${fmtMonthDay(w.monday)}${past ? ', past week' : ''}`}
                  >
                    {w.monday === mondayOf(today) && (
                      <Chip label="This week" size="small" color="secondary" sx={{ height: 20, fontSize: 11, mb: 0.5 }} />
                    )}
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                      Week of {fmtMonthDay(w.monday)}
                    </Typography>
                    {past ? (
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                        Past week
                      </Typography>
                    ) : (
                      p && (
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                          {p.done === p.total ? 'All set ✓' : `${p.done}/${p.total} planned`}
                        </Typography>
                      )
                    )}
                  </OptionTile>
                );
              })}
            </Box>
          )}
        </Box>

        {mode === 'day' && week && (
          <Box sx={{ mt: 3 }}>
            <Label>DAY</Label>
            <Box role="radiogroup" aria-label="Day" sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.75 }}>
              {week.days.map((d) => (
                <OptionTile
                  key={d.date}
                  selected={d.date === date}
                  disabled={d.noSchool || isPastDate(d.date, today)}
                  onClick={() => setDate(d.date)}
                  label={`${relativeDayLabel(d.date, today) ?? fmtWeekdayShort(d.date)} ${parseISODate(d.date).getDate()}${d.noSchool ? ', no school' : isPastDate(d.date, today) ? ', past' : ''}`}
                >
                  <Stack sx={{ alignItems: 'center', width: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {relativeDayLabel(d.date, today) ?? fmtWeekdayShort(d.date)}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                      {parseISODate(d.date).getDate()}
                    </Typography>
                  </Stack>
                </OptionTile>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pb: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={() => onApply({ mode, monthId, weekMonday, date })}
        >
          {mode === 'day' && week ? 'Plan this day' : weeks.length ? 'Plan this week' : 'Done'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
