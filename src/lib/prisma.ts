import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getSafeDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // Jika URL tidak diatur atau menggunakan SQLite lokal (file:)
  if (!envUrl || envUrl.startsWith('file:')) {
    const prismaDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const rootDbPath = path.join(process.cwd(), 'dev.db');

    if (fs.existsSync(prismaDbPath)) {
      return `file:${prismaDbPath}`;
    }
    if (fs.existsSync(rootDbPath)) {
      return `file:${rootDbPath}`;
    }
    return `file:${prismaDbPath}`;
  }

  return envUrl;
}

function createPrismaClient(): PrismaClient {
  const dbUrl = getSafeDatabaseUrl();
  return new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;