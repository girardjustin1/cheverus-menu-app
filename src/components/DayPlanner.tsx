import { Box, Button, Card, CardContent, Chip, Divider, Stack, TextField, Typography } from '@mui/material';
import {
  BREAKFAST_NOTE,
  DIET_TAG_LABELS,
  FRUIT_VEGGIE_BAR,
  MILK_CHOICES,
  OFFERED_DAILY,
  type MenuDay,
} from '../data/menu';
import { fmtLongDate } from '../lib/dates';
import { foodEmoji } from '../lib/foodEmoji';
import {
  EDP_PICKUP_TIMES,
  sidesFor,
  type DayPlan,
  type DrinkChoice,
  type EdpChoice,
  type LunchChoice,
} from '../lib/plan';
import { ChipSelect } from './ChipSelect';
import { ChoiceCarousel, type CarouselOption } from './ChoiceCarousel';

/** Fields that can be copied to every school day in the week. */
export type WeekWideField = 'drink' | 'edp' | 'breakfast';

export interface DayPlannerProps {
  day: MenuDay;
  plan: DayPlan;
  onChange: (patch: Partial<DayPlan>) => void;
  onApplyToWeek?: (field: WeekWideField) => void;
}

function lunchOptions(day: MenuDay): CarouselOption<LunchChoice>[] {
  return [
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

export function DayPlanner({ day, plan, onChange, onApplyToWeek }: DayPlannerProps) {
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
      <Box>
        <Typography variant="overline" color="text.secondary">
          {fmtLongDate(day.date)}
        </Typography>
        <Typography variant="h2" component="h2" sx={{ mb: 0.5 }}>
          {foodEmoji(day.entree)} {day.entree}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {day.sides.map((side) => (
            <Chip key={side} size="small" label={side} variant="outlined" />
          ))}
          <Chip size="small" label="Choice of milk" variant="outlined" />
        </Stack>
      </Box>

      <ChoiceCarousel
        title="Choose lunch"
        hint="Select 1"
        required
        options={lunchOptions(day)}
        value={plan.lunch}
        onChange={(lunch) => onChange({ lunch })}
      />

      {eatingAtSchool && (
        <ChipSelect
          title="Sides to include"
          hint="Tap to remove"
          options={day.sides}
          selected={sides}
          onToggle={(side) => onChange({ sides: toggle(sides, side) })}
        />
      )}

      {eatingAtSchool && (
        <ChipSelect
          title="Fruit & veggie bar"
          hint="May include — not guaranteed daily"
          options={FRUIT_VEGGIE_BAR}
          selected={plan.extras}
          onToggle={(extra) => onChange({ extras: toggle(plan.extras, extra) })}
        />
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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {BREAKFAST_NOTE}
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3" component="h3" sx={{ mb: 1 }}>
          Note for staff
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="e.g. Early pickup at 3:00 for a dentist appointment"
          value={plan.note}
          onChange={(e) => onChange({ note: e.target.value })}
          slotProps={{ htmlInput: { 'aria-label': 'Note for staff' } }}
        />
      </Box>
    </Stack>
  );
}
