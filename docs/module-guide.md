# Module Integration Guide (nexcore)

This document describes the exact steps for adding a new feature module to `nexcore`. Follow this precisely. Do not deviate.

---

## What Is a Module?

A module is a self-contained feature domain. It lives entirely inside `src/modules/<module-name>/` and:
- Owns its own types, service interface, service implementation, and API route handlers.
- Imports from `src/core/` for shared utilities (db client, auth, error classes, validation helpers).
- **Never imports from another module.**

---

## Module Folder Structure

```
src/modules/<module-name>/
├── types.ts                ← DTOs and domain types for this module
├── constants.ts            ← Module-specific enums/constants (as const)
├── I<Name>Service.ts       ← Service interface (SOLID ISP)
├── <Name>Service.ts        ← Service implementation
└── api/                   ← API route handlers
    ├── index.ts            ← Route: GET/POST /api/<name>
    └── [id]/
        └── index.ts        ← Route: GET/PUT/DELETE /api/<name>/[id]
```

> **Note:** For modules with complex read vs. write semantics, consider splitting:
> `IProductReader.ts` + `IProductWriter.ts` rather than one monolithic interface.

---

## Step-by-Step: Adding a Module

### Step 1: Define the Domain Types

Create `src/modules/<name>/types.ts`. Define your DTOs here. If a type is shared with `javacore` or the client, it should live in `@forge/shared-types` and be imported here.

```ts
// src/modules/products/types.ts
export interface ProductDTO {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
```

### Step 2: Define the Service Interface

Create `src/modules/<name>/I<Name>Service.ts`. Keep it narrow — if you have distinct read/write concerns, split into two interfaces.

```ts
// src/modules/products/IProductService.ts
import type { ProductDTO } from './types';

export interface IProductService {
  findAll(): Promise<ProductDTO[]>;
  findById(productId: string): Promise<ProductDTO | null>;
  create(data: CreateProductInput): Promise<ProductDTO>;
  update(productId: string, data: UpdateProductInput): Promise<ProductDTO>;
  delete(productId: string): Promise<void>;
}
```

### Step 3: Implement the Service

Create `src/modules/<name>/<Name>Service.ts`. Import the Prisma client from core.

```ts
// src/modules/products/ProductService.ts
import 'server-only';
import { prisma } from '@/core/db/client';
import type { IProductService } from './IProductService';
import type { ProductDTO } from './types';

export const productService: IProductService = {
  async findAll() { ... },
  async findById(productId) { ... },
  async create(data) { ... },
  async update(productId, data) { ... },
  async delete(productId) { ... },
};
```

### Step 4: Add Prisma Schema Models

Add your model(s) to `prisma/schema.prisma`. Run `npx prisma migrate dev --name add_products` to generate a migration.

### Step 5: Create API Routes

Create route handlers under `src/app/api/<name>/`. Import from your module — not from other modules.

```ts
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { productService } from '@/modules/products/ProductService';
import { AppError } from '@/core/errors/AppError';
import { validateSession } from '@/core/auth/session';
import { createProductSchema } from '@/modules/products/constants';

export async function GET() {
  const products = await productService.findAll();
  return NextResponse.json({ data: products });
}

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await productService.create(parsed.data);
  return NextResponse.json({ data: product }, { status: 201 });
}
```

### Step 6: Create Frontend Hooks (if needed)

Create a custom hook in `src/modules/<name>/hooks/` using TanStack Query.

```ts
// src/modules/products/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import type { ProductDTO } from '../types';

export function useProducts() {
  return useQuery<ProductDTO[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const json = await response.json();
      return json.data;
    },
  });
}
```

### Step 7: Document the Module

Update `docs/progress.md` with:
- Module name and what it does
- Any Prisma models added
- Any env variables required
- Known limitations or TODOs

---

## Module Checklist

- [ ] `types.ts` created
- [ ] `I<Name>Service.ts` interface created (SOLID ISP respected)
- [ ] `<Name>Service.ts` implementation created
- [ ] Prisma schema updated + migration created
- [ ] API routes created (validation at route layer, business logic in service)
- [ ] No imports from other modules
- [ ] `docs/progress.md` updated
