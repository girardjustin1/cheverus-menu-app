import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prototype } from '../prototype/Prototype';

const meta = {
  title: 'Prototype/Click-through',
  component: Prototype,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The full prototype, start to finish: sign in → sign-up steps → Plan modal → plan → Save draft / Copy email → Past orders. Tap any text field to fill it. Same as `npm run prototype` (http://localhost:5190/prototype.html).',
      },
    },
  },
} satisfies Meta<typeof Prototype>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartToFinish: Story = { name: 'Start to finish' };
