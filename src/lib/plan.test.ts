import { describe, expect, it } from 'vitest';
import { MENU_DAYS } from '../data/menu';
import { FULL_WEEK, PARTLY_PLANNED, WEEK_OF_OCT_12, WEEK_OF_OCT_5 } from '../stories/fixtures';
import { mondayOf } from './dates';
import { buildEmail, mailtoHref } from './email';
import { dayStatus, defaultWeek, groupWeeks, isWeekday, toggleBarPick } from './plan';

describe('menu data', () => {
  it('only lists weekdays, each once', () => {
    const dates = MENU_DAYS.map((d) => d.date);
    expect(dates.every(isWeekday)).toBe(true);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('matches the printed calendar: Oct 1, 2026 is a Thursday', () => {
    expect(mondayOf('2026-10-01')).toBe('2026-09-28');
  });

  it('groups into five Mon–Fri weeks from Sep 28 to Oct 30', () => {
    const weeks = groupWeeks();
    expect(weeks.map((w) => w.monday)).toEqual([
      '2026-09-28',
      '2026-10-05',
      '2026-10-12',
      '2026-10-19',
      '2026-10-26',
    ]);
    expect(weeks.every((w) => w.days.length === 5)).toBe(true);
  });

  it('marks Oct 12 as no school, as printed', () => {
    expect(MENU_DAYS.find((d) => d.date === '2026-10-12')?.noSchool).toBe(true);
  });
});

describe('defaultWeek', () => {
  const weeks = groupWeeks();
  it('picks the week containing today', () => {
    expect(defaultWeek(weeks, '2026-10-08').monday).toBe('2026-10-05');
  });
  it('picks the next week on a weekend', () => {
    expect(defaultWeek(weeks, '2026-10-10').monday).toBe('2026-10-12');
  });
  it('falls back to the last week after the menu ends', () => {
    expect(defaultWeek(weeks, '2026-11-15').monday).toBe('2026-10-26');
  });
});

describe('dayStatus', () => {
  const tue = WEEK_OF_OCT_5.days[1];
  it('is done once lunch, drink and EDP are answered', () => {
    expect(dayStatus(tue, PARTLY_PLANNED.days[tue.date])).toBe('done');
    expect(dayStatus(tue, { lunch: 'hot', extras: [], note: '' })).toBe('partial');
    expect(dayStatus(tue, undefined)).toBe('empty');
    expect(dayStatus(WEEK_OF_OCT_12.days[0], undefined)).toBe('no-school');
  });
});

describe('buildEmail', () => {
  it('writes one section per planned day with every choice', () => {
    const { subject, body } = buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED);
    expect(subject).toBe('Sam — lunch & Extended Day plan, week of Oct 5');
    expect(body.startsWith('Hi Ms. Smith and the Cheverus team,')).toBe(true);
    expect(body).toContain("Here is Sam (Grade 1)'s lunch and Extended Day plan for the week of Monday, Oct 5:");
    expect(body).toContain('Tuesday, October 6\n• Breakfast: Grab & Go breakfast, please');
    expect(body).toContain('• Lunch: Asian Chicken ("General Tso" hot lunch)');
    expect(body).toContain('• Sides: Whole Grain Rice, Roasted Broccoli, Sweet Orange');
    expect(body).toContain('• Please skip: Red Pepper Strips');
    expect(body).toContain('• From the fruit & veggie bar: Raisins');
    expect(body).toContain('• Extended Day: Yes — pickup by 5:00 PM');
    expect(body).toContain('• Lunch: Jammie Sunbutter & Jelly Sandwich');
    expect(body).toContain('• Note: Grandma picking up');
    expect(body).toMatch(/Best,\nJordan$/);
  });

  it('leaves out untouched days and lists packed lunches without sides', () => {
    const { body } = buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED);
    expect(body).not.toContain('Friday, October 9');
    expect(body).toContain('Thursday, October 8\n• Lunch: Packed lunch from home');
    expect(body).not.toMatch(/Thursday, October 8\n• Lunch: Packed lunch from home\n• Sides/);
  });

  it('greets the whole team when no teacher is given', () => {
    const { body } = buildEmail(WEEK_OF_OCT_5, { ...PARTLY_PLANNED, details: { ...PARTLY_PLANNED.details, teacherName: ' ' } });
    expect(body.startsWith('Hi Cheverus team,')).toBe(true);
  });

  it('notes the holiday and handles an empty plan', () => {
    const { body } = buildEmail(WEEK_OF_OCT_12, { ...FULL_WEEK, days: {} });
    expect(body).toContain('Monday, October 12\n• No school');
  });

  it('builds a mailto link with %20 spaces', () => {
    const href = mailtoHref(buildEmail(WEEK_OF_OCT_5, FULL_WEEK));
    expect(href.startsWith('mailto:name%40example.com?subject=Sam%20')).toBe(true);
    expect(href).not.toContain('+');
  });
});

describe('toggleBarPick — one veggie and one fruit', () => {
  it('keeps one of each, swaps within a group, and clears on re-tap', () => {
    let extras: string[] = [];
    extras = toggleBarPick(extras, 'Carrots');
    extras = toggleBarPick(extras, 'Raisins');
    expect(extras).toEqual(['Carrots', 'Raisins']);
    extras = toggleBarPick(extras, 'Cucumbers');
    expect(extras).toEqual(['Raisins', 'Cucumbers']);
    extras = toggleBarPick(extras, 'Fruit Cups');
    expect(extras).toEqual(['Cucumbers', 'Fruit Cups']);
    expect(toggleBarPick(extras, 'Fruit Cups')).toEqual(['Cucumbers']);
  });
});
