# Forge — Deployment & Project Bootstrapping Guide

This guide explains how to:
1. **Option A**: Bootstrap a standalone new repository from `nexcore` for independent deployment (e.g., Vercel).
2. **Option B**: Deploy `nexcore` directly from the `forge` monorepo to Vercel.

---

## 🔑 Required Environment Variables

Every project built on `nexcore` requires two critical environment variables:

| Variable Name | Description | Example / Requirement |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require` |
| `SESSION_SECRET` | Secret key for signing JWT cookies (`jose`) | Minimum 32 characters (e.g. `openssl rand -base64 32`) |

> [!IMPORTANT]
> For serverless databases like **Neon**, **Supabase**, or **Vercel Postgres**, use a pooled connection string for `DATABASE_URL`.

---

## 🚀 Option A: Bootstrapping a Standalone Project from `nexcore`

Use this workflow to create a completely new, independent project repository based on the `nexcore` template.

### Step 1: Copy Template Files
Copy the `nexcore` directory into your new project folder:

```bash
# Create a new project directory
mkdir my-app
cd my-app

# Copy nexcore files into my-app (excluding node_modules and .next)
cp -r /path/to/forge/nexcore/* .
```

### Step 2: Configure `package.json` & Shared Types

1. Open `package.json` and set your project name:
   ```json
   {
     "name": "my-app",
     "version": "0.1.0"
   }
   ```

2. Handle `@forge/shared-types`:
   - **Option 2A (Local Copy)**: Copy `packages/shared-types` into `my-app/packages/shared-types` and keep `"@forge/shared-types": "file:./packages/shared-types"`.
   - **Option 2B (Published npm package)**: If published to npm or GitHub Packages, set `"@forge/shared-types": "^1.0.0"`.
   - **Option 2C (Inline types)**: Copy type definitions into `src/core/types.ts`.

### Step 3: Initialize Database & Environment Variables

1. Create a local `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_app_db?schema=public"
   SESSION_SECRET="your-32-character-random-secret-key-here"
   ```

2. Run Prisma migration and generate client:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```

### Step 4: Deploying to Vercel

1. Push your new project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/your-username/my-app.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Repository**.
   - Select your `my-app` repository.

3. **Configure Build Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npx prisma generate && npx prisma migrate deploy && next build`
   - **Output Directory**: `.next` (default)

4. **Set Environment Variables in Vercel**:
   - Add `DATABASE_URL` (e.g. Neon or Supabase connection string).
   - Add `SESSION_SECRET`.

5. Click **Deploy**.

---

## ⚡ Option B: Deploying `nexcore` Directly from the `forge` Monorepo

If you want to deploy `nexcore` straight from the `forge` monorepo on GitHub:

```mermaid
graph LR
    GitHubRepo["GitHub: alekosmp86/forge"] --> Vercel["Vercel Project"]
    Vercel --> RootDir["Root Directory: nexcore"]
    Vercel --> Database["Cloud PostgreSQL (Neon/Supabase)"]
```

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Repository**.
2. Select your `alekosmp86/forge` repository.
3. In the project setup screen, expand **Edit Root Directory** and select:
   ```text
   nexcore
   ```
4. **Build & Development Settings**:
   - **Build Command**: `npx prisma generate && npx prisma migrate deploy && next build`
5. **Environment Variables**:
   - `DATABASE_URL`: Cloud PostgreSQL connection string.
   - `SESSION_SECRET`: 32+ character JWT secret.
6. Click **Deploy**.

---

## 🛡️ Production Verification Checklist

Before or after deployment, verify the following:

- [ ] **Database Migrations**: Ran `npx prisma migrate deploy` in build script.
- [ ] **JWT Auth**: `SESSION_SECRET` is set and at least 32 characters.
- [ ] **Route Protection**: `src/proxy.ts` correctly intercepts protected routes.
- [ ] **Health & Doctor Audit**: Ran `npm run doctor` to confirm zero React / Next.js security or performance warnings.
- [ ] **Mobile-First Layout**: Tested login and dashboard pages on mobile viewport.
