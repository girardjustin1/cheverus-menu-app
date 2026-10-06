import type { Config } from '@netlify/functions';
import { validateAccount, type AccountInput } from '../../src/lib/validate';
import { createSession, currentUser, db, endSession, error, isUniqueViolation, json, publicUser, readJson, type UserRow } from '../lib/server';

/**
 * /api/session
 *   GET    → the signed-in parent (and renews the year-long session), or { account: null }
 *   POST   → sign in with { fullName, email }; creates the account on first use
 *   PATCH  → update { fullName?, email? } for the signed-in parent
 *   DELETE → sign out
 */
export default async (req: Request) => {
  if (req.method === 'GET') {
    const session = await currentUser(req);
    if (!session) return json({ account: null });
    return json({ account: publicUser(session.user) }, { headers: { 'Set-Cookie': session.setCookie } });
  }

  if (req.method === 'POST') {
    const input = await readJson<AccountInput>(req, 4096);
    if (!input || typeof input.fullName !== 'string' || typeof input.email !== 'string') return error(400, 'Send fullName and email');
    const fullName = input.fullName.trim();
    const email = input.email.trim();
    const problems = validateAccount({ fullName, email });
    if (Object.keys(problems).length) return json({ error: 'Check the highlighted fields', fields: problems }, { status: 400 });

    // One account per email: signing in again with the same email returns to the same plans.
    const [user] = (await db()`
      INSERT INTO users (full_name, email, email_key)
      VALUES (${fullName}, ${email}, ${email.toLowerCase()})
      ON CONFLICT (email_key) DO UPDATE SET updated_at = now()
      RETURNING id, full_name, email
    `) as UserRow[];
    const setCookie = await createSession(user.id, req);
    return json({ account: publicUser(user) }, { headers: { 'Set-Cookie': setCookie } });
  }

  if (req.method === 'PATCH') {
    const session = await currentUser(req);
    if (!session) return error(401, 'Not signed in');
    const input = await readJson<Partial<AccountInput>>(req, 4096);
    if (!input) return error(400, 'Send fullName and/or email');
    const fullName = (input.fullName ?? session.user.full_name).trim();
    const email = (input.email ?? session.user.email).trim();
    const problems = validateAccount({ fullName, email });
    if (Object.keys(problems).length) return json({ error: 'Check the highlighted fields', fields: problems }, { status: 400 });
    try {
      const [user] = (await db()`
        UPDATE users SET full_name = ${fullName}, email = ${email}, email_key = ${email.toLowerCase()}, updated_at = now()
         WHERE id = ${session.user.id}
        RETURNING id, full_name, email
      `) as UserRow[];
      return json({ account: publicUser(user) }, { headers: { 'Set-Cookie': session.setCookie } });
    } catch (e) {
      if (isUniqueViolation(e)) return json({ error: 'That email already has an account', fields: { email: 'That email already has an account' } }, { status: 409 });
      throw e;
    }
  }

  if (req.method === 'DELETE') {
    return json({ account: null }, { headers: { 'Set-Cookie': await endSession(req) } });
  }

  return error(405, 'Method not allowed');
};

export const config: Config = { path: '/api/session' };
