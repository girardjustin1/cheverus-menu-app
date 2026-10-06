import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChipSelect } from '../components/ChipSelect';
import { ChoiceCarousel, type CarouselOption } from '../components/ChoiceCarousel';
import { FRUIT_VEGGIE_BAR } from '../data/menu';
import { dayOn } from './fixtures';

const meta = {
  title: 'Components/Selection',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DRINKS: CarouselOption<string>[] = [
  { value: '1%', emoji: '🥛', title: '1% Milk' },
  { value: 'ff', emoji: '🥛', title: 'Fat-Free Milk' },
  { value: 'none', emoji: '🧃', title: 'No milk', subtitle: 'Sending a drink from home' },
];

export const CarouselUnanswered: Story = {
  name: 'Carousel — required, unanswered',
  render: function Render() {
    const [value, setValue] = useState<string>();
    return <ChoiceCarousel title="Choose a drink" hint="Select 1" required options={DRINKS} value={value} onChange={setValue} />;
  },
};

export const CarouselAnswered: Story = {
  name: 'Carousel — answered',
  render: function Render() {
    const [value, setValue] = useState<string>('1%');
    return <ChoiceCarousel title="Choose a drink" hint="Select 1" required options={DRINKS} value={value} onChange={setValue} />;
  },
};

export const SidesChips: Story = {
  name: 'Chips — sides to include',
  render: function Render() {
    const day = dayOn('2026-10-06');
    const [selected, setSelected] = useState(day.sides);
    return (
      <ChipSelect
        title="Sides to include"
        hint="Tap to remove"
        options={day.sides}
        selected={selected}
        onToggle={(s) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
      />
    );
  },
};

export const FruitVeggieBar: Story = {
  name: 'Chips — fruit & veggie bar',
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['Raisins']);
    return (
      <ChipSelect
        title="Fruit & veggie bar"
        hint="May include — not guaranteed daily"
        options={FRUIT_VEGGIE_BAR}
        selected={selected}
        onToggle={(s) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
      />
    );
  },
};
