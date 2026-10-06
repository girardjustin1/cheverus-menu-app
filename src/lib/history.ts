import { useCallback } from 'react';
import type { MenuDay } from '../data/menu';
import type { EmailDraft } from './email';
import { lunchLabel, type PlanMode, type PlanState } from './plan';
import { useStoredState } from './storage';

export type SendMethod = 'copy' | 'mail';
/** 'draft' = saved but not sent yet. */
export type OrderMethod = SendMethod | 'draft';

export interface OrderDaySummary {
  date: string;
  lunch?: string;
  drink?: string;
  edp?: string;
}

/** One email to school staff: sent (copied / opened in Mail) or saved as a draft. */
export interface OrderRecord {
  id: string;
  /** ISO date of the Monday of the planned week. */
  weekMonday: string;
  /** Set when the email covered a single day. */
  date?: string;
  childName: string;
  subject: string;
  body: string;
  /** When it was sent, or when the draft was last saved. */
  sentAt: string;
  method: OrderMethod;
  days: OrderDaySummary[];
  /** Weekly emails only: the same plan split into one email per day, so each day can be sent alone. */
  dayEmails?: DayEmail[];
}

export interface DayEmail {
  date: string;
  subject: string;
  body: string;
}

export function summarizeDays(days: MenuDay[], plan: PlanState): OrderDaySummary[] {
  return days
    .filter((d) => !d.noSchool && plan.days[d.date])
    .map((d) => {
      const p = plan.days[d.date];
      return {
        date: d.date,
        lunch: p.lunch && lunchLabel(d, p.lunch),
        drink: p.drink === 'none' ? 'Drink from home' : p.drink,
        edp: p.edp === undefined ? undefined : p.edp === 'no' ? 'No Extended Day' : `EDP until ${p.edp}`,
      };
    });
}

export const isDraft = (o: { method: OrderMethod }) => o.method === 'draft';

/** One sendable single-day email: either a single-day order, or one day of a weekly order. */
export interface DailyEmailItem {
  key: string;
  orderId: string;
  date: string;
  weekMonday: string;
  childName: string;
  subject: string;
  body: string;
  method: OrderMethod;
  sentAt: string;
  /** 'week' when it was split out of a weekly email. */
  source: PlanMode;
}

/** Every single-day email: day orders as-is, weekly orders split into their days. */
export function dailyItems(orders: OrderRecord[]): DailyEmailItem[] {
  const items: DailyEmailItem[] = [];
  for (const o of orders) {
    const base = { orderId: o.id, weekMonday: o.weekMonday, childName: o.childName, method: o.method, sentAt: o.sentAt };
    if (o.date) {
      items.push({ ...base, key: o.id, date: o.date, subject: o.subject, body: o.body, source: 'day' });
    } else {
      for (const d of o.dayEmails ?? []) {
        items.push({ ...base, key: `${o.id}:${d.date}`, date: d.date, subject: d.subject, body: d.body, source: 'week' });
      }
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || b.sentAt.localeCompare(a.sentAt));
}

/** A single-day email carries its date; a weekly one doesn't. */
export const orderType = (o: OrderRecord): PlanMode => (o.date ? 'day' : 'week');

const samePlan = (a: OrderRecord, b: OrderRecord) => a.weekMonday === b.weekMonday && a.date === b.date;

/**
 * Add a record, newest first.
 * - A draft replaces any earlier draft for the same week (or day).
 * - Sending clears that week's draft, and sending the exact same email again just refreshes
 *   the existing record's time, so tapping Copy twice doesn't log two orders.
 */
export function addOrder(history: OrderRecord[], record: OrderRecord): OrderRecord[] {
  if (isDraft(record)) {
    const old = history.find((h) => isDraft(h) && samePlan(h, record));
    return [{ ...record, id: old?.id ?? record.id }, ...history.filter((h) => h !== old)];
  }
  const withoutDraft = history.filter((h) => !(isDraft(h) && samePlan(h, record)));
  const same = withoutDraft.find((h) => !isDraft(h) && samePlan(h, record) && h.body === record.body);
  const rest = withoutDraft.filter((h) => h !== same);
  return [{ ...record, id: same?.id ?? record.id }, ...rest];
}

export interface LogOrderInput {
  weekMonday: string;
  date?: string;
  draft: EmailDraft;
  childName: string;
  days: OrderDaySummary[];
  method: OrderMethod;
  dayEmails?: DayEmail[];
}

export function useOrderHistory(storageKey: string | null, initial: OrderRecord[] = []) {
  const [history, setHistory] = useStoredState<OrderRecord[]>(storageKey, () => initial);

  const logOrder = useCallback(
    (input: LogOrderInput) => {
      const record: OrderRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        weekMonday: input.weekMonday,
        date: input.date,
        childName: input.childName,
        subject: input.draft.subject,
        body: input.draft.body,
        sentAt: new Date().toISOString(),
        method: input.method,
        days: input.days,
        dayEmails: input.dayEmails,
      };
      setHistory((h) => addOrder(h, record));
    },
    [setHistory],
  );

  const removeOrder = useCallback((id: string) => setHistory((h) => h.filter((o) => o.id !== id)), [setHistory]);

  return { history, logOrder, removeOrder };
}
