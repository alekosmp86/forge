# Forge — Progress Log

## Session: 2026-07-22

### What Was Built

**Phase 1 — Documentation & Standards (COMPLETE)**
- [x] `AGENTS.md` — Updated with full architecture rules, SOLID principles, auth patterns, CSS standards, DB patterns, and documentation requirements.
- [x] `docs\architecture.md` — Full architecture reference including design system tokens, auth flow, and stack decisions.
- [x] `docs\module-guide.md` — Step-by-step guide for adding a new module to nexcore (with code examples).
- [x] `docs\deployment-guide.md` — Complete Vercel deployment and project bootstrapping guide.
- [x] `docs\progress.md` — This file.
- [x] GitHub Repository — Linked to `https://github.com/alekosmp86/forge` and pushed monorepo tree.

**Phase 2 — shared-types package (COMPLETE)**
- [x] `packages\shared-types\` — npm package `@forge/shared-types` with core DTOs: `ICurrentUser`, `ITokenPayload`, `ITokenPair`, `UserRole`, `ApiResponse<T>`, `PaginatedResponse<T>`.

**Phase 3 — nexcore (Next.js 15 template) (COMPLETE)**
- [x] Next.js 15 project initialized (App Router, TypeScript, CSS Modules, ESLint)
- [x] `src/core/types.ts` — Core contracts
- [x] `src/core/errors/` — `AppError` base class, HTTP error helpers
- [x] `src/core/validation/schemas.ts` — Reusable Zod schemas
- [x] `src/core/db/client.ts` — Prisma singleton with pg adapter (v7 pattern)
- [x] `src/core/auth/tokens.ts` — JWT sign/verify with `jose`
- [x] `src/core/auth/session.ts` — createSession/deleteSession/validateSession
- [x] `src/core/auth/types.ts` — Auth type definitions
- [x] `src/core/user/IUserService.ts` — User service interface
- [x] `src/core/user/UserService.ts` — User service implementation
- [x] `src/core/user/types.ts` — User type definitions
- [x] `src/proxy.ts` — Route protection proxy (Next.js 15 pattern)
- [x] `src/middleware.ts` — Re-exports from proxy.ts
- [x] `prisma/schema.prisma` — User + RefreshToken + UserRole models
- [x] `src/app/globals.css` — Full design system with CSS custom properties
- [x] `src/components/ui/` — Base UI primitives: Button, Input, FormField, Badge, Spinner, Card
- [x] `src/app/(auth)/login/` — Premium login page with animations
- [x] `src/app/(app)/layout.tsx` — Protected app shell
- [x] `src/app/api/auth/login/` — Login API route
- [x] `src/app/api/auth/logout/` — Logout API route
- [x] `src/app/providers.tsx` — TanStack Query provider
- [x] `src/hooks/useCurrentUser.ts` — Current user hook
- [x] `.agents/AGENTS.md` — Repo-specific rules
- [x] Git initialized with initial commit

**Phase 4 — javacore scaffold**
- [ ] **NOT STARTED.** To be built in a future session.

---

## Key Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Template folders | Single `forge\` parent | Easier browsing |
| Naming | `nexcore` / `javacore` | Kernel-style naming |
| Java build | Maven | Standard, explicit |
| CSS approach | CSS Modules + CSS Custom Properties | No framework lock-in, full power |
| Auth pattern | Signed JWT in httpOnly cookie (`session.ts` + `proxy.ts`) | olimpo-proven pattern |
| Shared types | `@forge/shared-types` npm package via `npm link` | Proper decoupling, learn npm link |
| UI primitives | Included in initial template | Saves time on every project |
| Modules | Not implemented — only documented | User decides which modules to add |

---

## Next Session: Where to Pick Up

**Immediate priorities:**
1. Test the nexcore login page end-to-end (needs a running PostgreSQL instance)
2. Scaffold `javacore` (Spring Boot 3 + Hibernate + Security)
3. Consider adding a `users-management` module to nexcore as a reference example

**Open decisions:**
- Should `javacore` also have a `shared-types` integration (e.g., generate TypeScript from Java DTOs via OpenAPI)?
- When to add the OAuth module?

---

## Architecture Invariants (Never Break These)

1. `core/` never imports from `modules/`.
2. Modules never import from each other.
3. All business logic lives in services — never in route handlers.
4. All input validation happens at the route/controller layer.
5. `proxy.ts` is the single entry point for auth enforcement — don't duplicate auth checks in routes.
