import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppShell } from '../components/AppShell';
import { ACCOUNT, EMPTY, ONBOARDED_EMPTY, ORDERS, ORDERS_WITH_DRAFT, PARTLY_PLANNED, STORY_TODAY } from './fixtures';

/** The accordion card around a summary button. */
const cardOf = (button: HTMLElement) => within(button.closest('.MuiAccordion-root') as HTMLElement);

const meta = {
  title: 'Screens/App',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { today: STORY_TODAY },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = { args: { fixture: { account: null } } };

export const AskWeekOrDay: Story = { name: 'After sign-in: Plan modal', args: { fixture: { account: ACCOUNT, plan: ONBOARDED_EMPTY } } };

export const PlanningTheWeek: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS } },
};

export const PastOrders: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS_WITH_DRAFT, view: 'orders' } },
};

export const MenuOpen: Story = {
  name: 'Push menu open',
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS, menuOpen: true } },
};

export const OnboardingParent: Story = {
  name: 'Sign-up step 1 — Parent info',
  args: { fixture: { account: ACCOUNT, plan: EMPTY } },
};

export const OnboardingChild: Story = {
  name: 'Sign-up step 2 — Child info',
  args: { fixture: { account: ACCOUNT, plan: EMPTY, route: '#/welcome/child' } },
};

export const ProfileChildInfo: Story = {
  name: 'Profile — Child Info tab',
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, history: ORDERS, route: '#/profile/child' } },
};

export const DeepLinkThursday: Story = {
  name: 'Deep link — week of Oct 5, Thursday',
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, route: '#/plan?mode=week&week=2026-10-05&day=2026-10-08' } },
};

export const FamilyInfo: Story = {
  name: 'Profile — Parent Info tab',
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS, view: 'profile' } },
};

export const November: Story = {
  name: 'November picked — menu not posted',
  args: { fixture: { account: ACCOUNT, plan: ONBOARDED_EMPTY, mode: 'week', monthId: '2026-11' } },
};

export const PastOrdersDaily: Story = {
  name: 'Past orders — Daily filter',
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, history: ORDERS_WITH_DRAFT, route: '#/orders?type=day' } },
};

/** A draft shows the email itself, and Edit in planner reopens that week. */
export const DraftEmailAndEdit: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, history: ORDERS_WITH_DRAFT, route: '#/orders' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByRole('button', { name: /Week of Oct 5 · Sam/ });
    await userEvent.click(summary);
    // Scope to the opened draft — the planner's hidden email card has the same subject.
    const draft = cardOf(summary);
    await expect(draft.getByText('Sam — lunch & Extended Day plan, week of Oct 5')).toBeVisible();
    await expect(draft.getByText(/Hi Ms. Smith and the Cheverus team/)).toBeVisible();
    await userEvent.click(draft.getByRole('button', { name: 'Edit in planner' }));
    await expect(await canvas.findByRole('heading', { name: 'Choose lunch' })).toBeInTheDocument();
  },
};

/** Daily view splits each weekly email into one email per day, each sendable on its own. */
export const DailySplitsWeekly: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, history: ORDERS_WITH_DRAFT, route: '#/orders?week=2026-10-05&type=day' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Week of Oct 5: the weekly draft splits into Tue/Wed/Thu (planned days from today), plus the Wed single-day email.
    await expect(canvas.getByRole('button', { name: /Daily · 4/, pressed: true })).toBeInTheDocument();
    await expect(canvas.getAllByText('From weekly email')).toHaveLength(3);
    const summary = canvas.getByRole('button', { name: /Thursday, October 8 · Sam/ });
    await userEvent.click(summary);
    const day = cardOf(summary);
    await expect(day.getByText('Sam — lunch & Extended Day plan, Thursday, October 8')).toBeVisible();
  },
};

/** The week carousel filters orders and shows what each week has. */
export const WeekCarouselFilter: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, history: ORDERS_WITH_DRAFT, route: '#/orders?type=week' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Defaults to this week (Oct 5): one weekly draft.
    await expect(canvas.getByRole('tab', { name: /This week · Oct 5.*1 sent · 1 draft/, selected: true })).toBeInTheDocument();
    await expect(canvas.getByText('Week of Oct 5 · Sam')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: /Week of Sep 28/ }));
    await expect(canvas.getByText('Week of Sep 28 · Sam')).toBeInTheDocument();
    await expect(canvas.queryByText('Week of Oct 5 · Sam')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: /All weeks/ }));
    await expect(canvas.getByRole('button', { name: /Weekly · 2/ })).toBeInTheDocument();
  },
};

export const PastOrdersEmpty: Story = {
  args: { fixture: { account: ACCOUNT, plan: ONBOARDED_EMPTY, mode: 'week', history: [], view: 'orders' } },
};

/** Sign in, choose a mode, and land on the planner with the name in the greeting. */
export const SignInFlow: Story = {
  args: { fixture: { account: null } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByText('Enter your first and last name')).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText(/Parent full name/), 'Jordan Rivera');
    await userEvent.type(canvas.getByLabelText(/Email/), 'jordan@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    // Sign-up step 1 (parent) → step 2 (child) → plan.
    await expect(await canvas.findByRole('heading', { name: 'Welcome, Jordan!' })).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('Sign emails as'), 'Jordan');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(await canvas.findByRole('heading', { name: 'Child info' })).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText("Child's name"), 'Sam');
    await userEvent.type(canvas.getByLabelText("Teacher's name"), 'Ms. Smith');
    await userEvent.click(canvas.getByRole('button', { name: 'Start planning' }));
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await expect(dialog.getByText(/Hi Jordan! What are we planning\?/)).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: 'Plan this week' }));
    await expect(await canvas.findByRole('heading', { name: 'Choose lunch' })).toBeInTheDocument();
  },
};

/** Save draft, then find it under Past orders → Drafts. */
export const SaveDraftFlow: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save draft' }));
    await expect(await within(canvasElement.ownerDocument.body).findByText('Draft saved to Past orders')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(canvas.getByRole('button', { name: /Past orders/ }));
    await expect(canvas.getByText('Drafts')).toBeInTheDocument();
    // Opens on this week with the Weekly filter (newest is the weekly draft).
    await expect(canvas.getByRole('button', { name: /Weekly · 1/, pressed: true })).toBeInTheDocument();
    await expect(canvas.getByText('1 draft for this week')).toBeInTheDocument();
  },
};

/** The header Plan button opens the modal; November is greyed out until its menu is posted. */
export const PlanButtonMonths: Story = {
  args: { fixture: { account: ACCOUNT, plan: ONBOARDED_EMPTY, mode: 'week' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Plan' }));
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await expect(dialog.getByRole('radio', { name: 'October 2026' })).toHaveAttribute('aria-checked', 'true');
    await expect(dialog.getByRole('radio', { name: 'November 2026' })).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Hamburger opens the push menu; Past orders shows the logged emails. */
export const MenuNavigation: Story = {
  args: { fixture: { account: ACCOUNT, plan: PARTLY_PLANNED, mode: 'week', history: ORDERS } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(canvas.getByRole('button', { name: /Past orders/ }));
    await expect(canvas.getByRole('heading', { name: 'Past orders' })).toBeInTheDocument();
    // Newest is a single-day email this week, so it opens on this week, Daily.
    await expect(canvas.getByRole('button', { name: /Daily · 1/, pressed: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: /All weeks/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Weekly · 1/ }));
    await expect(canvas.getByText('Week of Sep 28 · Sam')).toBeInTheDocument();
  },
};
