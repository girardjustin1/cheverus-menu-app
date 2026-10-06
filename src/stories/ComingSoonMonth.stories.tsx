import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoonMonth } from '../components/ComingSoonMonth';
import { MENU_MONTHS } from '../data/months';

const meta = {
  title: 'Components/ComingSoonMonth',
  component: ComingSoonMonth,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ComingSoonMonth>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Where November goes until its menu PDF is transcribed into src/data/months.ts. */
export const November: Story = { args: { month: MENU_MONTHS.find((m) => m.id === '2026-11')! } };
