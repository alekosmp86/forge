import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { UserRole } from '@forge/shared-types';

async function main() {
  console.log('🌱 Seeding database initial users...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const BCRYPT_SALT_ROUNDS = 12;
  const defaultPassword = 'password123';
  const passwordHash = await bcrypt.hash(defaultPassword, BCRYPT_SALT_ROUNDS);

  const initialUsers = [
    {
      email: 'admin@forge.com',
      role: UserRole.ADMIN,
    },
    {
      email: 'user@forge.com',
      role: UserRole.USER,
    },
  ];

  await Promise.all(
    initialUsers.map(async (userData) => {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          passwordHash,
          isActive: true,
        },
        create: {
          email: userData.email,
          passwordHash,
          role: userData.role,
          isActive: true,
        },
      });

      console.log(`✓ User seeded successfully:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${defaultPassword}`);
      console.log(`  Role:     ${user.role}`);
    })
  );

  await prisma.$disconnect();
  await pool.end();
  console.log('✨ Seeding completed successfully!');
}

main().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
