import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LunchPlanner } from '../components/LunchPlanner';
import { EMPTY, FULL_WEEK, PARTLY_PLANNED, STORY_TODAY } from './fixtures';

const meta = {
  title: 'Screens/Lunch Planner',
  component: LunchPlanner,
  parameters: { layout: 'fullscreen' },
  args: { today: STORY_TODAY, initialMode: 'week' },
} satisfies Meta<typeof LunchPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisitPlanModal: Story = {
  name: 'First visit — Plan modal',
  args: { initialPlan: EMPTY, initialMode: undefined, firstName: 'Jordan' },
};

export const Empty: Story = { args: { initialPlan: EMPTY } };

export const PartlyPlanned: Story = { args: { initialPlan: PARTLY_PLANNED } };

export const FullWeekPlanned: Story = { args: { initialPlan: FULL_WEEK } };

export const OneDay: Story = { name: 'One day mode', args: { initialPlan: PARTLY_PLANNED, initialMode: 'day' } };

export const NoSchoolMonday: Story = {
  name: 'Week with a holiday (Oct 12)',
  args: { initialPlan: EMPTY, today: '2026-10-12' },
};

export const NovemberComingSoon: Story = {
  name: 'November — menu not posted',
  args: { initialPlan: EMPTY, initialMonthId: '2026-11' },
};

export const VegetarianWeek: Story = {
  args: { initialPlan: { ...EMPTY, diet: { profile: 'vegetarian', nutAllergy: true } } },
};

/** Choose "Just the day" in the Plan modal, plan it, and check the email covers only that day. */
export const PlanOneDay: Story = {
  args: { initialPlan: EMPTY, initialMode: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: /Just the day/ }));
    await userEvent.click(dialog.getByRole('button', { name: 'Plan this day' }));
    // The page is aria-hidden until the modal finishes closing.
    await userEvent.click(await canvas.findByRole('radio', { name: /Asian Chicken/ }));
    await userEvent.click(canvas.getByRole('radio', { name: /^1% Milk/ }));
    await userEvent.click(canvas.getByRole('radio', { name: /Pickup by 5:00 PM/ }));
    const body = canvas.getByTestId('email-body');
    await expect(body).toHaveTextContent("plan for Tuesday, October 6:");
    await expect(body).toHaveTextContent('Lunch: Asian Chicken ("General Tso" hot lunch)');
    await expect(body).not.toHaveTextContent('Monday, October 5');
  },
};

/** Vegetarian + "Fill empty days" only picks lunches marked vegetarian. */
export const FillVegetarianWeek: Story = {
  args: { initialPlan: { ...EMPTY, diet: { profile: 'vegetarian', nutAllergy: false } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Help me pick/ }));
    // The modal renders in a portal on document.body.
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: /Best match for empty days/ }));
    // Today is Tue Oct 6, so Monday is past: four days left to fill.
    await expect(await canvas.findByText(/Filled lunch for 4 days/)).toBeInTheDocument();
    const body = canvas.getByTestId('email-body');
    await expect(body).toHaveTextContent('Diet: my child eats vegetarian.');
    // Tue Oct 6 is Asian Chicken (not vegetarian) → first vegetarian option is the sunbutter sandwich.
    await expect(body).toHaveTextContent('Tuesday, October 6 • Lunch: Jammie Sunbutter & Jelly Sandwich');
    await expect(body).toHaveTextContent('Wednesday, October 7 • Lunch: Macaroni & Cheese');
  },
};

/** A staff note belongs to one day: it appears under that day in the email and nowhere else. */
export const NotePerDay: Story = {
  args: { initialPlan: PARTLY_PLANNED },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Note for staff, Tuesday, October 6 only/), 'Dentist at 3');
    await userEvent.click(canvas.getByRole('tab', { name: /Wednesday 7/ }));
    await expect(await canvas.findByLabelText(/Note for staff, Wednesday, October 7 only/)).toHaveValue('Grandma picking up');
    const body = canvas.getByTestId('email-body');
    await expect(body).toHaveTextContent('Tuesday, October 6');
    await expect(body.textContent).toMatch(/Tuesday, October 6[^]*Note: Dentist at 3[^]*Wednesday, October 7[^]*Note: Grandma picking up/);
    await expect(body.textContent?.match(/Dentist at 3/g)).toHaveLength(1);
  },
};
