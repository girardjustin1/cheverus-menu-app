import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WeekSelector } from '../components/WeekSelector';
import { STORY_TODAY, WEEKS } from './fixtures';

const meta = {
  title: 'Components/WeekSelector',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PROGRESS = {
  '2026-09-28': { done: 0, total: 0 },
  '2026-10-05': { done: 2, total: 4 },
  '2026-10-12': { done: 0, total: 4 },
  '2026-10-19': { done: 5, total: 5 },
  '2026-10-26': { done: 0, total: 5 },
};

/** Planner: "This week" label, progress for days still plannable, past weeks greyed out. */
export const Planner: Story = {
  render: function Render() {
    const [selected, setSelected] = useState('2026-10-05');
    return <WeekSelector weeks={WEEKS} selected={selected} onSelect={setSelected} today={STORY_TODAY} progress={PROGRESS} />;
  },
};

/** Past orders: "All weeks" pill, past weeks stay selectable, captions show what was saved or sent. */
export const PastOrders: Story = {
  render: function Render() {
    const [selected, setSelected] = useState('2026-10-05');
    return (
      <WeekSelector
        weeks={WEEKS}
        selected={selected}
        onSelect={setSelected}
        today={STORY_TODAY}
        allowPast
        allOption={{ label: 'All weeks', caption: '2 sent · 1 draft' }}
        captions={{
          '2026-09-28': '1 sent',
          '2026-10-05': '1 sent · 1 draft',
          '2026-10-12': 'Nothing yet',
          '2026-10-19': 'Nothing yet',
          '2026-10-26': 'Nothing yet',
        }}
      />
    );
  },
};
