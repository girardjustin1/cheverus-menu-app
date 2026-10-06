import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AppMenu } from '../components/AppMenu';
import { ACCOUNT, DETAILS } from './fixtures';

const meta = {
  title: 'Components/AppMenu',
  component: AppMenu,
  parameters: { layout: 'fullscreen' },
  args: { account: ACCOUNT, details: DETAILS, view: 'plan', ordersCount: 2, draftsCount: 1, onNavigate: fn(), onSignOut: fn() },
  decorators: [
    (Story) => (
      <Box sx={{ width: 296, height: 760, boxShadow: 8 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AppMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Push-menu contents. Tap the name/email header (✏️) to edit Parent Info. */
export const OnPlan: Story = {};
export const OnPastOrders: Story = { args: { view: 'orders' } };
export const OnProfile: Story = { args: { view: 'profile' } };
export const NewParent: Story = {
  name: 'New parent (no orders, no child yet)',
  args: { ordersCount: 0, draftsCount: 0, details: { ...DETAILS, childName: '', classroom: '' } },
};
