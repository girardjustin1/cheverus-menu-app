import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LoginScreen } from '../components/LoginScreen';

const meta = {
  title: 'Components/LoginScreen',
  component: LoginScreen,
  parameters: { layout: 'fullscreen' },
  args: { onSignIn: fn() },
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByText('Enter your first and last name')).toBeInTheDocument();
    await expect(canvas.getByText('Enter a valid email')).toBeInTheDocument();
  },
};

export const Filled: Story = { args: { initial: { fullName: 'Jordan Rivera', email: 'jordan@example.com' } } };
