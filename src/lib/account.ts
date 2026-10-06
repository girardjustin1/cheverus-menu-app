import { useCallback, useState } from 'react';
import { accountKey, readJSON, writeJSON } from './storage';

export interface Account {
  fullName: string;
  email: string;
}

const ACCOUNT_KEY = 'cheverus:account:v1';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAccount(input: Account): Partial<Record<keyof Account, string>> {
  const errors: Partial<Record<keyof Account, string>> = {};
  if (input.fullName.trim().split(/\s+/).filter(Boolean).length < 2) errors.fullName = 'Enter your first and last name';
  if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid email';
  return errors;
}

export const initials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/**
 * Prototype sign-in: remembers who you are on this device. There is no password and no
 * server — it only scopes saved plans and order history to this name and email.
 */
export function useAccount(initial?: Account | null) {
  const [account, setAccount] = useState<Account | null>(() =>
    initial !== undefined ? initial : (readJSON<Account>(ACCOUNT_KEY) ?? null),
  );
  const persist = initial === undefined;
  /** Bumps on each sign-in, so the signed-in view remounts for a new session only. */
  const [session, setSession] = useState(0);

  const signIn = useCallback(
    (next: Account) => {
      const clean = { fullName: next.fullName.trim(), email: next.email.trim() };
      setAccount(clean);
      setSession((n) => n + 1);
      if (persist) writeJSON(ACCOUNT_KEY, clean);
    },
    [persist],
  );

  /**
   * Edit name or email while signed in. A new email carries the saved plan and order history
   * with it (they're stored per email).
   */
  const updateAccount = useCallback(
    (patch: Partial<Account>) => {
      setAccount((current) => {
        if (!current) return current;
        const next = { ...current, ...patch };
        if (persist) {
          if (patch.email !== undefined && patch.email.trim().toLowerCase() !== current.email.trim().toLowerCase()) {
            for (const name of ['plan', 'orders']) {
              const data = readJSON(accountKey(current.email, name));
              if (data !== undefined) writeJSON(accountKey(next.email, name), data);
              writeJSON(accountKey(current.email, name), undefined);
            }
          }
          writeJSON(ACCOUNT_KEY, next);
        }
        return next;
      });
    },
    [persist],
  );

  const signOut = useCallback(() => {
    setAccount(null);
    if (persist) writeJSON(ACCOUNT_KEY, undefined);
  }, [persist]);

  return { account, session, signIn, signOut, updateAccount };
}
