# Forge Architecture

## Vision

The **Forge** is a collection of template repositories ("kernels") that provide a stable, opinionated foundation for building web applications. The goal is to go from zero to a functional, authenticated app with a clear module structure in minutes — not days.

---

## The Kernel Mental Model

Think of the `core/` directory as the operating system kernel: it boots, manages the lowest-level services, and defines the contracts that all other code must respect. Business features ("modules") are user-space programs that run on top of the kernel.

```
┌──────────────────────────────────────────────┐
│                   KERNEL (core/)             │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │   auth/   │  │  user/   │  │   db/     │  │
│  │ JWT+RT    │  │ IUserSvc │  │  client   │  │
│  └───────────┘  └──────────┘  └───────────┘  │
│  ┌───────────┐  ┌──────────┐                  │
│  │  errors/  │  │validation│                  │
│  │ AppError  │  │  Zod     │                  │
│  └───────────┘  └──────────┘                  │
│          Core Contracts (types.ts)            │
└─────────────────────┬────────────────────────┘
                      │  modules depend on core
        ┌─────────────┴─────────────┐
        ▼                           ▼
  [Module: Users]           [Module: Products]
  (future)                  (future)
```

**Rules:**
1. Core depends on nothing but the framework, ORM, and external libraries.
2. Modules depend on core. Never on each other.
3. Cross-module communication: use core contracts, shared events, or core services.

---

## Template Repositories

### `nexcore` — Next.js 15 + Prisma

**Intended for:** Small-to-medium full-stack TypeScript projects.

**Stack:**
| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router only) |
| Language | TypeScript 5, strict |
| ORM | Prisma 7 + PostgreSQL via `@prisma/adapter-pg` |
| Auth | `jose` (JWT) + `bcryptjs` + httpOnly cookies |
| Data fetching | TanStack Query v5 |
| Validation | Zod v4 |
| UI Icons | lucide-react |
| Styling | CSS Modules + CSS Custom Properties |
| Testing | Playwright (E2E) |

**Key design decisions:**
- **App Router only.** No Pages Router. All routes live under `src/app/`.
- **Route groups:** `(auth)` for public/login pages, `(app)` for protected pages.
- **Proxy pattern for auth:** `src/proxy.ts` exports `proxy()` + `config`. Root `src/middleware.ts` re-exports them. This is the Next.js 15-compatible approach.
- **Prisma v7 adapter:** `PrismaClient` is instantiated with `PgLite` or `@prisma/adapter-pg`. See `src/core/db/client.ts`.
- **Session = signed JWT in httpOnly cookie.** No server-side session store for the basic session. The full JWT + refresh token flow stores refresh token hashes in the `RefreshToken` table.

### `javacore` — Spring Boot 3 + Hibernate

**Intended for:** Complex, multi-service Java backend projects.

**Stack:**
| Concern | Technology |
|---|---|
| Framework | Spring Boot 3.3.x |
| Language | Java 21 (LTS) |
| Build | Maven |
| ORM | Spring Data JPA + Hibernate |
| DB | PostgreSQL |
| Migrations | Flyway |
| Auth | Spring Security + JJWT |
| Validation | Jakarta Bean Validation (Hibernate Validator) |
| Testing | JUnit 5 + MockMvc |
| API Docs | SpringDoc OpenAPI |

**Key design decisions:**
- **Package-by-feature:** All code for `core` auth lives in `com.forge.api.core.auth`.
- **SOLID throughout:** Every service has a Java interface. Implementations are in `impl/` subpackages.
- **Module boundary:** Modules go in `com.forge.api.modules.<moduleName>`. No cross-module imports.
- **Flyway for migrations.** Schema changes live in `src/main/resources/db/migration/`.
- **UUID primary keys** with `@GeneratedValue(strategy = GenerationType.UUID)`.

### `shared-types` — npm Package

**Intended for:** Sharing DTOs between `nexcore` frontend and any TypeScript clients.

- Published locally via `npm link`.
- Package name: `@forge/shared-types`.
- Contains: `ICurrentUser`, `ITokenPayload`, `ITokenPair`, `ApiResponse<T>`, `PaginatedResponse<T>`, `UserRole`.

---

## Auth Flow (nexcore)

```
POST /api/auth/login
  │
  ├── Zod validation (email, password)
  ├── UserService.findByEmail()
  ├── bcrypt.compare(password, user.passwordHash)
  ├── createSession(user.id)          ← signs JWT, sets httpOnly cookie
  └── returns { user: IPublicUser }

Proxy (every request)
  │
  ├── Is path public? → allow
  ├── Read cookie → decrypt JWT
  ├── Valid session? → attach user, allow
  └── Invalid → redirect /login (page) or 401 (API)

POST /api/auth/logout
  │
  └── deleteSession() → clears cookie

[Future: Refresh Token flow]
  ├── Separate access_token (15min) + refresh_token (7d)
  ├── RefreshToken stored as bcrypt hash in DB
  └── POST /api/auth/refresh rotates both tokens
```

---

## Module Integration Guide

See [`module-guide.md`](./module-guide.md) for step-by-step instructions on adding a new feature module.

---

## CSS Design System

All design tokens are CSS custom properties in `src/app/globals.css`:

```css
:root {
  /* Colors */
  --color-primary: hsl(220 90% 56%);
  --color-primary-hover: hsl(220 90% 48%);
  --color-surface: hsl(0 0% 100%);
  --color-surface-elevated: hsl(220 20% 98%);
  --color-border: hsl(220 15% 88%);
  --color-text-primary: hsl(220 20% 12%);
  --color-text-secondary: hsl(220 10% 45%);
  --color-error: hsl(0 72% 51%);
  --color-success: hsl(142 72% 40%);

  /* Spacing */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px hsl(220 15% 10% / 0.06);
  --shadow-md: 0 4px 12px hsl(220 15% 10% / 0.10);
  --shadow-lg: 0 8px 24px hsl(220 15% 10% / 0.15);

  /* Breakpoints (reference, use in @media) */
  /* sm: 640px  md: 768px  lg: 1024px  xl: 1280px */
}
```
