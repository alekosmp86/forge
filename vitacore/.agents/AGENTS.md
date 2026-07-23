# Vitacore Repository Context & Rules

This folder contains **vitacore** — the React 19 + Vite 6 + TypeScript single-page application template for **Forge**.

## Architectural Standards

1. **Strict Fast Refresh Rules**:
   - Component files (`.tsx`) must export ONLY React component symbols.
   - Separate Context definitions into `context.ts` or `types.ts` so Fast Refresh can preserve state cleanly.

2. **Naming Conventions**:
   - Never use single-letter variable names (`event` not `e`, `error` not `err`, `index` not `i`).

3. **Icons & Emojis**:
   - Always use `lucide-react` icons. Do not use raw unicode text characters or emojis in the UI.

4. **React Doctor Compliance**:
   - Run `npm run doctor` to audit component security, performance, and Fast Refresh compatibility.

5. **Design System & Styling**:
   - Component-scoped styling using CSS Modules (`*.module.css`).
   - All colors, typography, and spacing utilize CSS Custom Properties defined in `src/globals.css`.
