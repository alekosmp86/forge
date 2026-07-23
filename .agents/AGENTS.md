# Frontend Equivalence Invariant: vitacore + javacore = nexcore

- **vitacore + javacore = nexcore:** The only difference across template repositories is backend technology (`javacore` Spring Boot 3 vs `nexcore` Next.js 15 internal backend vs `vitacore` Vite SPA frontend).
- **1:1 UI/UX Parity:** Both `vitacore` and `nexcore` define their own UI components independently, but every component must be visually and behaviorally identical across both repositories (layout, design tokens, CSS modules, responsive behavior, icons, and interactions).

---

# Language and Component Architecture Rules

- **No barrel export for single components:** Do not create `index.ts` files inside individual single-component subdirectories (e.g. avoid `LogoutButton/index.ts` or `Input/index.ts`). Import components directly from their explicit file path (e.g. `./LogoutButton/LogoutButton`).
