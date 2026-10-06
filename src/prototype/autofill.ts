import { createContext, useContext } from 'react';

/** Sample values used by the click-through prototype. */
export const DEMO_VALUES = {
  fullName: 'Jordan Rivera',
  email: 'jordan@example.com',
  childName: 'Sam',
  teacherName: 'Ms. Smith',
  parentName: 'Jordan Rivera',
  note: 'Early pickup at 3:00 for a dentist appointment',
} as const;

export type DemoField = keyof typeof DEMO_VALUES;

/** True inside the prototype (see AutofillProvider). */
export const AutofillContext = createContext(false);

/**
 * Props for a TextField: in the prototype, tapping an empty field fills it with sample data.
 * Outside the prototype this returns nothing, so fields behave normally.
 */
export function useAutofill() {
  const on = useContext(AutofillContext);
  return (field: DemoField, value: string, set: (value: string) => void) => {
    if (!on) return {};
    const fill = () => {
      if (!value) set(DEMO_VALUES[field]);
    };
    return { onFocus: fill, onClick: fill };
  };
}
