import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { DietPanel } from '../components/DietPanel';
import type { DietPrefs } from '../lib/diet';

function Harness({ initial, open, status, scope }: { initial: DietPrefs; open?: boolean; status?: string; scope?: 'week' | 'day' }) {
  const [diet, setDiet] = useState(initial);
  return (
    <Box sx={{ p: 2 }}>
      <DietPanel
        defaultOpen={open}
        diet={diet}
        onChange={(p) => setDiet((d) => ({ ...d, ...p }))}
        onFill={fn()}
        status={status}
        scope={scope}
      />
    </Box>
  );
}

const meta = {
  title: 'Components/DietPanel (Help me pick)',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The 🎲 card on the planner. Tapping it opens the modal. */
export const Card: Story = { render: () => <Harness initial={{ profile: 'none', nutAllergy: false }} /> };
export const CardWithDiet: Story = { name: 'Card — vegetarian + nut allergy', render: () => <Harness initial={{ profile: 'vegetarian', nutAllergy: true }} /> };
export const CardAfterRoll: Story = {
  name: 'Card — after rolling',
  render: () => <Harness initial={{ profile: 'none', nutAllergy: false }} status="🎲 Rolled lunch for 4 days. Drink and Extended Day are still up to you." />,
};
export const CardOneDay: Story = { name: 'Card — just the day', render: () => <Harness initial={{ profile: 'none', nutAllergy: false }} scope="day" /> };

export const ModalNoDiet: Story = { name: 'Modal — no diet', render: () => <Harness open initial={{ profile: 'none', nutAllergy: false }} /> };
export const ModalVeganNut: Story = { name: 'Modal — vegan + nut allergy', render: () => <Harness open initial={{ profile: 'vegan', nutAllergy: true }} /> };
export const ModalHalal: Story = { name: 'Modal — halal', render: () => <Harness open initial={{ profile: 'halal', nutAllergy: false }} /> };
