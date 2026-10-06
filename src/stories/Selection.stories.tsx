import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChipSelect } from '../components/ChipSelect';
import { ChoiceCarousel, type CarouselOption } from '../components/ChoiceCarousel';
import { SectionHeader } from '../components/SectionHeader';
import { BREAKFAST_GRAINS, FRUIT_BAR, VEGGIE_BAR } from '../data/menu';
import { toggleBarPick } from '../lib/plan';
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

const LUNCH: CarouselOption<string>[] = [
  { value: 'hot', emoji: '🍕', overline: '“Pizzeria Style” · Hot lunch', title: 'Slice of Pizza', badges: ['Vegetarian'], fit: { tone: 'ok', label: 'Marked vegetarian' } },
  { value: 'sunbutter', emoji: '🥪', overline: 'Offered daily', title: 'Jammie Sunbutter & Jelly Sandwich', badges: ['Vegetarian'], fit: { tone: 'ok', label: 'Marked vegetarian' } },
  { value: 'home', emoji: '🎒', overline: 'From home', title: 'Packing lunch', subtitle: 'Skip school lunch today', fit: { tone: 'ok', label: 'You control what goes in' } },
];

export const SectionHeaders: Story = {
  render: () => (
    <>
      <SectionHeader title="Choose lunch" hint="Select 1" required />
      <SectionHeader title="Choose lunch" hint="Select 1" required done />
      <SectionHeader title="Veggie from the bar" hint="Pick 1 · may vary by day" />
    </>
  ),
};

export const CarouselUnanswered: Story = {
  name: 'Carousel — required, unanswered',
  render: function Render() {
    const [value, setValue] = useState<string>();
    return <ChoiceCarousel title="Choose a drink" hint="Select 1" required options={DRINKS} value={value} onChange={setValue} />;
  },
};

export const CarouselAnswered: Story = {
  name: 'Carousel — answered (8px cards)',
  render: function Render() {
    const [value, setValue] = useState<string>('1%');
    return <ChoiceCarousel title="Choose a drink" hint="Select 1" required options={DRINKS} value={value} onChange={setValue} />;
  },
};

export const CarouselDietLabels: Story = {
  name: 'Carousel — lunch with diet labels',
  render: function Render() {
    const [value, setValue] = useState<string>('hot');
    return <ChoiceCarousel title="Choose lunch" hint="Select 1" required options={LUNCH} value={value} onChange={setValue} />;
  },
};

export const SidesChips: Story = {
  name: 'Chips — sides with this lunch',
  render: function Render() {
    const day = dayOn('2026-10-06');
    const [selected, setSelected] = useState(day.sides);
    return (
      <ChipSelect
        title="Sides with this lunch"
        hint="Tap to remove"
        options={day.sides}
        selected={selected}
        onToggle={(s) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
      />
    );
  },
};

export const FruitVeggieBar: Story = {
  name: 'Chips — one veggie + one fruit',
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['Carrots', 'Raisins']);
    const toggle = (s: string) => setSelected((cur) => toggleBarPick(cur, s));
    return (
      <>
        <ChipSelect title="Veggie from the bar" hint="Pick 1 · may vary by day" options={VEGGIE_BAR} selected={selected} onToggle={toggle} single />
        <ChipSelect title="Fruit from the bar" hint="Pick 1 · may vary by day" options={FRUIT_BAR} selected={selected} onToggle={toggle} single />
      </>
    );
  },
};

export const BreakfastPick: Story = {
  name: 'Chips — breakfast whole-grain item',
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['Muffin']);
    return (
      <ChipSelect
        title="Whole-grain item"
        hint="Pick 1"
        options={BREAKFAST_GRAINS}
        selected={selected}
        onToggle={(s) => setSelected((cur) => (cur[0] === s ? [] : [s]))}
        single
      />
    );
  },
};
