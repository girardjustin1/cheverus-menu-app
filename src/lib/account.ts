import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';
import { validateAccount } from './validate';

export { validateAccount };

export interface Account {
  fullName: string;
  email: string;
}

export const initials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/**
 * The signed-in parent. With `initial` (stories, prototype) it lives in memory; otherwise it comes
 * from the server session — an HttpOnly cookie that lasts a year and renews on every visit.
 */
export function useAccount(initial?: Account | null) {
  const memory = initial !== undefined;
  const [account, setAccountState] = useState<Account | null>(memory ? initial : null);
  // Latest account for event handlers (state updaters may run later).
  const accountRef = useRef(account);
  const setAccount = useCallback((next: Account | null) => {
    accountRef.current = next;
    setAccountState(next);
  }, []);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(memory ? 'ready' : 'loading');
  /** Bumps on each sign-in, so the signed-in view remounts for a new session only. */
  const [session, setSession] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (memory) return;
    let alive = true;
    api
      .getSession()
      .then((r) => {
        if (!alive) return;
        setAccount(r.account);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, [memory, attempt, setAccount]);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  /** Throws ApiError (with `fields`) when the server rejects the details. */
  const signIn = useCallback(
    async (next: Account) => {
      const clean = { fullName: next.fullName.trim(), email: next.email.trim() };
      const saved = memory ? clean : (await api.signIn(clean)).account;
      setAccount(saved);
      setSession((n) => n + 1);
    },
    [memory, setAccount],
  );

  const signOut = useCallback(async () => {
    if (!memory) await api.signOut().catch(() => undefined);
    setAccount(null);
  }, [memory, setAccount]);

  // Name edits arrive per keystroke: save the latest valid one after a pause.
  const pending = useRef<number | undefined>(undefined);
  const updateAccount = useCallback(
    async (patch: Partial<Account>): Promise<ApiError | null> => {
      const current = accountRef.current;
      if (!current) return null;
      const candidate: Account = { ...current, ...patch };
      setAccount(candidate);
      if (memory) return null;
      if (Object.keys(validateAccount(candidate)).length) return null;
      window.clearTimeout(pending.current);
      if (patch.email === undefined) {
        pending.current = window.setTimeout(() => void api.updateAccount({ fullName: candidate.fullName }).catch(() => undefined), 600);
        return null;
      }
      try {
        const r = await api.updateAccount(candidate);
        setAccount(r.account);
        return null;
      } catch (e) {
        setAccount(current); // the server said no (e.g. that email is taken): roll back
        return e instanceof ApiError ? e : new ApiError(0, 'Could not save');
      }
    },
    [memory, setAccount],
  );

  return { account, status, retry, session, signIn, signOut, updateAccount };
}
