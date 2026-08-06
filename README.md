# Career Rise

Cohort-based learning platform. Modular-monolith backend (NestJS), Next.js frontend, Postgres + Redis.

This is the Phase 4 scaffold: monorepo structure, Prisma schema, Docker Compose infra, and a working
auth module (JWT access/refresh + RBAC). See `/plans` (or ask the assistant) for the full Phase 4 plan
and the design decisions made while scaffolding — several extend the original design doc and are
called out explicitly there (FK conventions, a schema change to `Evidence`/`Attendance`, refresh-token
storage, etc).

## Structure

```
apps/
  api/    NestJS backend — modular monolith, Prisma, Redis, JWT auth
  web/    Next.js frontend
packages/
  shared/ TypeScript types shared between api and web (Role, API error shape)
```

## Setup

1. Copy the env file and fill in real secrets for local dev:

   ```
   cp .env.example .env
   ```

2. Install dependencies (root — installs all workspaces):

   ```
   npm install
   ```

3. Start Postgres + Redis:

   ```
   npm run docker:up
   ```

4. Generate the Prisma client and apply migrations:

   ```
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Run both apps in dev mode:

   ```
   npm run dev
   ```

   API: http://localhost:3001/api/v1
   Web: http://localhost:3000

   Or run one at a time: `npm run dev:api` / `npm run dev:web`.

## Testing

```
npm run test --workspace=apps/api        # unit tests
npm run test:e2e --workspace=apps/api    # e2e — requires docker:up + prisma:migrate first
```

## What's built so far (Phase 4)

- Full Prisma schema (`apps/api/prisma/schema.prisma`) with relations/indexes added on top of the
  approved design doc.
- `POST /auth/register` (STUDENT self-registration), `/auth/login`, `/auth/refresh`, `/auth/logout`.
- Global JWT auth guard + role-based `@Roles()` guard, uniform `{ error: { code, message, details } }`
  error shape.
- `GET/PATCH /users/me` — the one protected route in this phase, proving the guard chain works.

Everything else in the API contract (courses, cohorts, evidence, reviews, attendance, progress, the AI
proxy) is intentionally not built yet — each gets its own phase.
