import { describe, expect, it } from 'vitest';
import { NOVEMBER_2026_DAYS } from '../data/menu-november-2026';
import { buildEmail } from './email';
import { emptyPlan, groupWeeks, isWeekday } from './plan';

const day = (date: string) => NOVEMBER_2026_DAYS.find((d) => d.date === date)!;

describe('November 2026 menu', () => {
  it('lists every weekday from Mon Nov 2 to Fri Dec 4, once each', () => {
    const dates = NOVEMBER_2026_DAYS.map((d) => d.date);
    expect(dates.every(isWeekday)).toBe(true);
    expect(new Set(dates).size).toBe(dates.length);
    expect(dates).toHaveLength(25);
    expect(dates[0]).toBe('2026-11-02');
    expect(dates.at(-1)).toBe('2026-12-04');
  });

  it('groups into five Mon–Fri weeks', () => {
    const weeks = groupWeeks(NOVEMBER_2026_DAYS);
    expect(weeks.map((w) => w.monday)).toEqual(['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30']);
    expect(weeks.every((w) => w.days.length === 5)).toBe(true);
  });

  it('marks Veterans Day and the Thanksgiving recess as no school, with the reason', () => {
    expect(day('2026-11-11')).toMatchObject({ noSchool: true, noSchoolReason: 'Veterans Day' });
    for (const d of ['2026-11-25', '2026-11-26', '2026-11-27']) {
      expect(day(d)).toMatchObject({ noSchool: true, noSchoolReason: 'Thanksgiving Recess' });
    }
    expect(NOVEMBER_2026_DAYS.filter((d) => d.noSchool)).toHaveLength(4);
  });

  it('uses the handwritten change on Tue Nov 3', () => {
    expect(day('2026-11-03')).toMatchObject({ entree: 'Chicken Nuggets', sides: ['Tots'] });
  });

  it('carries the printed diet labels', () => {
    expect(day('2026-11-02').tags).toEqual(['V']); // Cheese Lasagna
    expect(day('2026-11-05').tags).toEqual(['H']); // Juicy Cheeseburger
    expect(day('2026-11-19').tags).toEqual(['K']); // All Beef Hot Dog
    expect(day('2026-11-24').tags).toBeUndefined(); // Beef nachos — not vegetarian
  });

  it('says why there is no school in the email', () => {
    const [, veterans] = groupWeeks(NOVEMBER_2026_DAYS);
    const { body } = buildEmail(veterans, emptyPlan());
    expect(body).toContain('Wednesday, November 11\n• No school (Veterans Day)');
  });
});
