import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DayTabs } from '../components/DayTabs';
import { dayStatus, type DayStatus } from '../lib/plan';
import { PARTLY_PLANNED, STORY_TODAY, WEEKS, WEEK_OF_OCT_12, WEEK_OF_OCT_5 } from './fixtures';

const meta = {
  title: 'Components/DayTabs',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function statusesFor(days: typeof WEEK_OF_OCT_5.days) {
  const statuses: Record<string, DayStatus> = {};
  for (const d of days) statuses[d.date] = dayStatus(d, PARTLY_PLANNED.days[d.date]);
  return statuses;
}

function Harness({ days, initial, today = STORY_TODAY }: { days: typeof WEEK_OF_OCT_5.days; initial: string; today?: string }) {
  const [selected, setSelected] = useState(initial);
  return <DayTabs days={days} selected={selected} onSelect={setSelected} statuses={statusesFor(days)} today={today} />;
}

/** Today selected (navy). Monday is past and disabled; Wednesday reads TOMORROW. Dots: green done, yellow in progress. */
export const ThisWeekToday: Story = { name: 'This week — Today selected', render: () => <Harness days={WEEK_OF_OCT_5.days} initial={STORY_TODAY} /> };

export const ThisWeekThursday: Story = { name: 'This week — Thursday selected', render: () => <Harness days={WEEK_OF_OCT_5.days} initial="2026-10-08" /> };

/** Monday Oct 12 has no school (grey dot). */
export const HolidayWeek: Story = { name: 'Next week — holiday Monday', render: () => <Harness days={WEEK_OF_OCT_12.days} initial="2026-10-13" /> };

export const LaterWeek: Story = { name: 'A later week', render: () => <Harness days={WEEKS[3].days} initial={WEEKS[3].days[0].date} /> };
