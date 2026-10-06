import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { EmailDraftCard } from '../components/EmailDraftCard';
import { buildEmail } from '../lib/email';
import type { PlanState } from '../lib/plan';
import { EMPTY, FULL_WEEK, PARTLY_PLANNED, STORY_TODAY, WEEK_OF_OCT_5 } from './fixtures';

function Harness({ initial, planned, total = 4, date, inline }: { initial: PlanState; planned: number; total?: number; date?: string; inline?: boolean }) {
  const [plan, setPlan] = useState(initial);
  return (
    <EmailDraftCard
      draft={buildEmail(WEEK_OF_OCT_5, plan, { date, fromDate: STORY_TODAY, fallbackSignOff: 'Jordan Rivera' })}
      details={plan.details}
      onDetailsChange={(patch) => setPlan((p) => ({ ...p, details: { ...p.details, ...patch } }))}
      plannedDays={planned}
      schoolDays={total}
      statusText={date ? 'Tuesday is ready to send.' : undefined}
      onSent={fn()}
      onEditDetails={inline ? undefined : fn()}
    />
  );
}

const meta = {
  title: 'Components/EmailDraftCard',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** As in the app: "For: Sam · Grade 1 · Ms. Smith" with Edit info, then the email (from today onward). */
export const WeeklyPartlyPlanned: Story = { name: 'Weekly — partly planned', render: () => <Harness initial={PARTLY_PLANNED} planned={2} /> };
export const WeeklyAllPlanned: Story = { name: 'Weekly — all planned', render: () => <Harness initial={FULL_WEEK} planned={4} /> };
export const JustTheDay: Story = { name: 'Just the day', render: () => <Harness initial={PARTLY_PLANNED} planned={1} total={1} date="2026-10-06" /> };
export const NothingPlanned: Story = { render: () => <Harness initial={EMPTY} planned={0} /> };
/** Without a Profile page (standalone), the card shows the fields inline. */
export const StandaloneInlineFields: Story = { name: 'Standalone (inline fields)', render: () => <Harness initial={PARTLY_PLANNED} planned={2} inline /> };
