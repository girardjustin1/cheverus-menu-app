import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EmailDraftCard } from '../components/EmailDraftCard';
import { buildEmail } from '../lib/email';
import type { PlanState } from '../lib/plan';
import { EMPTY, FULL_WEEK, PARTLY_PLANNED, WEEK_OF_OCT_5 } from './fixtures';

function Harness({ initial, planned }: { initial: PlanState; planned: number }) {
  const [plan, setPlan] = useState(initial);
  return (
    <EmailDraftCard
      draft={buildEmail(WEEK_OF_OCT_5, plan)}
      details={plan.details}
      onDetailsChange={(patch) => setPlan((p) => ({ ...p, details: { ...p.details, ...patch } }))}
      plannedDays={planned}
      schoolDays={5}
    />
  );
}

const meta = {
  title: 'Components/Email Draft',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { render: () => <Harness initial={EMPTY} planned={0} /> };
export const PartlyPlanned: Story = { render: () => <Harness initial={PARTLY_PLANNED} planned={3} /> };
export const FullWeek: Story = { render: () => <Harness initial={FULL_WEEK} planned={5} /> };
