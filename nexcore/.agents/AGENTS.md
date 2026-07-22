# nexcore — Repo-Specific Agent Context

## What This Repo Is

`nexcore` is the **Next.js 15 template** for the Forge project. It provides a fully wired kernel (auth, user, db, errors, validation) and a set of base UI components. New feature modules are added to `src/modules/`.

**Read the global AGENTS.md at `d:\Projects\AGENTS.md` first. All global rules apply here.**

---

## Project Structure

```
src/
├── core/           ← THE KERNEL — do not add business logic here
│   ├── auth/       ← Session JWT (tokens.ts, session.ts, types.ts)
│   ├── db/         ← Prisma singleton (client.ts)
│   ├── errors/     ← AppError + HTTP helpers
│   ├── user/       ← IUserService interface + UserService impl + types
│   ├── validation/ ← Reusable Zod schemas
│   └── types.ts    ← Core contracts (re-exports from @forge/shared-types)
├── modules/        ← Feature modules go here (see docs/module-guide.md)
├── components/ui/  ← Atomic UI primitives (Button, Input, FormField...)
├── hooks/          ← Shared React hooks
├── app/
│   ├── (auth)/login/   ← Login page + LoginForm component
│   ├── (app)/          ← Protected pages (session validated in layout)
│   └── api/auth/       ← Login + logout endpoints
└── proxy.ts        ← Route protection logic (Next.js 16+ proxy file)
```

## Key Invariants

1. `core/` never imports from `modules/`.
2. Modules never import from each other.
3. Session verification is handled by `proxy.ts` (route level) AND `(app)/layout.tsx` (page level). Do not create a `middleware.ts` file alongside `proxy.ts`.
4. All Prisma queries must go through `src/core/db/client.ts`.
5. The `@forge/shared-types` package is npm-linked. If you change types there, run `npm run build` in `forge\packages\shared-types\` first.
6. **React Doctor Verification**: Run `npm run doctor` to verify component health, security, and Fast Refresh compliance (no non-component exports in `.tsx` files).

## Running the App

```bash
# 1. Copy .env.example → .env and fill in DATABASE_URL + SESSION_SECRET
cp .env.example .env

# 2. Create the database and run migrations
npm run db:migrate

# 3. Start dev server
npm run dev
```

## Adding a New Module

See `docs\module-guide.md` for step-by-step instructions.

## Tech Notes

- **Prisma v7:** Uses `@prisma/adapter-pg` + `pg` pool. See `src/core/db/client.ts`.
- **Next.js 15 proxy:** `src/proxy.ts` = logic, `src/middleware.ts` = re-export only.
- **CSS:** CSS Modules + CSS Custom Properties from `src/app/globals.css`.
- **No Tailwind.** Do not add it unless the user explicitly requests it.
