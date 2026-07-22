# vitacore ⚡

**vitacore** is the standalone React + Vite + TypeScript frontend template repository for **Forge**.

It provides a high-performance, mobile-first single-page application (SPA) foundation designed to pair seamlessly with REST backends such as `javacore` (Spring Boot 3) or `nexcore` API routes.

---

## ⚡ Tech Stack & Features

- **Build Tool & Framework**: Vite 6 + React 19 + TypeScript 5
- **State & Data Fetching**: TanStack React Query + React Context Auth provider
- **Design System & Styling**: CSS Modules with CSS Custom Properties design system tokens (matching Forge standards). Zero utility framework overhead.
- **Icons**: `lucide-react`
- **Shared Contracts**: `@forge/shared-types` integration

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start Vite development server with REST API proxy (/api -> http://localhost:8080)
npm run dev

# Build production bundle
npm run build
```

---

## 🏛️ Directory Structure

```text
vitacore/
├── index.html
├── vite.config.ts           # Development proxy & alias settings
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── globals.css          # Design system tokens
│   ├── core/
│   │   ├── api/             # Typed API fetch client
│   │   └── auth/            # AuthContext & useAuth hook
│   └── components/ui/       # Atomic UI component library
```
