# Cheverus Lunch Planner

A phone-first prototype for planning a child's school week at Cheverus Catholic School
(Malden, MA): lunch, sides, drink, breakfast and Extended Day pickup, one day at a time.
It ends in a ready-to-send email you can copy or open in Mail.

- **Menu source:** `menu/October Lunch 2026.pdf` (the September/October 2026 ELC & Cheverus menu, shown in the app as October 2026),
  transcribed into [`src/data/menu.ts`](src/data/menu.ts). Menus change, so check it
  against each new PDF.
- **Extended Day:** Mon–Fri, dismissal until 5:30 PM —
  <https://cheverusschool.com/extended-day-program>
- **Privacy:** sign-in is a local prototype (name + email, no password). Plans and past
  orders are saved per email in this browser only (`localStorage`). Nothing is sent anywhere.

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
npm run prototype      # click-through prototype on :5190 (tap any field to fill it)
npm test               # unit tests: menu data, week logic, email builder
npm run test:stories   # renders every story + interaction tests (headless Chromium)
npm run build          # typecheck + production build
npm run lint
```

## Deep links

Every screen is a URL hash route — works in the app, the prototype, and any static host:

| Link | Screen |
|---|---|
| `#/welcome/parent`, `#/welcome/child` | Sign-up steps |
| `#/plan?mode=week&week=2026-10-05&day=2026-10-08` | Weekly planner on a day |
| `#/plan?mode=day&day=2026-10-09` | Just that day |
| `…&modal=plan` / `…&modal=diet` | Plan modal / Help me pick 🎲 |
| `…&menu=open` | Side menu open |
| `#/orders?week=2026-10-05&type=day` | Past orders: week + Weekly/Daily |
| `#/profile/parent`, `#/profile/child` | Profile tabs |

Past days and weeks can't be planned; the app always works from today forward.

## Layout

```
src/
  data/menu.ts            transcribed menu, offered-daily options, fruit & veggie bar, breakfast
  data/months.ts          menu months; November is a placeholder until its PDF is posted
  lib/                    dates, plan model, diet rules, email builder, order history,
                          hash router, persisted state hooks
  theme/theme.ts          MUI theme from the logo colors, 44px touch targets
  components/             one story file per component in src/stories
  prototype/              click-through entry (prototype.html) with tap-to-fill fields
  stories/                Storybook: Components/*, Screens/*, Prototype/Click-through
```
