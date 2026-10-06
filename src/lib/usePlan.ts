import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { DietPrefs } from './diet';
import { emptyDayPlan, emptyPlan, type DayPlan, type ParentDetails, type PlanState } from './plan';

/** Fill in fields added after a plan was saved, so older saves keep loading. */
export function revivePlan(saved: PlanState): PlanState {
  const base = emptyPlan();
  return {
    ...base,
    ...saved,
    details: {
      ...base.details,
      ...saved.details,
      // Only Girl / Boy are offered now; drop anything else saved earlier.
      gender: saved.details?.gender === 'girl' || saved.details?.gender === 'boy' ? saved.details.gender : '',
    },
    diet: { ...base.diet, ...saved.diet },
    // Plans saved before sign-up steps existed: already set up if a child is named.
    onboarded: saved.onboarded ?? Boolean(saved.details?.childName),
  };
}

const SAVE_DELAY_MS = 500;

/**
 * The parent's plan. `remote` loads it from /api/plan and saves changes shortly after each edit
 * (and when the page is hidden). Without `remote` it lives in memory (stories, prototype).
 */
export function usePlan(remote: boolean, initial?: PlanState) {
  const [plan, setPlan] = useState<PlanState>(() => initial ?? emptyPlan());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(remote ? 'loading' : 'ready');
  const [saveError, setSaveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const lastSaved = useRef<string | null>(null);
  const latest = useRef(plan);
  useEffect(() => {
    latest.current = plan;
  }, [plan]);

  useEffect(() => {
    if (!remote) return;
    let alive = true;
    api
      .getPlan()
      .then((r) => {
        if (!alive) return;
        const loaded = r.plan ? revivePlan(r.plan) : emptyPlan();
        lastSaved.current = JSON.stringify(loaded);
        setPlan(loaded);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, [remote, attempt]);

  // Save after edits settle.
  useEffect(() => {
    if (!remote || status !== 'ready') return;
    const body = JSON.stringify(plan);
    if (body === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      api
        .savePlan(plan)
        .then(() => {
          lastSaved.current = body;
          setSaveError(false);
        })
        .catch(() => setSaveError(true));
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [plan, remote, status]);

  // Leaving the page mid-edit: send whatever hasn't been saved yet.
  useEffect(() => {
    if (!remote) return;
    const flush = () => {
      if (document.visibilityState !== 'hidden' || lastSaved.current === null) return;
      const body = JSON.stringify(latest.current);
      if (body !== lastSaved.current) {
        lastSaved.current = body;
        void api.savePlan(latest.current, true).catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [remote]);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  const updateDay = useCallback((date: string, patch: Partial<DayPlan>) => {
    setPlan((p) => ({ ...p, days: { ...p.days, [date]: { ...emptyDayPlan(), ...p.days[date], ...patch } } }));
  }, []);

  /** Apply one field to several dates at once ("same all week"). */
  const updateDays = useCallback((dates: string[], patch: Partial<DayPlan>) => {
    setPlan((p) => {
      const days = { ...p.days };
      for (const date of dates) days[date] = { ...emptyDayPlan(), ...days[date], ...patch };
      return { ...p, days };
    });
  }, []);

  /** Apply a different patch to each date, e.g. a filled-in week. */
  const patchDays = useCallback((patches: Record<string, Partial<DayPlan>>) => {
    setPlan((p) => {
      const days = { ...p.days };
      for (const [date, patch] of Object.entries(patches)) days[date] = { ...emptyDayPlan(), ...days[date], ...patch };
      return { ...p, days };
    });
  }, []);

  const updateDiet = useCallback((patch: Partial<DietPrefs>) => setPlan((p) => ({ ...p, diet: { ...p.diet, ...patch } })), []);
  const finishOnboarding = useCallback(() => setPlan((p) => ({ ...p, onboarded: true })), []);
  const updateDetails = useCallback(
    (patch: Partial<ParentDetails>) => setPlan((p) => ({ ...p, details: { ...p.details, ...patch } })),
    [],
  );

  return { plan, status, saveError, retry, updateDay, updateDays, patchDays, updateDetails, updateDiet, finishOnboarding };
}
