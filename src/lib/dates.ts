/** Parse "YYYY-MM-DD" as a local calendar date (no timezone drift). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Monday of the week containing `iso`. */
export function mondayOf(iso: string): string {
  const date = parseISODate(iso);
  const offset = (date.getDay() + 6) % 7; // Mon=0 … Sun=6
  date.setDate(date.getDate() - offset);
  return toISODate(date);
}

export const fmtWeekday = (iso: string) =>
  parseISODate(iso).toLocaleDateString('en-US', { weekday: 'long' });

export const fmtWeekdayShort = (iso: string) =>
  parseISODate(iso).toLocaleDateString('en-US', { weekday: 'short' });

export const fmtMonthDay = (iso: string) =>
  parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const fmtLongDate = (iso: string) =>
  parseISODate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
