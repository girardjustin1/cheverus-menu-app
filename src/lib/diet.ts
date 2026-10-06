import { OFFERED_DAILY, type MenuDay } from '../data/menu';
import type { DayPlan, LunchChoice } from './plan';

export type DietProfile = 'none' | 'vegetarian' | 'vegan' | 'halal';

export interface DietPrefs {
  profile: DietProfile;
  nutAllergy: boolean;
}

export const DIET_PROFILE_LABELS: Record<DietProfile, string> = {
  none: 'No preference',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
};

export const defaultDietPrefs = (): DietPrefs => ({ profile: 'none', nutAllergy: false });

/**
 * How well a lunch matches the diet, judged only from the printed menu labels.
 * 'fits' = labeled for it; 'ask' = might work but isn't labeled; 'no' = labeled otherwise or unlabeled.
 */
export type Fit = 'fits' | 'ask' | 'no';

export interface FitResult {
  fit: Fit;
  reason: string;
}

/** Sides that are plainly meat. Other sides carry no labels on the menu. */
const MEAT_SIDES = new Set(['Breakfast Sausage']);

function tagsFor(day: MenuDay, choice: LunchChoice) {
  if (choice === 'hot') return day.tags ?? [];
  return OFFERED_DAILY.find((o) => o.id === choice)?.tags ?? [];
}

export function lunchFit(day: MenuDay, choice: LunchChoice, prefs: DietPrefs): FitResult {
  if (choice === 'home') return { fit: 'fits', reason: 'You control what goes in' };
  const tags = tagsFor(day, choice);
  switch (prefs.profile) {
    case 'none':
      return { fit: 'fits', reason: '' };
    case 'vegetarian':
      return tags.includes('V')
        ? { fit: 'fits', reason: 'Marked vegetarian' }
        : { fit: 'no', reason: 'Not marked vegetarian' };
    case 'halal':
      if (tags.includes('H')) return { fit: 'fits', reason: 'Marked halal' };
      if (tags.includes('V')) return { fit: 'ask', reason: 'Vegetarian, not marked halal — ask staff' };
      return { fit: 'no', reason: 'Not marked halal' };
    case 'vegan':
      if (choice === 'sunbutter') return { fit: 'ask', reason: 'Not labeled vegan — ask staff about the bread' };
      return { fit: 'no', reason: 'Menu has no vegan-labeled meals' };
  }
}

const SCHOOL_LUNCHES: LunchChoice[] = ['hot', ...OFFERED_DAILY.map((o) => o.id as LunchChoice)];

/** School lunches labeled for this diet. Never includes 'ask' options — those need a human. */
export function fittingLunches(day: MenuDay, prefs: DietPrefs): LunchChoice[] {
  return SCHOOL_LUNCHES.filter((c) => lunchFit(day, c, prefs).fit === 'fits');
}

export type FillMode = 'best' | 'surprise';

/**
 * 'best' prefers the day's hot lunch, then the offered-daily sandwiches, in menu order.
 * 'surprise' picks at random among the fitting school lunches.
 * Falls back to a packed lunch when nothing on the menu is labeled for the diet.
 */
export function pickLunch(day: MenuDay, prefs: DietPrefs, mode: FillMode, rng: () => number = Math.random): LunchChoice {
  const options = fittingLunches(day, prefs);
  if (options.length === 0) return 'home';
  if (mode === 'best') return options[0];
  return options[Math.floor(rng() * options.length)];
}

/** The lunch plus the sides and drink that go with it for this diet. */
export function comboFor(day: MenuDay, prefs: DietPrefs, mode: FillMode, rng?: () => number): Partial<DayPlan> {
  const lunch = pickLunch(day, prefs, mode, rng);
  const patch: Partial<DayPlan> = { lunch };
  if (prefs.profile === 'vegetarian' || prefs.profile === 'vegan') {
    const sides = day.sides.filter((s) => !MEAT_SIDES.has(s));
    if (sides.length !== day.sides.length) patch.sides = sides;
  }
  if (prefs.profile === 'vegan') patch.drink = 'none'; // milk is dairy
  return patch;
}
