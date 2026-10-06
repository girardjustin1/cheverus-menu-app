import type { ReactNode } from 'react';
import { AutofillContext } from './autofill';

/** Turns on tap-to-fill for every text field underneath. Used only by the prototype entry. */
export function AutofillProvider({ children }: { children: ReactNode }) {
  return <AutofillContext.Provider value>{children}</AutofillContext.Provider>;
}
