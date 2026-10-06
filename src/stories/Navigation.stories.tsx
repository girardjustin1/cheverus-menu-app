import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DayTabs } from '../components/DayTabs';
import { WeekSelector } from '../components/WeekSelector';
import { dayStatus, type DayStatus } from '../lib/plan';
import { PARTLY_PLANNED, WEEKS, WEEK_OF_OCT_12, WEEK_OF_OCT_5 } from './fixtures';

const meta = {
  title: 'Components/Navigation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = { render: () => <AppHeader /> };

export const Weeks: Story = {
  render: function Render() {
    const [selected, setSelected] = useState('2026-10-05');
    return (
      <WeekSelector
        weeks={WEEKS}
        selected={selected}
        onSelect={setSelected}
        progress={{
          '2026-09-28': { done: 5, total: 5 },
          '2026-10-05': { done: 3, total: 5 },
          '2026-10-12': { done: 0, total: 4 },
          '2026-10-19': { done: 0, total: 5 },
          '2026-10-26': { done: 0, total: 5 },
        }}
      />
    );
  },
};

function statusesFor(days: typeof WEEK_OF_OCT_5.days) {
  const statuses: Record<string, DayStatus> = {};
  for (const d of days) statuses[d.date] = dayStatus(d, PARTLY_PLANNED.days[d.date]);
  return statuses;
}

export const DayTabsMixedStatus: Story = {
  name: 'Day tabs — done / partial / empty',
  render: function Render() {
    const [selected, setSelected] = useState('2026-10-06');
    return (
      <DayTabs days={WEEK_OF_OCT_5.days} selected={selected} onSelect={setSelected} statuses={statusesFor(WEEK_OF_OCT_5.days)} />
    );
  },
};

export const DayTabsWithHoliday: Story = {
  name: 'Day tabs — holiday Monday',
  render: function Render() {
    const [selected, setSelected] = useState('2026-10-13');
    return (
      <DayTabs days={WEEK_OF_OCT_12.days} selected={selected} onSelect={setSelected} statuses={statusesFor(WEEK_OF_OCT_12.days)} />
    );
  },
};
