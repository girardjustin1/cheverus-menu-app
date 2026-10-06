import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LunchPlanner } from '../components/LunchPlanner';
import { EMPTY, FULL_WEEK, PARTLY_PLANNED, STORY_TODAY } from './fixtures';

const meta = {
  title: 'Screens/Lunch Planner',
  component: LunchPlanner,
  parameters: { layout: 'fullscreen' },
  args: { today: STORY_TODAY },
} satisfies Meta<typeof LunchPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { initialPlan: EMPTY } };

export const PartlyPlanned: Story = { args: { initialPlan: PARTLY_PLANNED } };

export const FullWeekPlanned: Story = { args: { initialPlan: FULL_WEEK } };

export const NoSchoolMonday: Story = {
  name: 'Week with a holiday (Oct 12)',
  args: { initialPlan: EMPTY, today: '2026-10-12' },
};

/** Plan one day end to end and check it lands in the email. */
export const PlanADay: Story = {
  args: { initialPlan: EMPTY },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /Asian Chicken/ }));
    await userEvent.click(canvas.getByRole('radio', { name: /^1% Milk/ }));
    await userEvent.click(canvas.getByRole('radio', { name: /Pickup by 5:00 PM/ }));
    const body = canvas.getByTestId('email-body');
    await expect(body).toHaveTextContent('Tuesday, October 6');
    await expect(body).toHaveTextContent('Lunch: Asian Chicken ("General Tso" hot lunch)');
    await expect(body).toHaveTextContent('Drink: 1% Milk');
    await expect(body).toHaveTextContent('Extended Day: Yes — pickup by 5:00 PM');
  },
};
