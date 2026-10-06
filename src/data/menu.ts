// Transcribed from menu/October Lunch 2026.pdf
// ("September/October 2026 — ELC and Cheverus School Menu", Malden Public Schools / Aramark).
// Menus are subject to change — re-check against the posted PDF each month.

export type DietTag = 'V' | 'H' | 'K' | 'GF';

export const DIET_TAG_LABELS: Record<DietTag, string> = {
  V: 'Vegetarian',
  H: 'Halal',
  K: 'Kosher',
  GF: 'Gluten free',
};

export interface MenuDay {
  /** ISO date, e.g. "2026-10-05". */
  date: string;
  /** The quoted nickname printed above the entrée, e.g. "Mama Mia". */
  theme?: string;
  entree: string;
  tags?: DietTag[];
  /** Small print attached to the entrée, e.g. a Pre-K substitution. */
  entreeNote?: string;
  /** Grain, vegetable and fruit sides served with the hot lunch. */
  sides: string[];
  noSchool?: boolean;
}

export interface DailyOption {
  id: string;
  name: string;
  tags: DietTag[];
}

/** "Offered daily" column — available every school day instead of the hot lunch. */
export const OFFERED_DAILY: DailyOption[] = [
  { id: 'sunbutter', name: 'Jammie Sunbutter & Jelly Sandwich', tags: ['V'] },
  { id: 'cheese-sandwich', name: 'American Cheese Sandwich on Wheat Bread', tags: ['V'] },
];

/** "Fruit & Veggie Bars May Include" — availability varies by day. One of each per lunch. */
export const VEGGIE_BAR = ['Carrots', 'Cucumbers', 'Tomatoes', 'Celery Sticks', 'Three Bean Salad'];
export const FRUIT_BAR = ['Fresh Fruit', 'Fruit Cups', 'Raisins', '100% Fruit Juice'];
export const FRUIT_VEGGIE_BAR = [...VEGGIE_BAR, ...FRUIT_BAR];

/** Every meal comes with a choice of milk; the breakfast note lists fat-free or 1%. */
export const MILK_CHOICES = ['1% Milk', 'Fat-Free Milk'];

/** Grab & Go breakfast parts, from the breakfast box on the menu. One of each. */
export const BREAKFAST_GRAINS = ['Muffin', 'Cereal', 'Cereal Bar', 'Breakfast Bread', 'Hot Breakfast Item', 'Whole Grain Snack'];
export const BREAKFAST_FRUIT = ['½ Cup of Fruit', '100% Fruit Juice'];

export const BREAKFAST_NOTE =
  'Free Grab & Go breakfast every day: whole-grain items (muffins, cereal, cereal bars, breakfast breads, hot breakfast items, whole-grain snacks), ½ cup of fruit or 100% fruit juice, and fat-free or 1% milk.';

export const MENU_NOTES = [
  'Every meal comes complete with fruit, milk and veggies.',
  'Breakfast & lunch: 1st meal is free to all students.',
  'Menus are subject to change.',
];

export const MENU_DAYS: MenuDay[] = [
  // Week of Sep 28
  {
    date: '2026-09-28',
    theme: 'Buonissimo',
    entree: 'Cheese Lasagna',
    tags: ['V'],
    sides: ['Dinner Roll', 'Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-09-29',
    theme: 'The Classic',
    entree: 'Crispy Chicken Breast Sandwich',
    sides: ['Whole Grain Bun', 'Golden Corn', 'Red Pepper Strips', 'Sweet Orange'],
  },
  {
    date: '2026-09-30',
    theme: 'Delicious',
    entree: 'Pizza Crunchers',
    sides: ['Sweet Carrots', 'Fresh Broccoli', 'Green Apple'],
  },
  {
    date: '2026-10-01',
    theme: 'From the Grill',
    entree: 'Juicy Cheeseburger',
    tags: ['H'],
    sides: ['Crispy Potato Puffs', 'Cucumber Coins', 'Baby Banana'],
  },
  {
    date: '2026-10-02',
    theme: 'Pizzeria Style',
    entree: 'Slice of Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Oct 5
  {
    date: '2026-10-05',
    theme: 'Mama Mia',
    entree: 'Meatball Sub',
    sides: ['Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-10-06',
    theme: 'General Tso',
    entree: 'Asian Chicken',
    sides: ['Whole Grain Rice', 'Roasted Broccoli', 'Red Pepper Strips', 'Sweet Orange'],
  },
  {
    date: '2026-10-07',
    theme: 'Homemade',
    entree: 'Macaroni & Cheese',
    tags: ['V'],
    sides: ['Sweet Peas', 'Fresh Broccoli', 'Green Apple'],
  },
  {
    date: '2026-10-08',
    theme: 'Mouth Popping',
    entree: 'Chicken Bites',
    tags: ['H'],
    sides: ['Whole Grain Snack', 'Tater Tots', 'Sweet Carrots', 'Baby Banana'],
  },
  {
    date: '2026-10-09',
    theme: 'Pizzeria Style',
    entree: 'Slice of Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Oct 12
  { date: '2026-10-12', entree: 'No School Today', sides: [], noSchool: true },
  {
    date: '2026-10-13',
    theme: 'Savory',
    entree: 'Chicken Dumplings with Asian Sauce',
    sides: ['Vegetable Fried Rice', 'Roasted Broccoli', 'Red Pepper Strips', 'Sweet Orange'],
  },
  {
    date: '2026-10-14',
    entree: 'Spaghetti and Meatballs',
    sides: ['WG Dinner Roll', 'Green Beans', 'Celery Sticks', 'Green Apple'],
  },
  {
    date: '2026-10-15',
    theme: 'Ball Park Frank',
    entree: 'All Beef Hot Dog',
    entreeNote: 'Pre-K gets a Cheeseburger',
    sides: ['Boston Baked Beans', 'Sweet Carrots', 'Baby Banana'],
  },
  {
    date: '2026-10-16',
    theme: 'Personal',
    entree: 'Pan Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Oct 19
  {
    date: '2026-10-19',
    theme: 'Classic',
    entree: 'Crispy Chicken Parmesan Sandwich',
    sides: ['Whole Grain Bun', 'Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-10-20',
    theme: 'Tex-Mex',
    entree: 'Beef Nachos Grande',
    sides: ['Seasoned Black Beans', 'Roasted Corn', 'Red Pepper Strips', 'Sweet Orange'],
  },
  {
    date: '2026-10-21',
    theme: 'Oven Fresh',
    entree: 'French Toast Sticks',
    sides: ['Breakfast Sausage', 'Crispy Hash Brown', 'Sweet Carrots', 'Green Apple'],
  },
  {
    date: '2026-10-22',
    theme: 'Delicious',
    entree: 'Barbacoa Soft Tacos',
    sides: ['Roasted Corn', 'Cucumber Coins', 'Baby Banana'],
  },
  {
    date: '2026-10-23',
    theme: 'Pizzeria Style',
    entree: 'Slice of Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Oct 26
  {
    date: '2026-10-26',
    theme: 'Delicious',
    entree: 'Cheesy Breadsticks',
    sides: ['Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-10-27',
    theme: 'Delicious',
    entree: 'Seasoned Beef Soft Tacos',
    sides: ['Roasted Corn', 'Red Pepper Strips', 'Sweet Orange'],
  },
  {
    date: '2026-10-28',
    theme: 'Cheesy',
    entree: 'Chicken Penne Alfredo',
    sides: ['WG Dinner Roll', 'Broccoli', 'Cucumber Coins', 'Green Apple'],
  },
  {
    date: '2026-10-29',
    theme: 'Delicious',
    entree: 'Macaroni and Cheese Bites',
    sides: ['Green Beans', 'Sweet Carrots', 'Baby Banana'],
  },
  {
    date: '2026-10-30',
    theme: 'Personal',
    entree: 'Pan Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
];
