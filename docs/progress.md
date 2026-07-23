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
- [x] `scripts/create-nexcore.js` — 1-command CLI bootstrapping tool (`npm run create-nexcore <target-directory>`) with auto-generated database URL and random JWT secrets.
- [x] Git initialized with initial commit

**Phase 4 — javacore scaffold (COMPLETE)**
- [x] Maven project structure (`pom.xml`, Java 21, Spring Boot 3.4.2)
- [x] Flyway V1 SQL schema migration (`V1__init_schema.sql` for PostgreSQL)
- [x] JPA Entities (`User`, `UserRole`, `RefreshToken`, `BaseEntity` with UUID keys)
- [x] Spring Security 6 stateless JWT architecture (`JwtAuthenticationFilter`, `JwtTokenProvider`, `UserPrincipal`, `SecurityConfig`)
- [x] SOLID Service pattern (`IUserService` & `UserService`)
- [x] REST API Controllers (`AuthController` & `UserController` with `@Valid` input validation)
- [x] Global exception handling (`AppException` & `GlobalExceptionHandler`)
- [x] `scripts/create-javacore.js` — 1-command CLI bootstrapping tool (`npm run create-javacore <target-directory>`) with auto-generated database URL and random JWT secrets.

**Phase 5 — vitacore (React + Vite + TypeScript template) (COMPLETE)**
- [x] Vite 6 + React 19 + TypeScript standalone frontend template (`vitacore/`)
- [x] Vite dev server proxy configured (`/api` -> `http://localhost:8080` for Spring Boot backend integration)
- [x] `@forge/shared-types` integration (`ICurrentUser`, `ApiResponse`, etc.)
- [x] 1:1 Alignment with `nexcore`: UI primitives (`Button`, `Input`, `FormField`), design custom properties, and `LoginForm` layout
- [x] TanStack React Query architecture (`QueryProvider`, `useCurrentUser`, `useMutation`)
- [x] `scripts/create-vitacore.js` — 1-command CLI bootstrapping tool (`npm run create-vitacore <target-directory>`)
- [x] React Doctor Audit — Achieved **100/100 Great** score (`npx react-doctor@latest --verbose`), resolving function hoisting, `fetch` status checks, and web storage auth token security rules.

---

## Key Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Template folders | Single `forge\` parent | Easier browsing |
| Naming | `nexcore` / `javacore` / `vitacore` | Kernel-style naming |
| Java build | Maven | Standard, explicit |
| CSS approach | CSS Modules + CSS Custom Properties | No framework lock-in, full power |
| Auth pattern | Signed JWT in httpOnly cookie | olimpo-proven pattern, XSS safe |
| Shared types | `@forge/shared-types` npm package via `npm link` | Proper decoupling, monorepo workspace |
| UI primitives | 1:1 shared design across nexcore & vitacore | Consistent UI/UX across Next.js and Vite |
| React Doctor | Integrated script (`npm run doctor`) & 100% compliant | High code quality and performance invariants |

---

## Next Session: Where to Pick Up

**Immediate priorities:**
1. End-to-end integration testing: run `javacore` Spring Boot REST backend on port 8080 and test `vitacore` Vite SPA frontend against it.
2. End-to-end integration testing: run `nexcore` Next.js 15 App Router against a local PostgreSQL database.
3. Scaffold first domain module (e.g. `users-management` or `products`) in `nexcore` and `javacore` following `docs/module-guide.md`.

**Open decisions:**
- When to add OpenAPI / Swagger specification generation to `javacore`?
- When to implement the OAuth / Social Login module?

---

## Architecture Invariants (Never Break These)

1. `core/` never imports from `modules/`.
2. Modules never import from each other.
3. All business logic lives in services — never in route handlers.
4. All input validation happens at the route/controller layer.
5. `proxy.ts` is the single entry point for auth enforcement — don't duplicate auth checks in routes.
