import { useCallback } from 'react';
import type { DietPrefs } from './diet';
import { emptyDayPlan, emptyPlan, type DayPlan, type ParentDetails, type PlanState } from './plan';
import { useStoredState } from './storage';

/** Fill in fields added after a plan was saved, so older saves keep loading. */
function revive(saved: PlanState): PlanState {
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

/**
 * Plan state saved to this browser under `storageKey` (per account). Pass `null` to keep it
 * in memory only. Nothing leaves the device.
 */
export function usePlan(storageKey: string | null, initial?: PlanState) {
  const [plan, setPlan] = useStoredState<PlanState>(storageKey, () => initial ?? emptyPlan(), revive);

  const updateDay = useCallback(
    (date: string, patch: Partial<DayPlan>) => {
      setPlan((p) => ({
        ...p,
        days: { ...p.days, [date]: { ...emptyDayPlan(), ...p.days[date], ...patch } },
      }));
    },
    [setPlan],
  );

  /** Apply one field to several dates at once ("same all week"). */
  const updateDays = useCallback(
    (dates: string[], patch: Partial<DayPlan>) => {
      setPlan((p) => {
        const days = { ...p.days };
        for (const date of dates) days[date] = { ...emptyDayPlan(), ...days[date], ...patch };
        return { ...p, days };
      });
    },
    [setPlan],
  );

  /** Apply a different patch to each date, e.g. a filled-in week. */
  const patchDays = useCallback(
    (patches: Record<string, Partial<DayPlan>>) => {
      setPlan((p) => {
        const days = { ...p.days };
        for (const [date, patch] of Object.entries(patches)) days[date] = { ...emptyDayPlan(), ...days[date], ...patch };
        return { ...p, days };
      });
    },
    [setPlan],
  );

  const updateDiet = useCallback(
    (patch: Partial<DietPrefs>) => setPlan((p) => ({ ...p, diet: { ...p.diet, ...patch } })),
    [setPlan],
  );

  const finishOnboarding = useCallback(() => setPlan((p) => ({ ...p, onboarded: true })), [setPlan]);

  const updateDetails = useCallback(
    (patch: Partial<ParentDetails>) => setPlan((p) => ({ ...p, details: { ...p.details, ...patch } })),
    [setPlan],
  );

  return { plan, updateDay, updateDays, patchDays, updateDetails, updateDiet, finishOnboarding };
}
