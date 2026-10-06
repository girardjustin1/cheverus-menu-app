import { MENU_DAYS, type MenuDay } from './menu';

export interface MenuMonth {
  id: string;
  /** Shown in the app, e.g. "October 2026". */
  label: string;
  short: string;
  /** First and last weekday the menu covers (ISO). Placeholder months use the calendar month. */
  start: string;
  end: string;
  /** Empty until the school posts the menu. */
  days: MenuDay[];
  source?: string;
}

// To add a month: transcribe its PDF into a MenuDay[] (see menu.ts) and put it in `days`.
export const MENU_MONTHS: MenuMonth[] = [
  {
    id: '2026-10',
    // The PDF is titled September/October; it starts Mon Sep 28, so we call it October.
    label: 'October 2026',
    short: 'Oct',
    start: '2026-09-28',
    end: '2026-10-30',
    days: MENU_DAYS,
    source: 'menu/October Lunch 2026.pdf',
  },
  {
    id: '2026-11',
    label: 'November 2026',
    short: 'Nov',
    start: '2026-11-02',
    end: '2026-11-30',
    days: [],
  },
];

export const isPublished = (month: MenuMonth) => month.days.length > 0;

/** The month whose range contains `today`, else the next one, else the last one. */
export function defaultMonth(months: MenuMonth[], today: string): MenuMonth {
  return (
    months.find((m) => m.start <= today && today <= m.end) ??
    months.find((m) => m.start > today) ??
    months[months.length - 1]
  );
}

export const monthOf = (date: string, months: MenuMonth[] = MENU_MONTHS) =>
  months.find((m) => m.start <= date && date <= m.end);
