import { useCallback, useEffect, useState } from 'react';
import { emptyDayPlan, emptyPlan, type DayPlan, type ParentDetails, type PlanState } from './plan';

const STORAGE_KEY = 'cheverus-lunch-plan:v1';

function load(): PlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyPlan(), ...JSON.parse(raw) };
  } catch {
    // Private mode or corrupt data — start fresh.
  }
  return emptyPlan();
}

/** Plan state persisted to this browser only. Nothing leaves the device. */
export function usePlan(initial?: PlanState) {
  const [plan, setPlan] = useState<PlanState>(() => initial ?? load());

  useEffect(() => {
    if (initial) return; // Stories pass fixtures; don't overwrite real data.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Storage unavailable — the plan still works for this session.
    }
  }, [plan, initial]);

  const updateDay = useCallback((date: string, patch: Partial<DayPlan>) => {
    setPlan((p) => ({
      ...p,
      days: { ...p.days, [date]: { ...emptyDayPlan(), ...p.days[date], ...patch } },
    }));
  }, []);

  /** Apply one field to several dates at once ("same all week"). */
  const updateDays = useCallback((dates: string[], patch: Partial<DayPlan>) => {
    setPlan((p) => {
      const days = { ...p.days };
      for (const date of dates) days[date] = { ...emptyDayPlan(), ...days[date], ...patch };
      return { ...p, days };
    });
  }, []);

  const updateDetails = useCallback((patch: Partial<ParentDetails>) => {
    setPlan((p) => ({ ...p, details: { ...p.details, ...patch } }));
  }, []);

  const clearDates = useCallback((dates: string[]) => {
    setPlan((p) => {
      const days = { ...p.days };
      for (const date of dates) delete days[date];
      return { ...p, days };
    });
  }, []);

  return { plan, updateDay, updateDays, updateDetails, clearDates };
}
