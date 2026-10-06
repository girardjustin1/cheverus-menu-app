# Cheverus Lunch Planner

A phone-first prototype for planning a child's school week at Cheverus Catholic School
(Malden, MA): lunch, sides, drink, breakfast and Extended Day pickup, one day at a time.
It ends in a ready-to-send email you can copy or open in Mail.

- **Menu source:** `menu/October Lunch 2026.pdf` (Sep/Oct 2026 ELC & Cheverus menu),
  transcribed into [`src/data/menu.ts`](src/data/menu.ts). Menus change, so check it
  against each new PDF.
- **Extended Day:** Mon–Fri, dismissal until 5:30 PM —
  <https://cheverusschool.com/extended-day-program>
- **Privacy:** the plan is saved in this browser only (`localStorage`). Nothing is sent anywhere.

## Stack

React 19 · TypeScript · Vite 8 · MUI 9 · Storybook 10 · Vitest

Colors come from the school logo: navy `#19044F` and yellow `#F4F00E`
([`src/theme/theme.ts`](src/theme/theme.ts)). Storybook opens in an iPhone 17
viewport (402 × 874).

## Commands

```bash
npm install
npm run storybook      # component workshop, iPhone 17 viewport by default
npm run dev            # the app
npm test               # unit tests: menu data, week logic, email builder
npm run test:stories   # renders every story + interaction tests (headless Chromium)
npm run build          # typecheck + production build
npm run lint
```

## Layout

```
src/
  data/menu.ts            transcribed menu, offered-daily options, fruit & veggie bar
  lib/                    dates, plan model, email builder, persisted state hook
  theme/theme.ts          MUI theme from the logo colors
  components/             AppHeader, WeekSelector, DayTabs, ChoiceCarousel, ChipSelect,
                          DayPlanner, EmailDraftCard, LunchPlanner (the full screen)
  stories/                Storybook stories + shared fixtures
```
