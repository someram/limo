import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SQL } from 'bun';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Add it to your .env file.');
  process.exit(1);
}

const sql = new SQL(databaseUrl);

const schema = readFileSync(join(import.meta.dir, '..', 'schema', '001_users.sql'), 'utf8');
await sql.unsafe(schema);

const port = Number(process.env.PORT ?? 3000);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function parseEmail(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  return email;
}

function randomUsername() {
  let digits = '';
  for (let i = 0; i < 5; i += 1) digits += randomInt(0, 10);
  return `limoid_${digits}`;
}

async function signUp(email) {
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    throw new HttpError(409, 'This email already has an account. Sign in instead.');
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const username = randomUsername();
    try {
      const rows = await sql`
        INSERT INTO users (username, email)
        VALUES (${username}, ${email})
        RETURNING id, username, email
      `;
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        if (String(error.constraint ?? '').includes('email')) {
          throw new HttpError(409, 'This email already has an account. Sign in instead.');
        }
        continue;
      }
      throw error;
    }
  }

  throw new HttpError(500, 'Could not generate a unique username. Try again.');
}

async function signIn(email) {
  const rows = await sql`SELECT id, username, email FROM users WHERE email = ${email} LIMIT 1`;
  if (rows.length === 0) {
    throw new HttpError(404, 'No account found for this email. Sign up instead.');
  }
  return rows[0];
}

async function route(request) {
  const { pathname } = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'GET' && pathname === '/health') {
    return json({ ok: true });
  }

  if (request.method === 'POST' && (pathname === '/auth/signup' || pathname === '/auth/signin')) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, 'Invalid request body.');
    }

    const email = parseEmail(body);
    const user = pathname === '/auth/signup' ? await signUp(email) : await signIn(email);
    return json({ user });
  }

  throw new HttpError(404, 'Not found.');
}

Bun.serve({
  port,
  async fetch(request) {
    try {
      return await route(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      console.error(error);
      return json({ error: 'Something went wrong.' }, 500);
    }
  },
});

console.log(`Limo auth server listening on http://localhost:${port}`);
