# Forge — Progress Log

## Session: 2026-07-25

### What Was Built

**Cross-Stack Replication & Equivalence Invariant Rule (COMPLETE)**

- [x] `AGENTS.md` & `.agents/AGENTS.md` — Added project-wide Cross-Stack Replication Rule mandating 1:1 parity and immediate cross-stack replication across `vitacore`, `nexcore`, `javacore`, and `@forge/shared-types` whenever frontend components, backend services, API endpoints, or data models are added or modified.

**ConfirmationModal Component (vitacore + nexcore 1:1 Parity) (COMPLETE)**

- [x] `vitacore/src/components/ui/ConfirmationModal/` — Built `ConfirmationModal` component (`types.ts`, `ConfirmationModal.module.css`, `ConfirmationModal.tsx`) with backdrop blur, `Escape` key close handling, `lucide-react` variant icons, loading states, and mobile-first CSS Modules layout.
- [x] `nexcore/src/components/ui/ConfirmationModal/` — Replicated `ConfirmationModal` with 1:1 feature, visual, and architectural parity.
- [x] `vitacore/src/features/dashboard/Dashboard.tsx` & `nexcore/src/app/(app)/dashboard/components/DashboardInteractiveDemo.tsx` — Integrated interactive demo triggers in both stack dashboards for visual and interaction testing.

**Database Seed Script (COMPLETE)**

- [x] `nexcore/prisma/seed.ts` — Enhanced Prisma seed script to seed both `admin@forge.com` (ADMIN) and `user@forge.com` (USER) matching `javacore` seed data 1:1.
- [x] `nexcore/package.json` & `package.json` — Added `"db:seed"` script to `nexcore/package.json` (`prisma db seed`) and root `package.json` (`npm run db:seed --workspace=nexcore`).

**React Doctor Audit Fixes & Replication Rule (COMPLETE)**

- [x] `AGENTS.md` & `.agents/AGENTS.md` — Added rule mandating that any code fix, refactoring, accessibility update, or performance optimization resulting from `react-doctor` audits in one stack must immediately be replicated to sibling stacks to preserve 1:1 cross-stack parity.
- [x] `nexcore/prisma/seed.ts` — Resolved `async-await-in-loop` by replacing sequential `for...of` loop with `Promise.all(initialUsers.map(...))`.
- [x] `nexcore/src/components/ui/ConfirmationModal/` & `vitacore/src/components/ui/ConfirmationModal/` — Resolved `prefer-html-dialog`, `prefer-use-effect-event`, and `no-noninteractive-element-interactions` by migrating to native HTML `<dialog>` with `showModal()`, `close()`, and attaching native DOM click handlers inside `useEffect` across both stacks. Achieved **100/100 Great** (0 warnings, 0 errors).
- [x] `vitacore/src/config/api.ts` — Resolved `deslop/unused-file` by connecting `API_CONFIG.endpoints` to `useCurrentUser`, `LoginForm`, and `LogoutButton`, replacing raw endpoint string literals. Achieved **100/100 Great** (0 warnings, 0 errors) in `vitacore`.

**Toast Notification System (vitacore + nexcore 1:1 Parity) (COMPLETE)**

- [x] `vitacore/src/components/ui/Toast/` & `nexcore/src/components/ui/Toast/` — Built atomic Toast notification system (`types.ts`, `ToastContext.ts`, `ToastItem.tsx`, `ToastContainer.tsx`, `ToastProvider.tsx`, `useToast.ts`, `Toast.module.css`) with progress bar timer countdown, pause-on-hover, manual close (`X`) button, variant icons (`CheckCircle2`, `AlertTriangle`, `AlertCircle`, `Info`), and mobile-first CSS Modules stack layout.
- [x] Application Integration — Wrapped root trees in `ToastProvider` (`vitacore/src/App.tsx` and `nexcore/src/app/providers.tsx`) and added interactive trigger buttons (`Success`, `Error`, `Warning`, `Info`) in both stack dashboards.
- [x] React Doctor Verification — Maintained **100/100 Great** audit score across both stacks.

**App Shell & Collapsible Navigation Sidebar (vitacore + nexcore 1:1 Parity) (COMPLETE)**

- [x] Rules Updated — Enforced 100% mobile responsiveness invariant in `AGENTS.md` and `.agents/AGENTS.md`.
- [x] `vitacore/src/components/layout/AppShell/` & `nexcore/src/components/layout/AppShell/` — Implemented App Shell & Collapsible Navigation Sidebar (`types.ts`, `Sidebar.tsx`, `AppHeader.tsx`, `AppShell.tsx`, `AppShell.module.css`) with desktop collapse toggle (`ChevronLeft` / `ChevronRight`), mobile off-canvas drawer overlay (`Menu` button), `Escape` key close handling, user profile status badge, and `LogoutButton`.
- [x] Application Integration — Wrapped protected layouts (`nexcore/src/app/(app)/layout.tsx` and `vitacore/src/features/dashboard/Dashboard.tsx`) in `AppShell`.
- [x] React Doctor Verification — Maintained **100/100 Great** audit score across both stacks.

**File Upload Service & UI Uploader (vitacore + nexcore + javacore 1:1 Parity) (COMPLETE)**

- [x] `packages/shared-types` — Added `IUploadedFile` & `FileUploadOptions` contracts.
- [x] `nexcore/src/core/storage/` & `javacore/src/main/java/com/forge/javacore/core/storage/` — Implemented `IStorageService` strategy pattern interface & `LocalStorageService` cloud-ready implementations.
- [x] Backend Controllers — Implemented `POST /api/upload` & `DELETE /api/upload` endpoints in Next.js (`nexcore/src/app/api/upload/route.ts`) and Spring Boot 3 (`javacore/src/main/java/com/forge/javacore/features/upload/UploadController.java`).
- [x] UI Component `FileUploader` — Built drag-and-drop UI component (`FileUploader.tsx`, `useFileUpload.ts`, `FileUploader.module.css`, `types.ts`) with upload progress percentage bar, file validation (10MB limit), preview icon, and delete button in `vitacore` and `nexcore`.
- [x] React Doctor & Build Verification — `javacore` Maven build passed (`BUILD SUCCESS`), `vitacore` and `nexcore` achieved **100/100 Great** scores.

---

## Session: 2026-07-24

### What Was Built

**javacore Run / Stop / Debug Tasks (COMPLETE)**

- [x] `.vscode/tasks.json` — Added shell tasks: `Forge: Run javacore`, `Forge: Run javacore (Debug)`, `Forge: Stop javacore`, `Forge: Compile javacore`, `Forge: Build javacore`.
- [x] `.vscode/launch.json` — Added VS Code Java debug launch configurations (`Forge: Launch & Debug javacore` as primary/default launch, `Forge: Start & Debug javacore`, and `Forge: Debug javacore (Attach)`).
- [x] `package.json` — Added root CLI scripts: `javacore:run`, `javacore:debug`, `javacore:stop`, `javacore:compile`, `javacore:build`.
- [x] `.gitignore` — Unignored `.vscode/tasks.json` and `.vscode/launch.json` so task configurations are tracked and committed to git.
- [x] `javacore/src/main/java/com/forge/javacore/core/config/SecurityProperties.java` — Extracted security/JWT configuration into standalone `@ConfigurationProperties(prefix = "app.security")` class.
- [x] `javacore/src/main/java/com/forge/javacore/core/config/AppProperties.java` — Refactored `AppProperties` as a clean centralized provider referencing domain property classes with `@PostConstruct` startup validation.
- [x] `javacore/src/main/java/com/forge/javacore/core/auth/JwtTokenProvider.java` — Refactored `JwtTokenProvider` to inject `AppProperties` instead of scattered `@Value` annotations.
- [x] `javacore/.agents/AGENTS.md` — Created repo-specific agent rules specifying SOLID principles, centralized `AppException` error handling, `AppProperties` injection, and Flyway database invariants.
- [x] `scripts/prompt-helper.js` — Built interactive CLI prompt helper (`readline`), PostgreSQL database auto-creation utility (`createdb` / `psql`), and automatic Flyway database migration runner (`tryRunDatabaseMigrations`).
- [x] `scripts/create-javacore.js` — Enhanced `javacore` setup script with interactive prompt flow for DB host/port/name/credentials, JWT secrets, and server port, automatically generating `.env`, `application.yml`, and `application-local.yml`.
- [x] `scripts/create-vitacore.js` — Enhanced `vitacore` setup script with interactive prompt flow for backend target URL and dev port, generating `.env` and `.env.local`.
- [x] `scripts/create-stack.js` — Created master full-stack interactive bootstrapper (`npm run create-stack <target-folder>`) to set up `backend/` (`javacore`) and `frontend/` (`vitacore`) interlinked couples in a single command.
- [x] `package.json` — Added `"create-stack"` script command.
- [x] `README.md` — Updated Quick Start documentation for full-stack and single-repo interactive setup.

---

## Session: 2026-07-22

### What Was Built

**Phase 1 — Documentation & Standards (COMPLETE)**

- [x] `.vscode/tasks.json` & `launch.json` — Configured `JAVA_TOOL_OPTIONS` environment variable for JDWP debug agent (`port 5005`), resolving PowerShell `-D` argument parsing errors and linking VS Code debugger launch to `Forge: Start Debug (javacore)`.
- [x] `javacore` DB Migration — Added `V2__add_updated_at_to_refresh_tokens.sql` and `V3__seed_test_users.sql` for test account seeding.
- [x] `nexcore` Prisma Seed — Updated `prisma/seed.ts` to seed both `admin@forge.com` and `user@forge.com`.
- [x] `javacore` Hot Reloading — Integrated `spring-boot-devtools` for fast in-memory application context restarts upon code changes.
- [x] `javacore` Strict Shared-Types Alignment — Removed custom `AuthResponse` and updated all endpoints to return strictly `ApiResponse<TData>` matching `@forge/shared-types` 1:1.
- [x] `vitacore` Configuration — Created `.env` and `.env.example` defining `VITE_BACKEND_URL=http://localhost:8080`, updated `vite.config.ts` to dynamically proxy `/api` via `loadEnv()`, added `src/config/api.ts` and `ImportMetaEnv` types in `src/vite-env.d.ts`.
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
- [x] Domain-Agnostic Response DTO — Relocated `ApiResponse<T>` from `core.user.dto` to kernel `com.forge.javacore.core.dto` package, decoupling HTTP response wrappers from the user domain.
- [x] Configuration Security — Untracked `application.yml` from Git repository and added to `.gitignore`. Created `application.yml.example` template.
- [x] `scripts/create-javacore.js` — 1-command CLI bootstrapping tool (`npm run create-javacore <target-directory>`) with auto-generated database URL and random JWT secrets.

**Phase 5 — vitacore (React + Vite + TypeScript template) (COMPLETE)**

- [x] Vite 6 + React 19 + TypeScript standalone frontend template (`vitacore/`)
- [x] Vite dev server proxy configured (`/api` -> `http://localhost:8080` for Spring Boot backend integration)
- [x] `@forge/shared-types` integration (`ICurrentUser`, `ApiResponse`, etc.)
- [x] 1:1 Alignment with `nexcore`: UI primitives (`Button`, `Input`, `FormField`), design custom properties, and `LoginForm` layout
- [x] TanStack React Query architecture (`QueryProvider`, `useCurrentUser`, `useMutation`)
- [x] `scripts/create-vitacore.js` — 1-command CLI bootstrapping tool (`npm run create-vitacore <target-directory>`)
- [x] 1:1 Post-Login Dashboard Parity — Refactored `vitacore` dashboard to match `nexcore` layout, headers, cards, and status check icons 1:1 with CSS Modules.
- [x] AGENTS.md Standards — Added `vitacore + javacore = nexcore` Frontend Equivalence Invariant and `No barrel export for single components` rule.
- [x] React Doctor Audit — Achieved **100/100 Great** score (`npx react-doctor@latest --verbose`), resolving function hoisting, `fetch` status checks, and web storage auth token security rules.

---

## Key Decisions Made

| Decision         | Choice                                                | Reason                                       |
| ---------------- | ----------------------------------------------------- | -------------------------------------------- |
| Template folders | Single `forge\` parent                                | Easier browsing                              |
| Naming           | `nexcore` / `javacore` / `vitacore`                   | Kernel-style naming                          |
| Java build       | Maven                                                 | Standard, explicit                           |
| CSS approach     | CSS Modules + CSS Custom Properties                   | No framework lock-in, full power             |
| Auth pattern     | Signed JWT in httpOnly cookie                         | olimpo-proven pattern, XSS safe              |
| Shared types     | `@forge/shared-types` npm package via `npm link`      | Proper decoupling, monorepo workspace        |
| UI primitives    | 1:1 shared design across nexcore & vitacore           | Consistent UI/UX across Next.js and Vite     |
| React Doctor     | Integrated script (`npm run doctor`) & 100% compliant | High code quality and performance invariants |

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
