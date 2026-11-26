import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SQL } from 'bun';

type User = {
  id: string;
  username: string;
  name: string;
  email: string;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Add it to backend/.env.');
  process.exit(1);
}

const sql = new SQL(databaseUrl);

const schema = readFileSync(join(import.meta.dir, 'schema', '001_users.sql'), 'utf8');
try {
  await sql.unsafe(schema);
} catch (error) {
  console.error('Could not initialize the database schema. Check DATABASE_URL.', error);
  process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseEmail(body: unknown) {
  const email =
    typeof body === 'object' && body !== null && 'email' in body && typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }

  return email;
}

function randomUsername() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i += 1) {
    result += charset[randomInt(0, charset.length)];
  }
  return `limoid_${result}`;
}

function isUniqueViolation(error: unknown): error is { code: '23505'; constraint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

async function signUp(email: string): Promise<User> {
  const existing = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    throw new HttpError(409, 'This email already has an account. Sign in instead.');
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const username = randomUsername();

    try {
      const rows = await sql<User[]>`
        INSERT INTO users (username, name, email)
        VALUES (${username}, ${''}, ${email})
        RETURNING id, username, name, email
      `;
      const user = rows[0];
      if (!user) throw new HttpError(500, 'Could not create the account. Try again.');
      return user;
    } catch (error) {
      if (isUniqueViolation(error)) {
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

async function signIn(email: string): Promise<User> {
  const rows = await sql<User[]>`
    SELECT id, username, name, email FROM users WHERE email = ${email} LIMIT 1
  `;
  const user = rows[0];
  if (!user) {
    throw new HttpError(404, 'No account found for this email. Sign up instead.');
  }
  return user;
}

async function updateName(email: string, name: string): Promise<User> {
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 50) {
    throw new HttpError(400, 'Name must be between 1 and 50 characters.');
  }

  const rows = await sql<User[]>`
    UPDATE users SET name = ${trimmedName} WHERE email = ${email}
    RETURNING id, username, name, email
  `;
  const user = rows[0];
  if (!user) {
    throw new HttpError(404, 'No account found for this email.');
  }
  return user;
}

async function route(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'GET' && pathname === '/health') {
    return json({ ok: true });
  }

  if (request.method === 'POST' && (pathname === '/auth/signup' || pathname === '/auth/signin')) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, 'Invalid request body.');
    }

    const email = parseEmail(body);
    const user = pathname === '/auth/signup' ? await signUp(email) : await signIn(email);
    return json({ user });
  }

  if (request.method === 'POST' && pathname === '/auth/update-name') {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, 'Invalid request body.');
    }

    const email = parseEmail(body);
    const name =
      typeof body === 'object' && body !== null && 'name' in body && typeof body.name === 'string'
        ? body.name
        : '';

    if (!name) {
      throw new HttpError(400, 'Name is required.');
    }

    const user = await updateName(email, name);
    return json({ user });
  }

  throw new HttpError(404, 'Not found.');
}

Bun.serve({
  hostname: process.env.HOST ?? '0.0.0.0',
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
