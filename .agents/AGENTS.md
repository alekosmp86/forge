# Cross-Stack Replication & Equivalence Invariant

- **vitacore + javacore = nexcore:** The only difference across template repositories is backend technology (`javacore` Spring Boot 3 vs `nexcore` Next.js 15 internal backend vs `vitacore` Vite SPA frontend).
- **1:1 UI/UX & Backend Feature Parity:** Every feature, component, API endpoint, or architectural change implemented in one stack must immediately be replicated across all relevant sibling stacks:
  - **Frontend Components & Modals:** Any new UI component, modal (e.g., confirmation modals), layout update, or design system addition introduced in `vitacore` must be replicated in `nexcore` (and vice-versa) with 1:1 visual, interaction, and behavioral parity.
  - **React Doctor Audit Fixes:** Any code fix, refactoring, accessibility update, or performance optimization applied as a result of running `react-doctor` in one stack (e.g., `nexcore`) must immediately be replicated to all corresponding component files in sibling stacks (e.g., `vitacore`) to preserve 1:1 cross-stack parity.
  - **Backend Services & API Endpoints:** Any new backend feature, API route/endpoint, service method, or database schema change introduced in `nexcore` internal backend must be replicated in `javacore` Spring Boot backend (and vice-versa).
  - **Shared Contracts & DTOs:** Update `@forge/shared-types` whenever DTOs, request payloads, or response shapes change so all stacks remain in sync.

---

# Language and Component Architecture Rules

- **Use const objects for enums & isolate into types.ts:** Do not use TypeScript native `enum` declarations or raw string literal unions (like `'main' | 'admin'`). Define enums as `as const` object literals (e.g. `export const NavSection = { MAIN: 'main', ADMIN: 'admin' } as const; export type NavSection = (typeof NavSection)[keyof typeof NavSection];`) in a dedicated `types.ts` file so modules can independently import and reuse them without importing components or registry instances.
- **Make UI components mobile-first:** Always design and write CSS layouts prioritizing mobile viewports first (e.g. mobile drawer/overlay for sidebars), scaling up with responsive breakpoints. Every UI component, layout, and navigation element must be 100% functional on mobile viewports.
- **No barrel export for single components:** Do not create `index.ts` files inside individual single-component subdirectories (e.g. avoid `LogoutButton/index.ts` or `Input/index.ts`). Import components directly from their explicit file path (e.g. `./LogoutButton/LogoutButton`).
- **Module catalog `tsconfig.json` requirement:** Every Next.js module catalog template under `modules/<name>/nexcore/` must contain a `tsconfig.json` extending `../../../nexcore/tsconfig.json` and including `../../../nexcore/next-env.d.ts` so IDE language servers can resolve ambient CSS Module declarations (`*.module.css`) and Next.js types without errors in the catalog workspace.

