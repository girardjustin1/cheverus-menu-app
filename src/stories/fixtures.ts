import { MENU_DAYS } from '../data/menu';
import { emptyPlan, groupWeeks, type PlanState } from '../lib/plan';

export const WEEKS = groupWeeks(MENU_DAYS);
export const WEEK_OF_OCT_5 = WEEKS.find((w) => w.monday === '2026-10-05')!;
export const WEEK_OF_OCT_12 = WEEKS.find((w) => w.monday === '2026-10-12')!;
export const dayOn = (date: string) => MENU_DAYS.find((d) => d.date === date)!;

/** Today's date when this prototype was built — pins stories to a stable week. */
export const STORY_TODAY = '2026-10-06';

export const DETAILS = {
  childName: 'Sam',
  classroom: 'Grade 1',
  parentName: 'Jordan',
  to: 'name@example.com',
};

/** Week of Oct 5: Mon–Wed fully planned, Thu partly, Fri untouched. */
export const PARTLY_PLANNED: PlanState = {
  details: DETAILS,
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
  details: DETAILS,
  days: {
    ...PARTLY_PLANNED.days,
    '2026-10-08': { lunch: 'home', extras: [], drink: 'none', edp: '4:30 PM', note: '' },
    '2026-10-09': { lunch: 'hot', extras: ['Fresh Fruit'], drink: '1% Milk', edp: 'no', note: '' },
  },
};

export const EMPTY = emptyPlan();
