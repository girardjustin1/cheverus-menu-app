import { MENU_DAYS, OFFERED_DAILY, type MenuDay } from '../data/menu';
import { fmtMonthDay, mondayOf, parseISODate } from './dates';

/** Which lunch the child takes. 'hot' = the day's hot lunch; 'home' = packed from home. */
export type LunchChoice = 'hot' | 'sunbutter' | 'cheese-sandwich' | 'home';
export type DrinkChoice = '1% Milk' | 'Fat-Free Milk' | 'none';
/** 'no' = picked up at dismissal; otherwise the pickup time from Extended Day. */
export type EdpChoice = 'no' | '4:00 PM' | '4:30 PM' | '5:00 PM' | '5:30 PM';

export const EDP_PICKUP_TIMES: Exclude<EdpChoice, 'no'>[] = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];

export interface DayPlan {
  lunch?: LunchChoice;
  /** Sides to include. Undefined means "all of the day's sides". */
  sides?: string[];
  /** Extras from the fruit & veggie bar. */
  extras: string[];
  drink?: DrinkChoice;
  breakfast?: boolean;
  edp?: EdpChoice;
  note: string;
}

export interface ParentDetails {
  childName: string;
  classroom: string;
  parentName: string;
  to: string;
}

export interface PlanState {
  details: ParentDetails;
  days: Record<string, DayPlan>;
}

export const emptyDayPlan = (): DayPlan => ({ extras: [], note: '' });

export const emptyPlan = (): PlanState => ({
  details: { childName: '', classroom: '', parentName: '', to: '' },
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

export const isWeekday = (iso: string) => {
  const dow = parseISODate(iso).getDay();
  return dow >= 1 && dow <= 5;
};
