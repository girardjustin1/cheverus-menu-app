import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Alert, Box, Button, Collapse, Snackbar, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MENU_NOTES } from '../data/menu';
import { defaultMonth, isPublished, MENU_MONTHS, monthOf, type MenuMonth } from '../data/months';
import { fmtWeekday, mondayOf, toISODate } from '../lib/dates';
import { comboFor, type FillMode } from '../lib/diet';
import { buildEmail } from '../lib/email';
import { summarizeDays, type LogOrderInput, type OrderMethod } from '../lib/history';
import {
  dayStatus,
  defaultWeek,
  emptyDayPlan,
  firstPlannableDay,
  groupWeeks,
  isPastDate,
  isPastWeek,
  plannableDays,
  type DayStatus,
  type PlanMode,
  type PlanState,
} from '../lib/plan';
import { DEFAULT_PATH, useRouter } from '../lib/router';
import { EnsureRouter } from '../lib/RouterProvider';
import { usePlan } from '../lib/usePlan';
import { useScrollCollapse } from '../lib/useScrollCollapse';
import { ComingSoonMonth } from './ComingSoonMonth';
import { DayPlanner, type WeekWideField } from './DayPlanner';
import { DayTabs } from './DayTabs';
import { DietPanel } from './DietPanel';
import { EmailDraftCard } from './EmailDraftCard';
import { PlanSetupDialog, type PlanSelection } from './PlanSetupDialog';
import { WeekSelector, type WeekProgress } from './WeekSelector';

export interface LunchPlannerProps {
  /** localStorage key for the plan; `null` keeps it in memory (stories). */
  storageKey?: string | null;
  /** Fixture plan for stories. */
  initialPlan?: PlanState;
  /** ISO date used to pick the starting month and week. Defaults to today. */
  today?: string;
  /** Skip the first-visit Plan modal, e.g. in stories. */
  initialMode?: PlanMode;
  /** Starting month; defaults to the month containing today. */
  initialMonthId?: string;
  months?: MenuMonth[];
  firstName?: string;
  /** Used to sign the email when the plan has no sign-off name. */
  signOffName?: string;
  /** Called when an email is sent or saved as a draft — the shell logs it to Past orders. */
  onOrderSent?: (order: LogOrderInput) => void;
  /** Shared plan state from the app shell; when omitted the planner keeps its own. */
  planApi?: ReturnType<typeof usePlan>;
  onEditDetails?: () => void;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The planner. State lives in the route (`#/plan?mode=&month=&week=&day=&modal=`), so every view is a deep link. */
export function LunchPlanner(props: LunchPlannerProps) {
  const initial = new URLSearchParams();
  if (props.initialMode) initial.set('mode', props.initialMode);
  if (props.initialMonthId) initial.set('month', props.initialMonthId);
  const query = initial.toString();
  return (
    <EnsureRouter initial={`#/plan${query ? `?${query}` : ''}`}>
      <LunchPlannerInner {...props} />
    </EnsureRouter>
  );
}

function LunchPlannerInner({
  storageKey = null,
  initialPlan,
  today: todayProp,
  months = MENU_MONTHS,
  firstName,
  signOffName,
  onOrderSent,
  planApi,
  onEditDetails,
}: LunchPlannerProps) {
  const [today] = useState(() => todayProp ?? toISODate(new Date()));
  const ownPlan = usePlan(planApi ? null : storageKey, initialPlan);
  const { plan, updateDay, updateDays, patchDays, updateDetails, updateDiet } = planApi ?? ownPlan;
  const [fillStatus, setFillStatus] = useState<string>();
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  // Scrolled down: fold the week pills away and keep only the day tiles pinned.
  const weeksCollapsed = useScrollCollapse();

  // --- Resolve the route into a valid, present-day selection. ---
  const { route, navigate } = useRouter();
  const active = route.path === DEFAULT_PATH;
  const p = route.params;
  const mode: PlanMode | undefined = p.mode === 'week' || p.mode === 'day' ? p.mode : undefined;
  const weekKey = p.week || (p.day ? mondayOf(p.day) : undefined);
  const month =
    months.find((m) => m.id === p.month) ??
    (weekKey ? monthOf(weekKey, months) : undefined) ??
    defaultMonth(months, today);
  const weeks = useMemo(() => groupWeeks(month.days), [month]);
  const week =
    weeks.find((w) => w.monday === weekKey && !isPastWeek(w, today)) ?? (weeks.length ? defaultWeek(weeks, today) : undefined);
  const selectedDate =
    week?.days.find((d) => d.date === p.day && !isPastDate(d.date, today))?.date ?? (week ? firstPlannableDay(week, today) : '');

  // Keep the URL canonical (fills in defaults, drops past or unknown dates) so it's always shareable.
  useEffect(() => {
    if (!active || !mode) return;
    const want = { month: month.id, week: week?.monday, day: week ? selectedDate : undefined };
    if (p.month !== want.month || p.week !== want.week || p.day !== want.day) navigate({ params: want, replace: true });
  }, [active, mode, month.id, week, selectedDate, p.month, p.week, p.day, navigate]);

  const statuses: Record<string, DayStatus> = {};
  for (const d of month.days) statuses[d.date] = dayStatus(d, plan.days[d.date]);
  const progress: Record<string, WeekProgress> = {};
  // Progress counts only days that can still be planned (today onward).
  for (const w of weeks) {
    const open = plannableDays(w, today);
    progress[w.monday] = { done: open.filter((d) => statuses[d.date] === 'done').length, total: open.length };
  }

  // The Plan modal opens on first visit (no mode yet) or via `modal=plan` (header button).
  const setupOpen = active && (mode === undefined || p.modal === 'plan');
  const dietOpen = active && p.modal === 'diet';
  // Dismissing on first visit falls back to the weekly planner.
  const closeSetup = () => navigate({ params: { modal: undefined, mode: mode ?? 'week' }, replace: true });
  const applySetup = (s: PlanSelection) => {
    setFillStatus(undefined);
    navigate({
      params: { mode: s.mode, month: s.monthId, week: s.weekMonday || undefined, day: s.date || undefined, modal: undefined },
      replace: true,
    });
    window.scrollTo({ top: 0 });
  };

  const setupDialog = (
    <PlanSetupDialog
      open={setupOpen}
      current={{ mode, monthId: month.id, weekMonday: week?.monday ?? '', date: selectedDate }}
      months={months}
      today={today}
      progress={progress}
      firstName={firstName}
      onApply={applySetup}
      onClose={closeSetup}
    />
  );

  if (!isPublished(month) || !week) {
    return (
      <>
        <ComingSoonMonth month={month} />
        {setupDialog}
      </>
    );
  }

  const day = week.days.find((d) => d.date === selectedDate) ?? week.days[0];
  const isDay = mode === 'day';
  const weekProgress = progress[week.monday];
  const draft = buildEmail(week, plan, { date: isDay ? day.date : undefined, fromDate: today, fallbackSignOff: signOffName });

  // Switching day or week starts the new day from the top of the page.
  const toTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

  const selectDay = (date: string) => {
    navigate({ params: { day: date }, replace: true });
    toTop();
  };

  const selectWeek = (monday: string) => {
    const next = weeks.find((w) => w.monday === monday)!;
    navigate({ params: { week: monday, day: firstPlannableDay(next, today) }, replace: true });
    setFillStatus(undefined);
    toTop();
  };

  const applyToWeek = (field: WeekWideField) => {
    const value = plan.days[day.date]?.[field];
    const dates = plannableDays(week, today).map((d) => d.date);
    updateDays(dates, { [field]: value });
  };

  const fill = (fillMode: FillMode) => {
    const school = isDay ? plannableDays(week, today).filter((d) => d.date === day.date) : plannableDays(week, today);
    const targets = fillMode === 'best' ? school.filter((d) => !plan.days[d.date]?.lunch) : school;
    if (targets.length === 0) {
      setFillStatus(isDay ? 'This day already has a lunch — tap Roll the dice to re-roll it.' : 'Every day already has a lunch — tap Roll the dice to re-roll.');
      return;
    }
    patchDays(Object.fromEntries(targets.map((d) => [d.date, comboFor(d, plan.diet, fillMode)])));
    const n = targets.length;
    setFillStatus(`🎲 ${fillMode === 'best' ? 'Filled' : 'Rolled'} lunch for ${n} ${n === 1 ? 'day' : 'days'}. Drink and Extended Day are still up to you.`);
  };

  const dayStatusText = day.noSchool
    ? 'No school this day — pick another day.'
    : statuses[day.date] === 'done'
      ? `${fmtWeekday(day.date)} is ready to send.`
      : `Pick lunch, a drink and Extended Day to finish ${fmtWeekday(day.date)}.`;

  const logOrder = (method: OrderMethod) =>
    onOrderSent?.({
      weekMonday: week.monday,
      date: isDay ? day.date : undefined,
      draft,
      childName: plan.details.childName.trim(),
      days: summarizeDays(isDay ? [day] : plannableDays(week, today), plan),
      method,
      // A weekly email also keeps one email per planned day, so Past orders → Daily can send days alone.
      dayEmails: isDay
        ? undefined
        : plannableDays(week, today)
            .filter((d) => statuses[d.date] !== 'empty')
            .map((d) => {
              const { subject, body } = buildEmail(week, plan, { date: d.date, fallbackSignOff: signOffName });
              return { date: d.date, subject, body };
            }),
    });

  const copyEmail = async () => {
    const ok = await copyText(draft.body);
    if (ok) logOrder('copy');
    setToast(
      ok
        ? { text: onOrderSent ? 'Email copied · saved to Past orders' : 'Email copied', ok }
        : { text: 'Copy failed — scroll down and long-press the email to copy', ok },
    );
  };

  const saveDraft = () => {
    logOrder('draft');
    setToast({ text: onOrderSent ? 'Draft saved to Past orders' : 'Draft saved', ok: true });
  };

  return (
    <>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.default', boxShadow: 1 }}>
        <Collapse in={!weeksCollapsed} timeout={200}>
          <WeekSelector weeks={weeks} selected={week.monday} onSelect={selectWeek} progress={isDay ? undefined : progress} today={today} />
        </Collapse>
        <DayTabs days={week.days} selected={day.date} onSelect={selectDay} statuses={statuses} today={today} />
      </Box>

      <Box component="main">
        <Box sx={{ px: 2, pt: 2 }}>
          <DietPanel
            diet={plan.diet}
            onChange={updateDiet}
            onFill={fill}
            scope={isDay ? 'day' : 'week'}
            status={fillStatus}
            open={dietOpen}
            onOpenChange={(open) => navigate({ params: { modal: open ? 'diet' : undefined }, replace: !open })}
          />
        </Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 2, pt: 2, mb: -2 }}>
          {isDay ? 'Step 1 · Plan the day' : 'Step 1 · Plan each day'}
        </Typography>
        <DayPlanner
          key={day.date}
          day={day}
          diet={plan.diet}
          plan={plan.days[day.date] ?? emptyDayPlan()}
          onChange={(patch) => updateDay(day.date, patch)}
          onApplyToWeek={isDay ? undefined : applyToWeek}
        />

        <Box sx={{ bgcolor: 'secondary.main', height: 4, mx: 2, borderRadius: 2 }} />

        <EmailDraftCard
          draft={draft}
          details={plan.details}
          onDetailsChange={updateDetails}
          plannedDays={weekProgress.done}
          schoolDays={weekProgress.total}
          statusText={isDay ? dayStatusText : undefined}
          onSent={onOrderSent ? logOrder : undefined}
          onEditDetails={onEditDetails}
        />

        <Box component="footer" sx={{ px: 2, pb: 4, pt: 1 }}>
          {MENU_NOTES.map((note) => (
            <Typography key={note} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {note}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Fixed actions. */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          display: 'flex',
          gap: 1,
          px: 2,
          pt: 1.5,
          pb: 'calc(env(safe-area-inset-bottom) + 12px)',
          background: 'linear-gradient(to top, rgba(251,250,244,1) 75%, rgba(251,250,244,0))',
        }}
      >
        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<SaveOutlinedIcon />}
          onClick={saveDraft}
          sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
        >
          Save draft
        </Button>
        <Button fullWidth size="large" variant="contained" startIcon={<ContentCopyRoundedIcon />} onClick={copyEmail}>
          Copy email
        </Button>
      </Box>

      <Snackbar
        open={toast !== null}
        autoHideDuration={2400}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast?.ok ? 'success' : 'warning'} variant="filled" sx={{ width: '100%' }}>
          {toast?.text}
        </Alert>
      </Snackbar>

      {setupDialog}
    </>
  );
}
