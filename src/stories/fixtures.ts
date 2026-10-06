import { MENU_DAYS } from '../data/menu';
import { defaultDietPrefs } from '../lib/diet';
import { buildEmail } from '../lib/email';
import { summarizeDays, type OrderRecord } from '../lib/history';
import { emptyPlan, groupWeeks, type ParentDetails, type PlanState, type Week } from '../lib/plan';

export const WEEKS = groupWeeks(MENU_DAYS);
export const WEEK_OF_OCT_5 = WEEKS.find((w) => w.monday === '2026-10-05')!;
export const WEEK_OF_OCT_12 = WEEKS.find((w) => w.monday === '2026-10-12')!;
export const dayOn = (date: string) => MENU_DAYS.find((d) => d.date === date)!;

/** Today's date when this prototype was built — pins stories to a stable week. */
export const STORY_TODAY = '2026-10-06';

export const DETAILS: ParentDetails = {
  childName: 'Sam',
  classroom: 'Grade 1',
  gender: '',
  teacherName: 'Ms. Smith',
  parentName: 'Jordan',
  to: 'name@example.com',
};

/** Week of Oct 5: Mon–Wed fully planned, Thu partly, Fri untouched. */
export const PARTLY_PLANNED: PlanState = {
  onboarded: true,
  details: DETAILS,
  diet: defaultDietPrefs(),
  days: {
    '2026-10-05': { lunch: 'hot', extras: [], drink: '1% Milk', edp: 'no', breakfast: true, note: '' },
    '2026-10-06': {
      lunch: 'hot',
      sides: ['Whole Grain Rice', 'Roasted Broccoli', 'Sweet Orange'],
      extras: ['Raisins'],
      drink: '1% Milk',
      edp: '5:00 PM',
      breakfast: true,
      note: '',
    },
    '2026-10-07': { lunch: 'sunbutter', extras: [], drink: 'Fat-Free Milk', edp: '5:30 PM', note: 'Grandma picking up' },
    '2026-10-08': { lunch: 'home', extras: [], note: '' },
  },
};

/** Week of Oct 5, every school day answered. */
export const FULL_WEEK: PlanState = {
  onboarded: true,
  details: DETAILS,
  diet: defaultDietPrefs(),
  days: {
    ...PARTLY_PLANNED.days,
    '2026-10-08': { lunch: 'home', extras: [], drink: 'none', edp: '4:30 PM', note: '' },
    '2026-10-09': { lunch: 'hot', extras: ['Fresh Fruit'], drink: '1% Milk', edp: 'no', note: '' },
  },
};

export const EMPTY = emptyPlan();

export const ACCOUNT = { fullName: 'Jordan Rivera', email: 'jordan@example.com' };

const WEEK_OF_SEP_28 = WEEKS.find((w) => w.monday === '2026-09-28')!;

const LAST_WEEK: PlanState = {
  details: DETAILS,
  diet: defaultDietPrefs(),
  days: Object.fromEntries(
    WEEK_OF_SEP_28.days.map((d) => [d.date, { lunch: 'hot' as const, extras: [], drink: '1% Milk' as const, edp: '5:00 PM' as const, note: '' }]),
  ),
};

/** Two past orders: last week's full plan and a single-day email this week. */
export const ORDERS: OrderRecord[] = [
  {
    id: 'order-2',
    weekMonday: '2026-10-05',
    date: '2026-10-07',
    childName: 'Sam',
    ...pick(buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED, { date: '2026-10-07' })),
    sentAt: '2026-10-06T19:42:00.000Z',
    method: 'mail',
    days: summarizeDays([dayOn('2026-10-07')], PARTLY_PLANNED),
  },
  {
    id: 'order-1',
    weekMonday: '2026-09-28',
    childName: 'Sam',
    ...pick(buildEmail(WEEK_OF_SEP_28, LAST_WEEK)),
    sentAt: '2026-09-27T23:10:00.000Z',
    method: 'copy',
    days: summarizeDays(WEEK_OF_SEP_28.days, LAST_WEEK),
    dayEmails: dayEmailsFor(WEEK_OF_SEP_28, LAST_WEEK),
  },
];

function pick({ subject, body }: { subject: string; body: string }) {
  return { subject, body };
}

/** Per-day emails for a weekly order (planned days only, from `from` onward). */
function dayEmailsFor(week: Week, plan: PlanState, from = '') {
  return week.days
    .filter((d) => !d.noSchool && d.date >= from && plan.days[d.date])
    .map((d) => ({ date: d.date, ...pick(buildEmail(week, plan, { date: d.date })) }));
}

/** A saved-but-unsent draft for the week of Oct 5, plus the sent orders. */
export const ORDERS_WITH_DRAFT: OrderRecord[] = [
  {
    id: 'draft-1',
    weekMonday: '2026-10-05',
    childName: 'Sam',
    ...pick(buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED)),
    sentAt: '2026-10-06T20:15:00.000Z',
    method: 'draft',
    days: summarizeDays(WEEK_OF_OCT_5.days, PARTLY_PLANNED),
    dayEmails: dayEmailsFor(WEEK_OF_OCT_5, PARTLY_PLANNED, '2026-10-06'),
  },
  ...ORDERS,
];

/** Empty plan for a parent who already finished sign-up (skips onboarding). */
export const ONBOARDED_EMPTY: PlanState = { ...emptyPlan(), onboarded: true };
