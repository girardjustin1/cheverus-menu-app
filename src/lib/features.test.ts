import { describe, expect, it } from 'vitest';
import { MENU_MONTHS, defaultMonth, isPublished, monthOf } from '../data/months';
import { ORDERS, PARTLY_PLANNED, WEEK_OF_OCT_5, dayOn } from '../stories/fixtures';
import { validateAccount, initials } from './account';
import { comboFor, fittingLunches, lunchFit, pickLunch } from './diet';
import { buildEmail } from './email';
import { addOrder } from './history';

const VEG = { profile: 'vegetarian', nutAllergy: false } as const;
const VEGAN = { profile: 'vegan', nutAllergy: false } as const;
const HALAL = { profile: 'halal', nutAllergy: false } as const;

describe('diet fit — only from printed labels', () => {
  it('vegetarian accepts V-marked meals only', () => {
    expect(lunchFit(dayOn('2026-10-07'), 'hot', VEG).fit).toBe('fits'); // Mac & Cheese (V)
    expect(lunchFit(dayOn('2026-10-06'), 'hot', VEG).fit).toBe('no'); // Asian Chicken
    expect(lunchFit(dayOn('2026-10-06'), 'sunbutter', VEG).fit).toBe('fits');
  });

  it('vegan never auto-picks a school lunch, since none are labeled vegan', () => {
    for (const date of ['2026-10-02', '2026-10-07', '2026-10-13']) {
      expect(fittingLunches(dayOn(date), VEGAN)).toEqual([]);
      expect(pickLunch(dayOn(date), VEGAN, 'best')).toBe('home');
    }
    expect(lunchFit(dayOn('2026-10-07'), 'sunbutter', VEGAN).fit).toBe('ask');
  });

  it('halal takes H-marked hot lunches and asks about vegetarian ones', () => {
    expect(pickLunch(dayOn('2026-10-01'), HALAL, 'best')).toBe('hot'); // Cheeseburger (H)
    expect(lunchFit(dayOn('2026-10-01'), 'sunbutter', HALAL).fit).toBe('ask');
    expect(pickLunch(dayOn('2026-10-05'), HALAL, 'best')).toBe('home'); // Meatball Sub, unmarked
  });

  it('best prefers the hot lunch; surprise picks among fitting options', () => {
    expect(pickLunch(dayOn('2026-10-07'), VEG, 'best')).toBe('hot');
    expect(pickLunch(dayOn('2026-10-06'), VEG, 'best')).toBe('sunbutter');
    expect(pickLunch(dayOn('2026-10-07'), VEG, 'surprise', () => 0.99)).toBe('cheese-sandwich');
    expect(pickLunch(dayOn('2026-10-07'), VEG, 'surprise', () => 0)).toBe('hot');
  });

  it('vegetarian combos drop the sausage side; vegan combos skip milk', () => {
    expect(comboFor(dayOn('2026-10-21'), VEG, 'best').sides).not.toContain('Breakfast Sausage');
    expect(comboFor(dayOn('2026-10-07'), VEGAN, 'best')).toMatchObject({ lunch: 'home', drink: 'none' });
  });
});

describe('email with diet and single-day scope', () => {
  it('adds diet and allergy notes, and flags unlabeled picks', () => {
    const plan = { ...PARTLY_PLANNED, diet: { profile: 'vegan' as const, nutAllergy: true } };
    const { body } = buildEmail(WEEK_OF_OCT_5, plan);
    expect(body).toContain('Diet: Sam eats vegan.');
    expect(body).toContain("Allergy: Sam has a nut allergy. The posted menu doesn't list allergens");
    // Wed Oct 7 is the sunbutter sandwich — not labeled vegan.
    expect(body).toContain('• Lunch: Jammie Sunbutter & Jelly Sandwich\n• Please confirm this works for a vegan diet');
  });

  it('covers one day when scoped to a date', () => {
    const { subject, body } = buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED, { date: '2026-10-06' });
    expect(subject).toBe('Sam — lunch & Extended Day plan, Tuesday, October 6');
    expect(body).toContain('plan for Tuesday, October 6:');
    expect(body).not.toContain('Monday, October 5');
  });

  it('signs with the account name when the plan has none', () => {
    const plan = { ...PARTLY_PLANNED, details: { ...PARTLY_PLANNED.details, parentName: '' } };
    expect(buildEmail(WEEK_OF_OCT_5, plan, { fallbackSignOff: 'Jordan Rivera' }).body).toMatch(/Best,\nJordan Rivera$/);
  });
});

describe('order history', () => {
  it('logs a resend of the identical email once, newest first', () => {
    const again = { ...ORDERS[1], id: 'new', sentAt: '2026-10-08T00:00:00.000Z' };
    const next = addOrder(ORDERS, again);
    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({ id: 'order-1', sentAt: again.sentAt });
  });

  it('keeps a changed email for the same week as a new order', () => {
    const changed = { ...ORDERS[1], id: 'new', body: ORDERS[1].body + '\nP.S.' };
    expect(addOrder(ORDERS, changed)).toHaveLength(3);
  });
});

describe('months', () => {
  it('has October published and November waiting for its menu', () => {
    expect(MENU_MONTHS.map((m) => [m.short, isPublished(m)])).toEqual([
      ['Oct', true],
      ['Nov', false],
    ]);
  });

  it('opens on the month containing today', () => {
    expect(defaultMonth(MENU_MONTHS, '2026-10-06').id).toBe('2026-10');
    expect(defaultMonth(MENU_MONTHS, '2026-11-09').id).toBe('2026-11');
    expect(monthOf('2026-09-30')?.short).toBe('Oct');
  });
});

describe('account', () => {
  it('needs a first and last name and a valid email', () => {
    expect(validateAccount({ fullName: 'Jordan', email: 'x' })).toEqual({
      fullName: 'Enter your first and last name',
      email: 'Enter a valid email',
    });
    expect(validateAccount({ fullName: 'Jordan Rivera', email: 'jordan@example.com' })).toEqual({});
    expect(initials('Jordan Rivera')).toBe('JR');
  });
});

describe('breakfast picks', () => {
  it('lists the chosen grain, fruit and milk in the email', () => {
    const plan = {
      ...PARTLY_PLANNED,
      days: {
        ...PARTLY_PLANNED.days,
        '2026-10-05': {
          ...PARTLY_PLANNED.days['2026-10-05'],
          breakfastPicks: { grain: 'Muffin', fruit: '100% Fruit Juice', milk: '1% Milk' },
        },
      },
    };
    expect(buildEmail(WEEK_OF_OCT_5, plan).body).toContain('• Breakfast: Grab & Go — Muffin, 100% Fruit Juice, 1% Milk');
  });
});

describe('drafts', () => {
  const draft = { ...ORDERS[1], id: 'd1', method: 'draft' as const, sentAt: '2026-10-01T00:00:00.000Z' };

  it('keeps one draft per week: saving again replaces it', () => {
    const once = addOrder([], draft);
    const twice = addOrder(once, { ...draft, id: 'd2', body: 'edited', sentAt: '2026-10-02T00:00:00.000Z' });
    expect(twice).toHaveLength(1);
    expect(twice[0]).toMatchObject({ id: 'd1', body: 'edited' });
  });

  it('sending clears that week’s draft', () => {
    const withDraft = addOrder(ORDERS, draft);
    expect(withDraft).toHaveLength(3);
    const sent = addOrder(withDraft, { ...ORDERS[1], id: 'new', body: 'final', method: 'copy' });
    expect(sent.some((o) => o.method === 'draft')).toBe(false);
  });
});

describe('present-only planning', () => {
  it('labels today and tomorrow', async () => {
    const { relativeDayLabel } = await import('./dates');
    expect(relativeDayLabel('2026-10-06', '2026-10-06')).toBe('Today');
    expect(relativeDayLabel('2026-10-07', '2026-10-06')).toBe('Tomorrow');
    expect(relativeDayLabel('2026-10-05', '2026-10-06')).toBeUndefined();
  });

  it('only offers today onward', async () => {
    const { firstPlannableDay, isPastWeek, plannableDays, groupWeeks } = await import('./plan');
    const [sep28, oct5, oct12] = groupWeeks();
    expect(plannableDays(oct5, '2026-10-06').map((d) => d.date)).toEqual(['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']);
    expect(isPastWeek(sep28, '2026-10-06')).toBe(true);
    expect(isPastWeek(oct5, '2026-10-06')).toBe(false);
    expect(firstPlannableDay(oct12, '2026-10-06')).toBe('2026-10-13'); // Oct 12 is no school
  });

  it('weekly email skips days before today', () => {
    const { body } = buildEmail(WEEK_OF_OCT_5, PARTLY_PLANNED, { fromDate: '2026-10-06' });
    expect(body).not.toContain('Monday, October 5');
    expect(body).toContain('Tuesday, October 6');
  });
});
