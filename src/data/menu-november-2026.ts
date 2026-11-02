import type { MenuDay } from './menu';

// Transcribed from the November 2026 "ELC and Cheverus School Menu" (Malden Public Schools / Aramark),
// scan saved locally as menu/November Lunch 2026.png. Runs Mon Nov 2 – Fri Dec 4.
// Notes on the scan:
// - Tue Nov 3: the printed entry is crossed out and handwritten "Chicken nuggets and Tots".
// - Faint, lighter-printed items (e.g. Sweet Carrots on Nov 4) are real menu items, as on October's menu.
// - Thu Nov 19: the third item is too faint to read; it matches October's Ball Park Frank day (Sweet Carrots).
// - Tue Nov 24: "Lettuce & Salsa Optional (V)" is kept as a side; the beef nachos are not tagged vegetarian.
// Menus are subject to change — re-check against the posted menu.
export const NOVEMBER_2026_DAYS: MenuDay[] = [
  // Week of Nov 2
  {
    date: '2026-11-02',
    theme: 'Buonissimo',
    entree: 'Cheese Lasagna',
    tags: ['V'],
    sides: ['WG Dinner Roll', 'Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-11-03',
    entree: 'Chicken Nuggets',
    entreeNote: 'Updated by hand on the menu',
    sides: ['Tots'],
  },
  {
    date: '2026-11-04',
    theme: 'Delicious',
    entree: 'Pizza Crunchers',
    sides: ['Sweet Carrots', 'Fresh Broccoli', 'Green Apple'],
  },
  {
    date: '2026-11-05',
    theme: 'From the Grill',
    entree: 'Juicy Cheeseburger',
    tags: ['H'],
    sides: ['Crispy Potato Puffs', 'Cucumber Coins'],
  },
  {
    date: '2026-11-06',
    theme: 'Pizzeria Style',
    entree: 'Slice of Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Nov 9
  {
    date: '2026-11-09',
    theme: 'Mama Mia',
    entree: 'Meatball Sub',
    sides: ['Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-11-10',
    theme: 'General Tso',
    entree: 'Asian Popcorn Chicken',
    sides: ['Whole Grain Rice', 'Roasted Broccoli', 'Red Pepper Strips'],
  },
  { date: '2026-11-11', entree: 'No School', noSchoolReason: 'Veterans Day', sides: [], noSchool: true },
  {
    date: '2026-11-12',
    theme: 'Mouth Popping',
    entree: 'Chicken Bites',
    tags: ['H'],
    sides: ['Whole Grain Snack', 'Tater Tots', 'Sweet Carrots'],
  },
  {
    date: '2026-11-13',
    theme: 'Pizzeria Style',
    entree: 'Slice of Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Nov 16
  {
    date: '2026-11-16',
    theme: 'Country',
    entree: 'Popcorn Chicken Bowl',
    sides: ['Creamy Mashed Potato with Gravy', 'WG Dinner Bun', 'Juicy Apple'],
  },
  {
    date: '2026-11-17',
    theme: 'Savory',
    entree: 'Chicken Dumplings with Asian Sauce',
    sides: ['Vegetable Fried Rice', 'Roasted Broccoli', 'Red Pepper Strips'],
  },
  {
    date: '2026-11-18',
    entree: 'Spaghetti and Meatballs',
    sides: ['WG Dinner Roll', 'Green Beans', 'Celery Sticks', 'Green Apple'],
  },
  {
    date: '2026-11-19',
    theme: 'Ball Park Frank',
    entree: 'All Beef Hot Dog',
    tags: ['K'],
    sides: ['Boston Baked Beans', 'Sweet Carrots'],
  },
  {
    date: '2026-11-20',
    theme: 'Personal',
    entree: 'Pan Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
  // Week of Nov 23
  {
    date: '2026-11-23',
    theme: 'Classic',
    entree: 'Crispy Chicken Parmesan Sandwich',
    sides: ['Whole Grain Bun', 'Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-11-24',
    theme: 'Tex-Mex',
    entree: 'Beef Nachos Grande',
    sides: ['Seasoned Black Beans', 'Lettuce & Salsa (optional)', 'Red Pepper Strips'],
  },
  { date: '2026-11-25', entree: 'No School', noSchoolReason: 'Thanksgiving Recess', sides: [], noSchool: true },
  { date: '2026-11-26', entree: 'No School', noSchoolReason: 'Thanksgiving Recess', sides: [], noSchool: true },
  { date: '2026-11-27', entree: 'No School', noSchoolReason: 'Thanksgiving Recess', sides: [], noSchool: true },
  // Week of Nov 30
  {
    date: '2026-11-30',
    theme: 'Delicious',
    entree: 'Cheesy Breadsticks',
    sides: ['Green Beans', 'Celery Sticks', 'Juicy Apple'],
  },
  {
    date: '2026-12-01',
    theme: 'Delicious',
    entree: 'Seasoned Beef Soft Tacos',
    sides: ['Roasted Corn', 'Red Pepper Strips'],
  },
  {
    date: '2026-12-02',
    theme: 'Cheesy',
    entree: 'Chicken Penne Alfredo',
    sides: ['WG Dinner Roll', 'Broccoli', 'Cucumber Coins', 'Green Apple'],
  },
  {
    date: '2026-12-03',
    theme: 'Delicious',
    entree: 'Macaroni and Cheese Bites',
    sides: ['Green Beans', 'Sweet Carrots'],
  },
  {
    date: '2026-12-04',
    theme: 'Personal',
    entree: 'Pan Pizza',
    tags: ['V'],
    sides: ['Romaine Side Salad', 'Three Bean Salad', 'Fruit Cup'],
  },
];
