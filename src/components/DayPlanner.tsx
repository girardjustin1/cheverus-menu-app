import { Box, Button, Card, CardContent, Chip, Divider, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BREAKFAST_FRUIT,
  BREAKFAST_GRAINS,
  BREAKFAST_NOTE,
  DIET_TAG_LABELS,
  FRUIT_BAR,
  MILK_CHOICES,
  VEGGIE_BAR,
  OFFERED_DAILY,
  type MenuDay,
} from '../data/menu';
import { fmtLongDate, fmtWeekday, parseISODate } from '../lib/dates';
import { defaultDietPrefs, lunchFit, type DietPrefs } from '../lib/diet';
import { foodEmoji } from '../lib/foodEmoji';
import { useAutofill } from '../prototype/autofill';
import {
  EDP_PICKUP_TIMES,
  sidesFor,
  toggleBarPick,
  type BreakfastPicks,
  type DayPlan,
  type DrinkChoice,
  type EdpChoice,
  type LunchChoice,
} from '../lib/plan';
import { CHEVERUS } from '../theme/theme';
import { ChipSelect } from './ChipSelect';
import { SectionHeader } from './SectionHeader';
import { ChoiceCarousel, type CarouselOption } from './ChoiceCarousel';

const fmtMonthDayLong = (iso: string) => parseISODate(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

/** Fields that can be copied to every school day in the week. */
export type WeekWideField = 'drink' | 'edp' | 'breakfast';

export interface DayPlannerProps {
  day: MenuDay;
  plan: DayPlan;
  onChange: (patch: Partial<DayPlan>) => void;
  onApplyToWeek?: (field: WeekWideField) => void;
  /** Marks each lunch card with how it matches the diet. */
  diet?: DietPrefs;
}

function lunchOptions(day: MenuDay, diet: DietPrefs): CarouselOption<LunchChoice>[] {
  const withFit = (option: CarouselOption<LunchChoice>): CarouselOption<LunchChoice> => {
    if (diet.profile === 'none') return option;
    const { fit, reason } = lunchFit(day, option.value, diet);
    return { ...option, fit: { tone: fit === 'fits' ? 'ok' : fit === 'ask' ? 'warn' : 'no', label: reason } };
  };
  const options: CarouselOption<LunchChoice>[] = [
    {
      value: 'hot',
      emoji: foodEmoji(day.entree),
      overline: day.theme ? `“${day.theme}” · Hot lunch` : 'Hot lunch',
      title: day.entree,
      subtitle: day.entreeNote,
      badges: day.tags?.map((t) => DIET_TAG_LABELS[t]),
    },
    ...OFFERED_DAILY.map((option) => ({
      value: option.id as LunchChoice,
      emoji: foodEmoji(option.name),
      overline: 'Offered daily',
      title: option.name,
      badges: option.tags.map((t) => DIET_TAG_LABELS[t]),
    })),
    {
      value: 'home',
      emoji: '🎒',
      overline: 'From home',
      title: 'Packing lunch',
      subtitle: 'Skip school lunch today',
    },
  ];
  return options.map(withFit);
}

const DRINK_OPTIONS: CarouselOption<DrinkChoice>[] = [
  ...MILK_CHOICES.map((milk) => ({ value: milk as DrinkChoice, emoji: '🥛', title: milk })),
  { value: 'none', emoji: '🧃', title: 'No milk', subtitle: 'Sending a drink from home' },
];

const EDP_OPTIONS: CarouselOption<EdpChoice>[] = [
  { value: 'no', emoji: '🚗', title: 'No Extended Day', subtitle: 'Picking up at dismissal' },
  ...EDP_PICKUP_TIMES.map((time) => ({
    value: time,
    emoji: time === '5:30 PM' ? '🌙' : '🏫',
    overline: 'Extended Day',
    title: `Pickup by ${time}`,
    subtitle: time === '5:30 PM' ? 'Program closes at 5:30' : undefined,
  })),
];

const BREAKFAST_OPTIONS: CarouselOption<'yes' | 'no'>[] = [
  { value: 'yes', emoji: '🥣', title: 'Grab & Go breakfast', subtitle: 'Free every day' },
  { value: 'no', emoji: '🏠', title: 'No breakfast', subtitle: 'Eating at home' },
];

function SameAllWeek({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <Button size="small" variant="text" onClick={onClick} sx={{ flexShrink: 0, px: 1 }}>
      Same all week
    </Button>
  );
}

export function DayPlanner({ day, plan, onChange, onApplyToWeek, diet = defaultDietPrefs() }: DayPlannerProps) {
  const autofill = useAutofill();
  if (day.noSchool) {
    return (
      <Card sx={{ m: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography sx={{ fontSize: 44 }} aria-hidden>
            🏖️
          </Typography>
          <Typography variant="h2" component="h2">
            No school
          </Typography>
          <Typography color="text.secondary">{fmtLongDate(day.date)}</Typography>
        </CardContent>
      </Card>
    );
  }

  const sides = sidesFor(day, plan);
  const eatingAtSchool = plan.lunch !== 'home';
  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <Stack spacing={3} sx={{ p: 2 }} divider={<Divider flexItem />}>
      <Box
        component="section"
        aria-labelledby="featured-meal-title"
        sx={{ p: 2, borderRadius: '8px', bgcolor: CHEVERUS.yellowSoft, border: `1px solid ${alpha(CHEVERUS.navy, 0.12)}` }}
      >
        <Typography id="featured-meal-title" variant="h3" component="h2">
          ⭐ Featured meal of the day
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {fmtLongDate(day.date)}
          {day.theme ? ` · “${day.theme}”` : ''}
        </Typography>
        <Typography variant="h2" component="p" sx={{ mb: 1 }}>
          {foodEmoji(day.entree)} {day.entree}
        </Typography>
        {(day.tags?.length || day.entreeNote) && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {day.tags?.map((t) => (
              <Chip key={t} size="small" color="secondary" label={DIET_TAG_LABELS[t]} />
            ))}
            {day.entreeNote && (
              <Typography variant="caption" color="text.secondary">
                {day.entreeNote}
              </Typography>
            )}
          </Stack>
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {day.sides.map((side) => (
            <Chip key={side} size="small" label={side} variant="outlined" sx={{ bgcolor: 'background.paper' }} />
          ))}
          <Chip size="small" label="Choice of milk" variant="outlined" sx={{ bgcolor: 'background.paper' }} />
        </Stack>
      </Box>

      {/* The chosen lunch and its set sides are one section — no divider between them. */}
      <Stack spacing={2.5}>
        <ChoiceCarousel
          title="Choose lunch"
          hint="Select 1"
          required
          options={lunchOptions(day, diet)}
          value={plan.lunch}
          onChange={(lunch) => onChange({ lunch })}
        />
        {plan.lunch && plan.lunch !== 'home' && (
          <ChipSelect
            title="Sides with this lunch"
            hint="Tap to remove"
            options={day.sides}
            selected={sides}
            onToggle={(side) => onChange({ sides: toggle(sides, side) })}
          />
        )}
      </Stack>

      {eatingAtSchool && (
        <Stack spacing={2}>
          <ChipSelect
            title="Veggie from the bar"
            hint="Pick 1 · may vary by day"
            options={VEGGIE_BAR}
            selected={plan.extras}
            onToggle={(item) => onChange({ extras: toggleBarPick(plan.extras, item) })}
            single
          />
          <ChipSelect
            title="Fruit from the bar"
            hint="Pick 1 · may vary by day"
            options={FRUIT_BAR}
            selected={plan.extras}
            onToggle={(item) => onChange({ extras: toggleBarPick(plan.extras, item) })}
            single
          />
        </Stack>
      )}

      <ChoiceCarousel
        title="Choose a drink"
        hint="Select 1"
        required
        options={DRINK_OPTIONS}
        value={plan.drink}
        onChange={(drink) => onChange({ drink })}
        action={plan.drink && <SameAllWeek onClick={onApplyToWeek && (() => onApplyToWeek('drink'))} />}
      />

      <ChoiceCarousel
        title="Extended Day Program"
        hint="Dismissal – 5:30 PM"
        required
        options={EDP_OPTIONS}
        value={plan.edp}
        onChange={(edp) => onChange({ edp })}
        action={plan.edp && <SameAllWeek onClick={onApplyToWeek && (() => onApplyToWeek('edp'))} />}
      />

      <Box>
        <ChoiceCarousel
          title="Breakfast"
          hint="Select 1"
          options={BREAKFAST_OPTIONS}
          value={plan.breakfast === undefined ? undefined : plan.breakfast ? 'yes' : 'no'}
          onChange={(v) => onChange({ breakfast: v === 'yes' })}
          action={
            plan.breakfast !== undefined && (
              <SameAllWeek onClick={onApplyToWeek && (() => onApplyToWeek('breakfast'))} />
            )
          }
        />
        {!plan.breakfast && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {BREAKFAST_NOTE}
          </Typography>
        )}
        {plan.breakfast && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {(
              [
                ['grain', 'Whole-grain item', BREAKFAST_GRAINS],
                ['fruit', 'Fruit or juice', BREAKFAST_FRUIT],
                ['milk', 'Breakfast milk', MILK_CHOICES],
              ] as const
            ).map(([key, title, options]) => (
              <ChipSelect
                key={key}
                title={title}
                hint="Pick 1"
                options={[...options]}
                selected={plan.breakfastPicks?.[key] ? [plan.breakfastPicks[key]!] : []}
                onToggle={(item) => {
                  const picks: BreakfastPicks = { ...plan.breakfastPicks };
                  picks[key] = picks[key] === item ? undefined : item;
                  onChange({ breakfastPicks: picks });
                }}
                single
              />
            ))}
          </Stack>
        )}
      </Box>

      <Box>
        <SectionHeader
          title={`Note for ${fmtWeekday(day.date)}`}
          hint={`Only for ${fmtMonthDayLong(day.date)}`}
        />
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="e.g. Early pickup at 3:00 for a dentist appointment"
          value={plan.note}
          {...autofill('note', plan.note, (note) => onChange({ note }))}
          onChange={(e) => onChange({ note: e.target.value })}
          helperText={`Goes in the email under ${fmtWeekday(day.date)} only — other days keep their own notes.`}
          slotProps={{ htmlInput: { 'aria-label': `Note for staff, ${fmtLongDate(day.date)} only` } }}
        />
      </Box>
    </Stack>
  );
}
