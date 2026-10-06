import type { Account } from './account';
import type { OrderRecord } from './history';
import type { PlanState } from './plan';

/** An API failure; `fields` carries per-field messages (e.g. a taken email). */
export class ApiError extends Error {
  status: number;
  fields?: Partial<Record<keyof Account, string>>;
  constructor(status: number, message: string, fields?: Partial<Record<keyof Account, string>>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function call<T>(method: string, path: string, body?: unknown, keepalive = false): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      keepalive,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'You appear to be offline.');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: ApiError['fields'] } & T;
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.fields);
  return data;
}

/** The Netlify Functions API (netlify/functions/*). The session lives in an HttpOnly cookie. */
export const api = {
  getSession: () => call<{ account: Account | null }>('GET', '/api/session'),
  signIn: (account: Account) => call<{ account: Account }>('POST', '/api/session', account),
  updateAccount: (patch: Partial<Account>) => call<{ account: Account }>('PATCH', '/api/session', patch),
  signOut: () => call<{ account: null }>('DELETE', '/api/session'),
  getPlan: () => call<{ plan: PlanState | null }>('GET', '/api/plan'),
  savePlan: (plan: PlanState, keepalive = false) => call<{ ok: true }>('PUT', '/api/plan', { plan }, keepalive),
  listOrders: () => call<{ orders: OrderRecord[] }>('GET', '/api/orders'),
  saveOrder: (order: OrderRecord) => call<{ ok: true; id: string }>('POST', '/api/orders', { order }),
  deleteOrder: (id: string) => call<{ ok: true }>('DELETE', `/api/orders/${encodeURIComponent(id)}`),
};
