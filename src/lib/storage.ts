import { useEffect, useState } from 'react';

/** Read JSON from localStorage; returns undefined when missing, blocked or corrupt. */
export function readJSON<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode) — state still works for this session.
  }
}

/**
 * useState mirrored to localStorage under `key`. Pass `key: null` to keep state in memory
 * only (used by stories so fixtures never overwrite real data).
 */
export function useStoredState<T>(key: string | null, init: () => T, revive: (saved: T) => T = (s) => s) {
  const [state, setState] = useState<T>(() => {
    const saved = key ? readJSON<T>(key) : undefined;
    return saved === undefined ? init() : revive(saved);
  });
  useEffect(() => {
    if (key) writeJSON(key, state);
  }, [key, state]);
  return [state, setState] as const;
}

/** Storage keys are per account email, so two parents on one device don't share plans. */
export const accountKey = (email: string, name: string) => `cheverus:${email.trim().toLowerCase()}:${name}:v1`;
