import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { FamilyInfoForm, type ProfileSection } from '../components/FamilyInfoForm';
import { ProfilePage } from '../components/ProfilePage';
import type { Account } from '../lib/account';
import type { ParentDetails } from '../lib/plan';
import { ACCOUNT, DETAILS } from './fixtures';

function Harness({ initialTab, details: initialDetails = { ...DETAILS, gender: 'girl' } }: { initialTab: ProfileSection; details?: ParentDetails }) {
  const [tab, setTab] = useState(initialTab);
  const [details, setDetails] = useState(initialDetails);
  const [account, setAccount] = useState<Account>(ACCOUNT);
  return (
    <ProfilePage
      tab={tab}
      onTabChange={setTab}
      details={details}
      onDetailsChange={(p) => setDetails((d) => ({ ...d, ...p }))}
      account={account}
      onAccountChange={(p) => setAccount((a) => ({ ...a, ...p }))}
      onDone={fn()}
    />
  );
}

const meta = {
  title: 'Components/ProfilePage',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Parent full name, Email (plans move with it), Sign emails as. */
export const ParentInfo: Story = { render: () => <Harness initialTab="parent" /> };

/** Child's name, Gender, Grade dropdown, Teacher's name. */
export const ChildInfo: Story = { render: () => <Harness initialTab="child" /> };

export const ChildInfoEmpty: Story = {
  name: 'Child Info — not filled in',
  render: () => <Harness initialTab="child" details={{ ...DETAILS, childName: '', classroom: '', gender: '', teacherName: '' }} />,
};

/** Both sections stacked — used by the email card when it stands alone (no Profile page). */
export const InlineForm: Story = {
  name: 'Inline form (both sections)',
  parameters: { layout: 'padded' },
  render: function Render() {
    const [details, setDetails] = useState(DETAILS);
    return <FamilyInfoForm details={details} onChange={(p) => setDetails((d) => ({ ...d, ...p }))} />;
  },
};
