# Forge ⚒️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748.svg?logo=prisma)](https://www.prisma.io/)

**Forge** is a suite of production-grade template repositories and shared packages designed to rapidly bootstrap scalable full-stack applications without starting from scratch.

It enforces strict **Kernel / Module Architecture**, **SOLID Principles**, mobile-first styling, and enterprise-level authentication patterns.

---

## 📦 Workspace Structure

```text
forge/
├── nexcore/                 # Next.js 15 + Prisma + CSS Modules template
│   ├── src/core/            # Stable kernel (Auth, DB client, Error handling, Schemas)
│   ├── src/app/             # Next.js 15 App Router & API routes
│   └── src/components/ui/   # Atomic UI component library
├── packages/
│   └── shared-types/        # @forge/shared-types npm package (DTOs, API responses)
├── docs/                    # Architecture, Progress, and Module integration guides
│   ├── architecture.md      # Full architecture specification
│   ├── module-guide.md      # Step-by-step guide for adding self-contained modules
│   └── progress.md          # Session progress and task logs
└── AGENTS.md                # Development standards and architectural invariants
```

---

## 🚀 Repositories & Templates

### 1. `nexcore` (Next.js 15 Template)
A feature-packed Next.js 15 App Router foundation built with:
- **Framework**: Next.js 15 + React 19 + TypeScript.
- **Database & ORM**: PostgreSQL via Prisma 7 (using `@prisma/adapter-pg` pool connection).
- **Authentication**: JWT session tokens signed with `jose` stored in `httpOnly` cookies, protected via `src/proxy.ts` (Next.js proxy route handler).
- **Styling**: Modern CSS Modules with root-level CSS Custom Properties design system tokens (dark/light themes, dynamic animations). Zero utility framework overhead.
- **UI Library**: Atomic components (`Button`, `Input`, `FormField`, `Badge`, `Spinner`, `Card`).
- **Code Quality**: Built-in `react-doctor` compliance auditing.

### 2. `packages/shared-types` (`@forge/shared-types`)
Standalone TypeScript package linking shared data structures across services:
- Standardized API payload contracts (`ApiResponse<T>`, `PaginatedResponse<T>`).
- Authentication DTOs (`ICurrentUser`, `ITokenPayload`, `ITokenPair`, `UserRole`).

---

## 🏛️ Architecture & Principles

Forge follows a strict **Kernel / Module Architecture**:

```mermaid
graph TD
    AppRouter["Next.js App Router / API Routes"] --> Services["Domain Services (Module / Core)"]
    Services --> CoreKernel["src/core (Kernel)"]
    CoreKernel --> Auth["Auth & Sessions (jose)"]
    CoreKernel --> DB["Prisma DB Client"]
    CoreKernel --> Errors["Error Handling & Zod Validation"]
```

### Key Architectural Invariants
1. **Kernel Stability**: `src/core` is the stable kernel. It contains contracts, database singletons, authentication, and validation utilities. It has **zero dependencies** on business domain modules.
2. **Module Isolation**: Modules are completely self-contained (`types.ts`, `IService.ts`, `Service.ts`, API handlers). Modules **never import directly from each other**.
3. **Service Pattern**: Business logic is encapsulated inside typed domain services implementing TypeScript interfaces (`IXxxService`). Controllers and routes only handle HTTP transport and validation.
4. **Input Validation**: All incoming requests are validated at the route layer using Zod schemas before touching domain services.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database instance

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alekosmp86/forge.git
   cd forge
   ```

2. **Setup `@forge/shared-types`**:
   ```bash
   cd packages/shared-types
   npm install
   npm run build
   npm link
   ```

3. **Setup `nexcore`**:
   ```bash
   cd ../../nexcore
   npm install
   npm link @forge/shared-types
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` in `nexcore`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/nexcore?schema=public"
   SESSION_SECRET="super-secret-at-least-32-characters-long"
   ```

5. **Initialize Database & Run**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

---

## 📄 Documentation

- [Architecture Reference](docs/architecture.md)
- [Deployment & Bootstrapping Guide](docs/deployment-guide.md)
- [Module Creation Guide](docs/module-guide.md)
- [Progress Log](docs/progress.md)
- [Development Rules](AGENTS.md)

---

## 📜 License

Distributed under the MIT License.
