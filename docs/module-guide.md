# Module Integration Guide (Forge Engine)

This document describes the design, manifest specification, and execution flow for pluggable feature modules across `nexcore`, `javacore`, and `vitacore`.

---

## What Is a Module in Forge?

A module is a self-contained business feature domain that can be selectably installed into any new project via the Forge CLI.

Modules live in `modules/<module-name>/` in the repository catalog and contain:
- **`module.json`**: Manifest declaring module metadata, targets, required `.env` variables, and schema patch extensions.
- **`nexcore/`**: Next.js service implementation, domain types (`src/modules/<name>/types.ts`), API routes, components, and Prisma schema snippet.
- **`javacore/`**: Spring Boot entity, repository, service interface, controller, DTOs, domain exceptions, and Flyway SQL migration scripts.
- **`vitacore/`**: React Query hooks, domain types (`src/modules/<name>/types.ts`), and components for Vite SPA.

---

## Manifest Specification (`module.json`)

```json
{
  "id": "notifications",
  "name": "In-App Notifications",
  "description": "Real-time in-app alerts and unread badge tracking.",
  "version": "1.0.0",
  "targets": ["nexcore", "javacore", "vitacore"],
  "envVariables": {
    "NOTIFICATIONS_MAX_PAGE_SIZE": "50"
  },
  "schemaExtensions": {
    "userFieldsPrisma": [
      "unreadNotificationCount Int @default(0)",
      "notificationPreferencesJson String? @default(\"{}\")"
    ],
    "userFlywaySql": [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS unread_notification_count INT NOT NULL DEFAULT 0;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences_json TEXT DEFAULT '{}';"
    ]
  },
  "navigationItems": [
    {
      "label": "Notifications",
      "href": "/notifications",
      "icon": "Bell"
    }
  ]
}
```

---

## Core Schema Extensions

Modules can add **new tables** and extend **existing core tables** (such as `User`).

### 1. Direct Column Addition (Prisma / Next.js)
The installer script (`module-installer.js`) reads `userFieldsPrisma` from `module.json` and automatically patches direct column definitions into `model User` in `prisma/schema.prisma`. It also appends `schema.prisma.snippet` to add any module-specific tables.

### 2. Direct Column Addition (Flyway / Java)
The installer copies module SQL scripts into `src/main/resources/db/migration/` with consecutive versioning (`V2__...`, `V3__...`). The SQL script executes `ALTER TABLE users ADD COLUMN...` to extend the core table cleanly before creating module tables.

---

## CLI Installer Integration Flow

When creating a new application (`npm run create-stack`, `create-nexcore`, `create-javacore`, or `create-vitacore`):

1. **Interactive Prompt**: The installer scans `modules/` and asks the developer which modules to include.
2. **Code Injection**: Copies module stack code into `src/modules/<name>/`.
3. **Types Linking**: Copies shared types to `packages/shared-types/src/modules/<name>/`.
4. **Schema Patching**: Merges Prisma models or stages Flyway migration files.
5. **Environment Configuration**: Appends missing environment variable declarations to `.env`.
6. **Build & Migrate**: Runs database migration commands (`prisma generate`, `prisma migrate dev`, or Flyway migrations).

---

---

## UI Component Injection Guide (`FG` Extension SDK)

### The Core Philosophy
**Never modify Core layout components (`AppHeader.tsx`, `AppShell.tsx`, `Sidebar.tsx`) to add module-specific UI.** 

Instead, Core layouts expose **UI Extension Slots** via the **Forge Extension SDK (`FG`)**. Modules dynamically register their components into these slots during initialization or component render, keeping `core/` completely decoupled from business modules.

---

### Available UI Extension Slots

| Slot Registry | Target Location | Use Cases | Example Component |
|---|---|---|---|
| `FG.UI.Header` | `AppHeader.tsx` (top right) | Notifications bell, tenant selectors, quick actions | `NotificationBell` |
| `FG.UI.Sidebar` | `Sidebar.tsx` (navigation) | Dynamic menu items, module pages, external links | `ModuleNavItem` |

---

### 1. Header UI Slot Injection (`FG.UI.Header`)

#### Registering a Component into the Header:
```tsx
import { FG } from '@/core/extension/FG';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell/NotificationBell';

// Register UI component into Core Header
FG.UI.Header.register({
  id: 'notifications-bell',
  order: 5, // Lower order renders further to the left
  component: NotificationBell,
});
```

#### How Core Renders Injected Header Slots (`AppHeader.tsx`):
```tsx
'use client';

import { useHeaderSlots } from '@/core/extension/headerRegistry';

export function AppHeader() {
  const headerSlots = useHeaderSlots();

  return (
    <header className={styles.header}>
      {/* ... Left Title Section ... */}

      <div className={styles.headerRight}>
        {/* Render dynamically registered module components */}
        {headerSlots.map((slot) => {
          const SlotComponent = slot.component;
          return <SlotComponent key={slot.id} />;
        })}

        <LogoutButton />
      </div>
    </header>
  );
}
```

---

### 2. Sidebar Navigation Slot Injection (`FG.UI.Sidebar`)

#### Registering a Navigation Item into the Sidebar:
```tsx
import { FG } from '@/core/extension/FG';
import { NavSection } from '@/core/navigation/types';
import { Bell } from 'lucide-react';

FG.UI.Sidebar.register({
  id: 'notifications-page',
  label: 'Notifications',
  icon: <Bell size={18} aria-hidden="true" />,
  href: '/notifications',
  badge: '3',
  order: 20,
  section: NavSection.MAIN,
});
```

---

### Mandatory Rules for AI Agents & Developers

1. **Do NOT hardcode module components in `core/` files**: If adding a new feature module, register its UI via `FG.UI.<Slot>.register(...)`.
2. **Always mark slot registries with `'use client'`**: Any extension registry importing React hooks (`useState`, `useEffect`) must include `'use client'` at the top of the file to comply with Next.js App Router rules.
3. **Always supply unique `id` strings**: Every registered slot must use a unique string identifier (e.g. `'notifications-bell'`, `'analytics-menu'`).
4. **Isolate Component Exports**: Never export non-component utilities alongside React UI components to preserve Fast Refresh compliance.

---

## Architecture Rules & Invariants

1. **`core/` never imports from `modules/`**.
2. **Modules never import from other modules**.
3. **Services handle business logic** — route handlers/controllers handle HTTP & validation.
4. **Module types live inside `src/modules/<name>/types.ts`** for 100% directory self-containment.
5. **Module API endpoints must always be namespaced under `/api/modules/<module-name>`** (e.g. `/api/modules/notifications`) to prevent route collisions with core kernel routes.
6. **UI Slot Injection**: Modules extend Core UI by registering components into extension slots (`FG.UI.Header.register`, `FG.UI.Sidebar.register`) without mutating core layout components.
