import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import type { ProfileSection } from '../components/FamilyInfoForm';
import { Onboarding } from '../components/Onboarding';
import type { Account } from '../lib/account';
import { emptyPlan } from '../lib/plan';
import { ACCOUNT } from './fixtures';

function Harness({ initialStep }: { initialStep: ProfileSection }) {
  const [step, setStep] = useState(initialStep);
  const [details, setDetails] = useState(emptyPlan().details);
  const [account, setAccount] = useState<Account>(ACCOUNT);
  return (
    <Onboarding
      step={step}
      onStepChange={setStep}
      account={account}
      onAccountChange={(p) => setAccount((a) => ({ ...a, ...p }))}
      details={details}
      onDetailsChange={(p) => setDetails((d) => ({ ...d, ...p }))}
      onFinish={fn()}
    />
  );
}

const meta = {
  title: 'Components/Onboarding (sign-up)',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1ParentInfo: Story = { name: 'Step 1 — Parent info', render: () => <Harness initialStep="parent" /> };
export const Step2ChildInfo: Story = { name: 'Step 2 — Child info', render: () => <Harness initialStep="child" /> };
