import { describe, expect, it } from 'vitest';
import { formatHash, nextRoute, parseHash } from './router';

describe('hash router', () => {
  it('parses and formats deep links', () => {
    const route = parseHash('#/plan?mode=week&week=2026-10-05&day=2026-10-08');
    expect(route).toEqual({ path: '/plan', params: { mode: 'week', week: '2026-10-05', day: '2026-10-08' } });
    expect(formatHash(route)).toBe('#/plan?mode=week&week=2026-10-05&day=2026-10-08');
    expect(parseHash('')).toEqual({ path: '/plan', params: {} });
  });

  it('merges params, removes undefined ones, and resets on path change', () => {
    const plan = parseHash('#/plan?mode=week&day=2026-10-06');
    expect(nextRoute(plan, { params: { day: '2026-10-07', modal: 'diet' } }).params).toEqual({
      mode: 'week',
      day: '2026-10-07',
      modal: 'diet',
    });
    expect(nextRoute(plan, { params: { mode: undefined } }).params).toEqual({ day: '2026-10-06' });
    expect(nextRoute(plan, { path: '/orders' })).toEqual({ path: '/orders', params: {} });
    expect(nextRoute(plan, { path: '/orders', keepParams: true }).params).toEqual(plan.params);
  });
});
