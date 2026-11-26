# Limo backend

Bun + Postgres auth API for the Limo app.

## Setup

```bash
bun install
```

Create `backend/.env`:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/limo_db"
PORT=3000
```

Bun loads `.env` automatically. The server creates the `users` table from `schema/001_users.sql` on startup.

## Run

```bash
bun run dev     # watch mode
bun run start   # once
```

## Endpoints

- `GET /health`
- `POST /auth/signup` with `{ "email": "..." }`
- `POST /auth/signin` with `{ "email": "..." }`

Sign up generates a non-editable username in the form `limoid_xxxxx` and stores the user in Postgres. Sign in looks the user up by email.

## Type check

```bash
bun run typecheck
```
