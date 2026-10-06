import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PlanSetupDialog } from '../components/PlanSetupDialog';
import { MENU_MONTHS } from '../data/months';
import { STORY_TODAY } from './fixtures';

const meta = {
  title: 'Components/PlanSetupDialog (Plan modal)',
  component: PlanSetupDialog,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    months: MENU_MONTHS,
    today: STORY_TODAY,
    progress: {
      '2026-09-28': { done: 0, total: 0 },
      '2026-10-05': { done: 2, total: 4 },
      '2026-10-12': { done: 0, total: 4 },
      '2026-10-19': { done: 0, total: 5 },
      '2026-10-26': { done: 0, total: 5 },
    },
    onApply: fn(),
    onClose: fn(),
    current: { mode: 'week', monthId: '2026-10', weekMonday: '2026-10-05', date: '2026-10-06' },
  },
} satisfies Meta<typeof PlanSetupDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens on its own after sign-up. Sep 28 is a past week (disabled); Oct 5 is tagged "This week". */
export const FirstVisit: Story = {
  args: { firstName: 'Jordan', current: { monthId: '2026-10', weekMonday: '2026-10-05', date: '2026-10-06' } },
};

export const WeeklyPlanner: Story = {};

/** Day row: past Monday disabled, Today and Tomorrow labeled. */
export const JustTheDay: Story = {
  args: { current: { mode: 'day', monthId: '2026-10', weekMonday: '2026-10-05', date: '2026-10-07' } },
};

export const NovemberNoMenu: Story = {
  name: 'November (menu not posted)',
  args: { current: { mode: 'week', monthId: '2026-11', weekMonday: '', date: '' } },
};
