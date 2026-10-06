import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AppHeader } from '../components/AppHeader';
import { CHEVERUS } from '../theme/theme';

const PlanButton = () => (
  <Button startIcon={<EventNoteRoundedIcon />} sx={{ px: 2, color: CHEVERUS.navy, bgcolor: CHEVERUS.yellow, '&:hover': { bgcolor: CHEVERUS.yellow } }}>
    Plan
  </Button>
);

const meta = {
  title: 'Components/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
  args: { onMenuClick: fn() },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As in the app: hamburger (opens the push menu), logo, title, and the yellow Plan button. */
export const Default: Story = { args: { action: <PlanButton /> } };

export const WithoutActions: Story = { args: { onMenuClick: undefined } };
