import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { DayPlanner } from '../components/DayPlanner';
import { emptyDayPlan, type DayPlan } from '../lib/plan';
import { PARTLY_PLANNED, dayOn } from './fixtures';

const meta = {
  title: 'Components/Day Planner',
  component: DayPlanner,
  parameters: { layout: 'fullscreen' },
  args: { onChange: fn(), onApplyToWeek: fn() },
  render: function Render(args) {
    const [plan, setPlan] = useState<DayPlan>(args.plan);
    return (
      <DayPlanner
        {...args}
        plan={plan}
        onChange={(patch) => {
          setPlan((p) => ({ ...p, ...patch }));
          args.onChange(patch);
        }}
      />
    );
  },
} satisfies Meta<typeof DayPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { day: dayOn('2026-10-06'), plan: emptyDayPlan() } };

export const Planned: Story = { args: { day: dayOn('2026-10-06'), plan: PARTLY_PLANNED.days['2026-10-06'] } };

export const PackingLunch: Story = {
  args: { day: dayOn('2026-10-08'), plan: { ...emptyDayPlan(), lunch: 'home' } },
};

export const PreKSubstitution: Story = {
  name: 'Entrée with a note (Pre-K)',
  args: { day: dayOn('2026-10-15'), plan: emptyDayPlan() },
};

export const NoSchool: Story = { args: { day: dayOn('2026-10-12'), plan: emptyDayPlan() } };
