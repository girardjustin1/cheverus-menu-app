import { FRUIT_BAR, MENU_DAYS, OFFERED_DAILY, VEGGIE_BAR, type MenuDay } from '../data/menu';
import { fmtMonthDay, mondayOf, parseISODate } from './dates';
import { defaultDietPrefs, type DietPrefs } from './diet';

/** Plan a whole Mon–Fri week (one email) or a single day. */
export type PlanMode = 'week' | 'day';

/** Which lunch the child takes. 'hot' = the day's hot lunch; 'home' = packed from home. */
export type LunchChoice = 'hot' | 'sunbutter' | 'cheese-sandwich' | 'home';
export type DrinkChoice = '1% Milk' | 'Fat-Free Milk' | 'none';
/** 'no' = picked up at dismissal; otherwise the pickup time from Extended Day. */
export type EdpChoice = 'no' | '4:00 PM' | '4:30 PM' | '5:00 PM' | '5:30 PM';

export const EDP_PICKUP_TIMES: Exclude<EdpChoice, 'no'>[] = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];

export interface BreakfastPicks {
  grain?: string;
  fruit?: string;
  milk?: string;
}

export interface DayPlan {
  lunch?: LunchChoice;
  /** Sides to include. Undefined means "all of the day's sides". */
  sides?: string[];
  /** Extras from the fruit & veggie bar. */
  extras: string[];
  drink?: DrinkChoice;
  breakfast?: boolean;
  /** Picks for the Grab & Go breakfast (one of each); only used when `breakfast` is true. */
  breakfastPicks?: BreakfastPicks;
  edp?: EdpChoice;
  note: string;
}

/** Grades for the dropdown. Cheverus serves early childhood through grade 8. */
export const GRADES = ['Pre-K', 'Kindergarten', ...Array.from({ length: 8 }, (_, i) => `Grade ${i + 1}`)];

export type ChildGender = 'girl' | 'boy';
export const GENDER_LABELS: Record<ChildGender, string> = {
  girl: 'Girl',
  boy: 'Boy',
};

export interface ParentDetails {
  childName: string;
  /** Grade, picked from GRADES. */
  classroom: string;
  /** Empty until chosen. */
  gender: ChildGender | '';
  teacherName: string;
  parentName: string;
  to: string;
}

export interface PlanState {
  /** Set once the parent finishes (or skips) the sign-up steps. */
  onboarded?: boolean;
  details: ParentDetails;
  diet: DietPrefs;
  days: Record<string, DayPlan>;
}

export const emptyDayPlan = (): DayPlan => ({ extras: [], note: '' });

export const emptyPlan = (): PlanState => ({
  details: { childName: '', classroom: '', gender: '', teacherName: '', parentName: '', to: '' },
  diet: defaultDietPrefs(),
  days: {},
});

export interface Week {
  /** ISO date of the Monday. */
  monday: string;
  label: string;
  days: MenuDay[];
}

export function groupWeeks(days: MenuDay[] = MENU_DAYS): Week[] {
  const byMonday = new Map<string, MenuDay[]>();
  for (const day of days) {
    const key = mondayOf(day.date);
    byMonday.set(key, [...(byMonday.get(key) ?? []), day]);
  }
  return [...byMonday.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monday, weekDays]) => ({
      monday,
      label: `Week of ${fmtMonthDay(monday)}`,
      days: weekDays.sort((a, b) => a.date.localeCompare(b.date)),
    }));
}

/**
 * The week containing `today` (Mon–Fri), else the next upcoming week — so a weekend
 * opens on the coming week — else the last week.
 */
export function defaultWeek(weeks: Week[], today: string): Week {
  const current = isWeekday(today) && weeks.find((w) => w.monday === mondayOf(today));
  if (current) return current;
  const upcoming = weeks.find((w) => w.monday > today);
  return upcoming ?? weeks[weeks.length - 1];
}

export function lunchLabel(day: MenuDay, choice: LunchChoice): string {
  if (choice === 'hot') return day.entree;
  if (choice === 'home') return 'Packed lunch from home';
  return OFFERED_DAILY.find((o) => o.id === choice)?.name ?? choice;
}

/**
 * Pick from the fruit & veggie bar: one veggie and one fruit at most. Choosing another item
 * in the same group swaps it; choosing the current pick clears it.
 */
export function toggleBarPick(extras: string[], item: string): string[] {
  if (extras.includes(item)) return extras.filter((x) => x !== item);
  const group = VEGGIE_BAR.includes(item) ? VEGGIE_BAR : FRUIT_BAR;
  return [...extras.filter((x) => !group.includes(x)), item];
}

export const sidesFor = (day: MenuDay, plan: DayPlan) => plan.sides ?? day.sides;

export type DayStatus = 'no-school' | 'empty' | 'partial' | 'done';

/** A school day is done once lunch, drink and Extended Day are all answered. */
export function dayStatus(day: MenuDay, plan: DayPlan | undefined): DayStatus {
  if (day.noSchool) return 'no-school';
  if (!plan) return 'empty';
  const answered = [plan.lunch, plan.drink, plan.edp].filter((v) => v !== undefined).length;
  if (answered === 0) return 'empty';
  return answered === 3 ? 'done' : 'partial';
}

/** Days before today can't be planned any more. */
export const isPastDate = (date: string, today: string) => date < today;

/** School days from today onward — the only days you can still plan. */
export const plannableDays = (week: Week, today: string) =>
  week.days.filter((d) => !d.noSchool && !isPastDate(d.date, today));

export const isPastWeek = (week: Week, today: string) => week.days.every((d) => isPastDate(d.date, today));

/** Today if it's a school day in this week, else the next plannable day, else the first school day. */
export function firstPlannableDay(week: Week, today: string): string {
  return (plannableDays(week, today)[0] ?? week.days.find((d) => !d.noSchool) ?? week.days[0]).date;
}

export const isWeekday = (iso: string) => {
  const dow = parseISODate(iso).getDay();
  return dow >= 1 && dow <= 5;
};
