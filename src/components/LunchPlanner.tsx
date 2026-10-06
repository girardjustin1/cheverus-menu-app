import ForwardToInboxRoundedIcon from '@mui/icons-material/ForwardToInboxRounded';
import { Box, Button, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { MENU_DAYS, MENU_NOTES } from '../data/menu';
import { toISODate } from '../lib/dates';
import { buildEmail } from '../lib/email';
import { dayStatus, defaultWeek, emptyDayPlan, groupWeeks, type DayStatus, type PlanState } from '../lib/plan';
import { usePlan } from '../lib/usePlan';
import { IPHONE_17 } from '../theme/theme';
import { AppHeader } from './AppHeader';
import { DayPlanner, type WeekWideField } from './DayPlanner';
import { DayTabs } from './DayTabs';
import { EmailDraftCard } from './EmailDraftCard';
import { WeekSelector, type WeekProgress } from './WeekSelector';

export interface LunchPlannerProps {
  /** Fixture plan for stories; when omitted the plan loads from and saves to this browser. */
  initialPlan?: PlanState;
  /** ISO date used to pick the starting week. Defaults to today. */
  today?: string;
}

export function LunchPlanner({ initialPlan, today: todayProp }: LunchPlannerProps) {
  const weeks = useMemo(() => groupWeeks(MENU_DAYS), []);
  const [today] = useState(() => todayProp ?? toISODate(new Date()));
  const { plan, updateDay, updateDays, updateDetails } = usePlan(initialPlan);

  const [weekMonday, setWeekMonday] = useState(() => defaultWeek(weeks, today).monday);
  const week = weeks.find((w) => w.monday === weekMonday) ?? weeks[0];
  const firstSchoolDay = (w = week) => (w.days.find((d) => !d.noSchool) ?? w.days[0]).date;
  const [selectedDate, setSelectedDate] = useState(() => {
    const inWeek = week.days.find((d) => d.date === today && !d.noSchool);
    return inWeek?.date ?? firstSchoolDay();
  });
  const day = week.days.find((d) => d.date === selectedDate) ?? week.days[0];

  const statuses: Record<string, DayStatus> = {};
  for (const d of MENU_DAYS) statuses[d.date] = dayStatus(d, plan.days[d.date]);

  const progress: Record<string, WeekProgress> = {};
  for (const w of weeks) {
    const school = w.days.filter((d) => !d.noSchool);
    progress[w.monday] = { done: school.filter((d) => statuses[d.date] === 'done').length, total: school.length };
  }

  const draft = buildEmail(week, plan);

  const selectWeek = (monday: string) => {
    const next = weeks.find((w) => w.monday === monday)!;
    setWeekMonday(monday);
    setSelectedDate(firstSchoolDay(next));
  };

  const applyToWeek = (field: WeekWideField) => {
    const value = plan.days[day.date]?.[field];
    const dates = week.days.filter((d) => !d.noSchool).map((d) => d.date);
    updateDays(dates, { [field]: value });
  };

  return (
    <Box sx={{ maxWidth: IPHONE_17.width + 28, mx: 'auto', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.default', boxShadow: 1 }}>
        <WeekSelector weeks={weeks} selected={week.monday} onSelect={selectWeek} progress={progress} />
        <DayTabs days={week.days} selected={day.date} onSelect={setSelectedDate} statuses={statuses} />
      </Box>

      <Box component="main">
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 2, pt: 2, mb: -2 }}>
          Step 1 · Plan each day
        </Typography>
        <DayPlanner
          key={day.date}
          day={day}
          plan={plan.days[day.date] ?? emptyDayPlan()}
          onChange={(patch) => updateDay(day.date, patch)}
          onApplyToWeek={applyToWeek}
        />

        <Box sx={{ bgcolor: 'secondary.main', height: 4, mx: 2, borderRadius: 2 }} />

        <EmailDraftCard
          draft={draft}
          details={plan.details}
          onDetailsChange={updateDetails}
          plannedDays={progress[week.monday].done}
          schoolDays={progress[week.monday].total}
        />

        <Box component="footer" sx={{ px: 2, pb: 12, pt: 1 }}>
          {MENU_NOTES.map((note) => (
            <Typography key={note} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {note}
            </Typography>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          px: 2,
          pt: 1,
          pb: 'calc(env(safe-area-inset-bottom) + 12px)',
          background: 'linear-gradient(to top, rgba(251,250,244,1) 70%, rgba(251,250,244,0))',
        }}
      >
        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<ForwardToInboxRoundedIcon />}
          onClick={() => document.getElementById('email')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Draft email · {progress[week.monday].done}/{progress[week.monday].total} days ready
        </Button>
      </Box>
    </Box>
  );
}
