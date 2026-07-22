# Project Mission

This workspace contains the **Forge** — a set of reusable template repositories designed to quickly bootstrap fully functional applications without starting from scratch. Every session with an AI agent must read this file first and review `docs\progress.md` to understand where work was last left off.

## Forge Repositories

| Repo | Path | Purpose |
|---|---|---|
| `nexcore` | `nexcore\` | Next.js 15 + Prisma template |
| `javacore` | `javacore\` | Spring Boot 3 + Hibernate template |
| `shared-types` | `packages\shared-types\` | Shared TypeScript DTOs (npm-linked) |

---

# Naming Conventions

- **Never use single-letter variable names.** Every variable must have a descriptive name that communicates its intent (e.g., `response` not `r`, `error` not `e`, `item` not `i`). The only exception is well-established loop counters in short `for` loops where the context is obvious.

---

# Icons and Emojis

- **Use lucide-react icons.** Do not use raw emoji/unicode text characters (like `⚠️`, `❌`, etc.) in the user interface. Always use the equivalent icons imported from `lucide-react`.

---

# Comparisons and String Literals

- **Do not compare against string literals.** Statuses, types, and logic reasons must be defined once as constants/enums and imported, rather than compared against raw string literals (like `=== "no_reservation"`).
- **Use const objects for enums.** Do not use TypeScript native `enum` declarations. Define enums as `as const` object literals (e.g. `export const MyEnum = { ... } as const; export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];`) so they act like constants with strict type safety.

---

# Language and Component Architecture

- **Always use TypeScript.** All code files must use `.ts` or `.tsx` extensions with strict type safety.
- **Decompose components into the smallest atom possible.** Break UI elements into highly reusable atomic building blocks.
- **Run react-doctor.** Ensure `react-doctor` is included in npm scripts/packages and run after implementing major changes to audit security, performance, and Fast Refresh compliance.
- **Plan before implementing.** Always create a detailed implementation plan and get user approval before making code changes.
- **Make UI components mobile-first.** Always design and write CSS/Tailwind layouts prioritizing mobile viewports first, scaling up with responsive breakpoints (`md:`, `lg:`).

---

# React Doctor Compliance & Code Quality

- **Run `react-doctor` after major UI or architecture changes:** Execute `npm run doctor` in `nexcore` to audit codebase health, security, and performance.
- **Fast Refresh Rules:** Do not export non-component symbols (such as enums, constants, or helper functions) directly from React component files (`.tsx`). Separate types and constants into a `types.ts` or `constants.ts` file within the component directory so Fast Refresh can preserve state cleanly.
- **Dependency & Code Slop Prevention:** Maintain zero unused dependencies in `package.json` and keep entry-point reachability clean.

---

# Architecture: Kernel / Module Pattern

- **The `core/` folder is the kernel.** It is stable and contains only contracts (interfaces/types), auth logic, db client, error handling, and validation utilities. It knows nothing about business domains.
- **Modules depend on core, never on each other.** No horizontal imports between modules. If two modules need to communicate, that communication goes through core contracts or events.
- **Each module must be self-contained.** A module folder includes its own types, service interface, service implementation, and (for Next.js) its own API route handlers.
- **Do not implement modules unless explicitly requested.** Document the module integration pattern in `docs/module-guide.md` and wait for the user to decide which modules to add.

---

# Architecture: SOLID Principles (TypeScript & Java)

- **Single Responsibility:** Each class/function does exactly one thing. Services handle business logic; they do not handle HTTP concerns. Controllers/routes handle HTTP; they do not contain business logic.
- **Open/Closed:** Core contracts (interfaces) are open for extension but closed for modification. Add new implementations rather than modifying existing ones.
- **Liskov Substitution:** Implementations must honor the full contract of their interface without surprising the caller.
- **Interface Segregation:** Define narrow interfaces. A `IUserReader` and `IUserWriter` are better than a single `IUserRepository` if consumers only need one capability. Do not force implementations to implement methods they don't need.
- **Dependency Inversion:** Depend on abstractions (interfaces/types), not concrete implementations. Inject dependencies through constructors or function parameters.
- **Do NOT overengineer.** Apply SOLID where it reduces coupling and improves testability. Do not create interfaces for trivial utilities or single-use helpers — that is unnecessary abstraction.

---

# Architecture: Service Pattern (TypeScript)

For every domain service in `core/` or in a module:
1. Define a **TypeScript interface** (`IXxxService`) that declares the contract.
2. Implement it in a separate file (`XxxService.ts`).
3. Consumers import and depend on the **interface type**, never the implementation directly.
4. Validate all inputs at the route/controller layer (Zod for Next.js, Jakarta Bean Validation for Java). Services receive already-validated data.

---

# Authentication (nexcore)

- **Always use the core auth system.** Never roll custom token logic in a module.
- **Session pattern (Next.js 15):** Use `jose` for JWT signing/verification. Sessions are stored as signed JWTs in httpOnly cookies (`SESSION_SECRET` env variable).
- **Proxy pattern (Next.js 16+):** Route protection is handled via `src/proxy.ts` exporting a `proxy()` function and a `config` matcher. Do not create a separate `src/middleware.ts` file alongside `src/proxy.ts`, as Next.js 16+ requires using `src/proxy.ts` alone.
- **Refresh token rotation:** When implementing the full JWT + refresh token flow, every token use rotates the refresh token (old token is invalidated, new pair issued). Refresh tokens are stored as bcrypt hashes in the `RefreshToken` DB table.
- **Cookie names:** Use descriptive, namespaced cookie names (e.g., `nexcore_session`, not just `session`).

---

# Authentication (javacore)

- **Use Spring Security with a `OncePerRequestFilter`** for JWT validation on every request.
- **Store the JWT secret in `application.yml`** under `app.security.jwt-secret` (externalized via env in production).
- **Refresh token rotation** follows the same pattern as nexcore.

---

# Database

## Next.js (Prisma)
- **Use the Prisma singleton pattern** established in olimpo-sales-manager: a single `PrismaClient` instance exported from `src/core/db/client.ts`, using the `@prisma/adapter-pg` and `pg` pool for connection reuse.
- **Always use `prisma generate && prisma migrate deploy`** in the build script, not `prisma db push`.
- **Prisma v7+ breaking change:** The client must be instantiated with the pg adapter. See `src/core/db/client.ts` in nexcore for the canonical pattern.

## Java (Spring Boot / Hibernate)
- **Use Flyway for migrations.** Never use `spring.jpa.hibernate.ddl-auto=create` or `update` in any environment other than local development.
- **Use `spring.jpa.hibernate.ddl-auto=validate`** in production to catch schema drift.
- **Entity IDs:** Use `UUID` as the primary key type with `@GeneratedValue(strategy = GenerationType.UUID)`.

---

# CSS / Styling (nexcore)

- **CSS Modules for component-scoped styles.** Every component gets a `.module.css` file.
- **CSS Custom Properties for design tokens.** All colors, spacing, typography, shadows, and breakpoints are defined as CSS variables in `src/app/globals.css` under `:root`.
- **Mobile-first.** All layout styles start from mobile viewport. Use `@media (min-width: Xpx)` to scale up, never `max-width` breakpoints.
- **No utility class frameworks** unless explicitly requested by the user.

---

# Documentation Requirements

- **Update `docs\progress.md` at the end of every session.** Record what was built, what was left incomplete, and what the next agent should tackle.
- **Every repo must have `.agents/AGENTS.md`** with repo-specific context and instructions.
- **Every new module must be documented in `docs/module-guide.md`** before implementation begins.
- **Use section dividers (`---`) and clear headings** in all documentation files.

