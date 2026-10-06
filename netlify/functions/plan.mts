import type { Config } from '@netlify/functions';
import { currentUser, db, error, json, readJson } from '../lib/server';

/**
 * /api/plan — the signed-in parent's whole plan (days, family info, diet, onboarding).
 *   GET → { plan } (null until first saved)
 *   PUT → save { plan }
 */
export default async (req: Request) => {
  const session = await currentUser(req);
  if (!session) return error(401, 'Not signed in');
  const headers = { 'Set-Cookie': session.setCookie };

  if (req.method === 'GET') {
    const rows = (await db()`SELECT data FROM plans WHERE user_id = ${session.user.id}`) as { data: unknown }[];
    return json({ plan: rows[0]?.data ?? null }, { headers });
  }

  if (req.method === 'PUT') {
    const body = await readJson<{ plan: unknown }>(req);
    if (!body || typeof body.plan !== 'object' || body.plan === null || Array.isArray(body.plan)) {
      return error(400, 'Send { plan }');
    }
    await db()`
      INSERT INTO plans (user_id, data, updated_at)
      VALUES (${session.user.id}, ${JSON.stringify(body.plan)}::jsonb, now())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return json({ ok: true }, { headers });
  }

  return error(405, 'Method not allowed');
};

export const config: Config = { path: '/api/plan' };
