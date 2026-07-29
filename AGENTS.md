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

- **Do not compare against string literals or use inline string literal unions.** Statuses, categories, sections, types, and logic reasons must be defined once as `as const` object enums (TypeScript) or Java `enum` classes and imported, rather than compared against raw string literals (like `=== "no_reservation"` or `"INFO"`) or declared as inline union strings (like `'main' | 'admin'`).
- **Use const objects for TypeScript enums.** Do not use TypeScript native `enum` declarations or raw string literal unions. Define enums as `as const` object literals (e.g. `export const MyEnum = { ... } as const; export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];`) so they act like constants with strict type safety.
- **Use Java enums for Java domain types/statuses.** Define Java `enum` classes (mapped with `@Enumerated(EnumType.STRING)` in JPA entities) instead of String literals for domain types, statuses, and options.
- **Use Lombok annotations in Java.** Use `@Getter`, `@Setter`, `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@AllArgsConstructor`, and `@Slf4j` to eliminate boilerplate in Java classes, DTOs, entities, services, and controllers. (For JPA entities, use `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` instead of `@Data`).

---

# Language and Component Architecture

- **Always use TypeScript.** All code files must use `.ts` or `.tsx` extensions with strict type safety.
- **Decompose components into the smallest atom possible.** Break UI elements into highly reusable atomic building blocks.
- **No barrel export for single components.** Do not create `index.ts` files inside individual single-component subdirectories (e.g., avoid `LogoutButton/index.ts` or `Input/index.ts`). Import components directly from their explicit file path (e.g., `./LogoutButton/LogoutButton`).
- **Run react-doctor.** Ensure `react-doctor` is included in npm scripts/packages and run after implementing major changes to audit security, performance, and Fast Refresh compliance.
- **Plan before implementing.** Always create a detailed implementation plan and get user approval before making code changes.
- **Make UI components mobile-first.** Always design and write CSS layouts prioritizing mobile viewports first (e.g. mobile drawer/overlay for sidebars), scaling up with responsive breakpoints. Every UI component, layout, and navigation element must be 100% functional on mobile viewports.

---

# Cross-Stack Replication & Equivalence Invariant

- **vitacore + javacore = nexcore:** The only difference across template repositories is backend technology (`javacore` Spring Boot 3 vs `nexcore` Next.js 15 internal backend vs `vitacore` Vite SPA frontend).
- **1:1 UI/UX & Backend Feature Parity:** Every feature, component, API endpoint, or architectural change implemented in one stack must immediately be replicated across all relevant sibling stacks:
  - **Frontend Components & Modals:** Any new UI component, modal (e.g., confirmation modals), layout update, or design system addition introduced in `vitacore` must be replicated in `nexcore` (and vice-versa) with 1:1 visual, interaction, and behavioral parity.
  - **Backend Services & API Endpoints:** Any new backend feature, API route/endpoint, service method, or database schema change introduced in `nexcore` internal backend must be replicated in `javacore` Spring Boot backend (and vice-versa).
  - **Shared Contracts & DTOs:** Update `@forge/shared-types` whenever DTOs, request payloads, or response shapes change so all stacks remain in sync.

---

# React Doctor Compliance & Code Quality

- **Run `react-doctor` after major UI or architecture changes:** Execute `npm run doctor` in `nexcore` to audit codebase health, security, and performance.
- **Replicate React Doctor fixes across stacks:** Any code fix, refactoring, accessibility update, or performance optimization applied as a result of running `react-doctor` in one stack (e.g., `nexcore`) must immediately be replicated to all corresponding component files in sibling stacks (e.g., `vitacore`) to preserve 1:1 cross-stack parity.
- **Fast Refresh & Type Separation Rules:** Do not export non-component symbols (such as enums, constants, or helper functions) directly from React component files (`.tsx`). Never declare enums, const object enums, or interfaces in the same file as component layouts or class registry implementations where modules need independent imports. Always isolate types and const object enums into a dedicated `types.ts` file within the directory.
- **Dependency & Code Slop Prevention:** Maintain zero unused dependencies in `package.json` and keep entry-point reachability clean.

---

# Architecture: Kernel / Module Pattern

- **The `core/` folder is the kernel.** It is stable and contains only contracts (interfaces/types), auth logic, db client, error handling, and validation utilities. It knows nothing about business domains.
- **Modules depend on core, never on each other.** No horizontal imports between modules. If two modules need to communicate, that communication goes through core contracts or events.
- **Each module must be 100% self-contained.** A module folder includes its own domain types (`types.ts`), service interface, service implementation, custom exception hierarchy, and API route handlers entirely within `src/modules/<module-name>/`. Modules do not inject types into global packages like `@forge/shared-types`.
- **Module Custom Exception Hierarchy & Zero-Core Delegation:** Modules must define their own custom exceptions (e.g. `NotificationException extends AppException` in Java, `NotificationError extends AppError` in TypeScript) inside the module package (`/exception/` or `errors.ts`). Because custom module exceptions inherit from kernel base exceptions, the kernel's `GlobalExceptionHandler` automatically catches and formats them without modifying any core kernel code.
- **Module UI Slot Injection & Extension SDK:** Modules must inject UI elements into Core UI slots dynamically using the Forge Extension SDK (`FG.UI.Header.register`, `FG.UI.Sidebar.register`) without modifying core layouts (`AppHeader.tsx`, `Sidebar.tsx`, `AppShell.tsx`). All slot registries MUST include `'use client'` at the top of the file. See `docs/module-guide.md` for full implementation examples.
- **Module API endpoints must be namespaced under `/api/modules/<module-name>`.** To prevent route collisions with kernel routes (`/api/auth`, `/api/users`) or between modules, all REST controllers and API handlers for modules must be prefixed with `/api/modules/<module-name>` (e.g., `@RequestMapping("/api/modules/notifications")` in Java, `/api/modules/notifications/route.ts` in Next.js).
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
- **Update `README.md` on major architectural changes.** Whenever a major architectural change or new template repository is added (such as scaffolding `javacore`), update the root `README.md` to reflect the updated workspace structure, setup instructions, and feature matrix.
- **Every repo must have `.agents/AGENTS.md`** with repo-specific context and instructions.
- **Every new module must be documented in `docs/module-guide.md`** before implementation begins.
- **Use section dividers (`---`) and clear headings** in all documentation files.

