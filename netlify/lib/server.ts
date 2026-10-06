import { createHash, randomBytes } from 'node:crypto';
import { getDatabase } from '@netlify/database';

/** Sign-ins last a year, and every visit pushes the expiry another year out. */
export const SESSION_DAYS = 365;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;
const COOKIE = 'cheverus_session';

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
}

export const db = () => getDatabase().sql;

export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body), { ...init, headers });
}

export const error = (status: number, message: string) => json({ error: message }, { status });

export const publicUser = (u: UserRow) => ({ fullName: u.full_name, email: u.email });

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

function readCookie(req: Request): string | undefined {
  const header = req.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function cookieHeader(value: string, maxAge: number, req: Request): string {
  // `Secure` everywhere except plain-http localhost during development.
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Start a year-long session for a user; returns the Set-Cookie header value. */
export async function createSession(userId: string, req: Request): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await db()`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${hash(token)}, ${userId}, now() + make_interval(days => ${SESSION_DAYS}))
  `;
  return cookieHeader(token, SESSION_SECONDS, req);
}

/**
 * The signed-in user, or null. A valid session is renewed for another year, and the returned
 * `setCookie` re-issues the cookie so the browser keeps it a year from now too.
 */
export async function currentUser(req: Request): Promise<{ user: UserRow; setCookie: string } | null> {
  const token = readCookie(req);
  if (!token) return null;
  const rows = (await db()`
    UPDATE sessions
       SET last_seen_at = now(), expires_at = now() + make_interval(days => ${SESSION_DAYS})
      FROM users
     WHERE sessions.token_hash = ${hash(token)}
       AND sessions.expires_at > now()
       AND users.id = sessions.user_id
    RETURNING users.id, users.full_name, users.email
  `) as UserRow[];
  if (!rows[0]) return null;
  return { user: rows[0], setCookie: cookieHeader(token, SESSION_SECONDS, req) };
}

export async function endSession(req: Request): Promise<string> {
  const token = readCookie(req);
  if (token) await db()`DELETE FROM sessions WHERE token_hash = ${hash(token)}`;
  return cookieHeader('', 0, req);
}

/** Postgres unique-violation (23505), even when the driver wraps the original error. */
export function isUniqueViolation(e: unknown): boolean {
  for (let cur = e as { code?: unknown; cause?: unknown } | undefined, depth = 0; cur && depth < 5; depth++) {
    if (cur.code === '23505') return true;
    cur = cur.cause as typeof cur;
  }
  return false;
}

/** Parse a JSON body, refusing anything over `maxBytes`. */
export async function readJson<T>(req: Request, maxBytes = 512 * 1024): Promise<T | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
