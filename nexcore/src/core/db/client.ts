import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// ─── Prisma Singleton ─────────────────────────────────────────────────────────
//
// Prisma v7 requires using the pg adapter for connection pooling.
// This pattern matches the one established in olimpo-sales-manager.
// See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

// Prevent multiple Prisma instances in development due to hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
