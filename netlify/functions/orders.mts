import type { Config, Context } from '@netlify/functions';
import type { OrderRecord } from '../../src/lib/history';
import { currentUser, db, error, json, readJson } from '../lib/server';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function valid(o: Partial<OrderRecord> | null): o is OrderRecord {
  return Boolean(
    o &&
      typeof o.id === 'string' &&
      o.id.length <= 64 &&
      typeof o.weekMonday === 'string' &&
      ISO_DATE.test(o.weekMonday) &&
      (o.date === undefined || (typeof o.date === 'string' && ISO_DATE.test(o.date))) &&
      ['draft', 'copy', 'mail'].includes(String(o.method)) &&
      typeof o.body === 'string' &&
      typeof o.subject === 'string' &&
      typeof o.sentAt === 'string',
  );
}

/**
 * /api/orders — emails to school staff.
 *   GET           → { orders } newest first
 *   POST          → save one { order }. A draft replaces that week's (or day's) earlier draft;
 *                   sending clears the draft, and re-sending the identical email just bumps its time.
 *   DELETE /:id   → remove one
 */
export default async (req: Request, context: Context) => {
  const session = await currentUser(req);
  if (!session) return error(401, 'Not signed in');
  const headers = { 'Set-Cookie': session.setCookie };
  const userId = session.user.id;
  const sql = db();

  if (req.method === 'GET') {
    const rows = (await sql`SELECT data FROM orders WHERE user_id = ${userId} ORDER BY sent_at DESC`) as { data: OrderRecord }[];
    return json({ orders: rows.map((r) => r.data) }, { headers });
  }

  if (req.method === 'POST') {
    const body = await readJson<{ order: Partial<OrderRecord> }>(req);
    const order = body?.order ?? null;
    if (!valid(order)) return error(400, 'Send a valid { order }');
    const day = order.date ?? null;

    if (order.method === 'draft') {
      await sql`DELETE FROM orders WHERE user_id = ${userId} AND method = 'draft' AND week_monday = ${order.weekMonday} AND day IS NOT DISTINCT FROM ${day}::date`;
    } else {
      await sql`DELETE FROM orders WHERE user_id = ${userId} AND method = 'draft' AND week_monday = ${order.weekMonday} AND day IS NOT DISTINCT FROM ${day}::date`;
      const resent = (await sql`
        UPDATE orders
           SET sent_at = ${order.sentAt}, method = ${order.method},
               data = jsonb_set(jsonb_set(data, '{sentAt}', to_jsonb(${order.sentAt}::text)), '{method}', to_jsonb(${order.method}::text))
         WHERE user_id = ${userId} AND method <> 'draft' AND week_monday = ${order.weekMonday} AND day IS NOT DISTINCT FROM ${day}::date AND body = ${order.body}
        RETURNING id
      `) as { id: string }[];
      if (resent.length) return json({ ok: true, id: resent[0].id }, { headers });
    }

    await sql`
      INSERT INTO orders (id, user_id, week_monday, day, method, body, sent_at, data)
      VALUES (${order.id}, ${userId}, ${order.weekMonday}, ${day}, ${order.method}, ${order.body}, ${order.sentAt}, ${JSON.stringify(order)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET method = EXCLUDED.method, body = EXCLUDED.body, sent_at = EXCLUDED.sent_at, data = EXCLUDED.data
    `;
    return json({ ok: true, id: order.id }, { headers });
  }

  if (req.method === 'DELETE') {
    const id = context.params.id;
    if (!id) return error(400, 'Missing order id');
    await sql`DELETE FROM orders WHERE user_id = ${userId} AND id = ${id}`;
    return json({ ok: true }, { headers });
  }

  return error(405, 'Method not allowed');
};

export const config: Config = { path: ['/api/orders', '/api/orders/:id'] };
