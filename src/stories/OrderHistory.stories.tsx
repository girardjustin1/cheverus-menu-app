import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { OrderHistory } from '../components/OrderHistory';
import { ORDERS_WITH_DRAFT, STORY_TODAY } from './fixtures';

const meta = {
  title: 'Components/OrderHistory (Past orders)',
  component: OrderHistory,
  parameters: { layout: 'fullscreen' },
  args: { orders: ORDERS_WITH_DRAFT, today: STORY_TODAY, onRemove: fn(), onEdit: fn() },
} satisfies Meta<typeof OrderHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** This week, Weekly: the draft shows the email itself, with Copy email and Edit in planner. */
export const ThisWeekWeekly: Story = { name: 'This week — Weekly', args: { week: '2026-10-05', type: 'week' } };

/** This week, Daily: the weekly draft split into one email per day ("From weekly email"), plus single-day emails. */
export const ThisWeekDaily: Story = { name: 'This week — Daily (weekly split per day)', args: { week: '2026-10-05', type: 'day' } };

export const PastWeek: Story = { name: 'Week of Sep 28 — sent', args: { week: '2026-09-28', type: 'week' } };

export const AllWeeks: Story = { args: { week: '', type: 'week' } };

export const NothingThatWeek: Story = { name: 'A week with nothing yet', args: { week: '2026-10-19', type: 'week' } };

export const Empty: Story = { args: { orders: [] } };
