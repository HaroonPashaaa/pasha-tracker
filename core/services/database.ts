/**
 * Database Service
 * 
 * Prisma client initialization and database utilities.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma client singleton
let prisma: PrismaClient;

/**
 * Get Prisma client instance
 */
export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' }
      ]
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query} (${e.duration}ms)`);
      });
    }

    prisma.$on('error', (e) => {
      logger.error('Prisma error:', e.message);
    });
  }

  return prisma;
}

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrisma();
    await client.$connect();
    logger.info('Connected to database');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Disconnected from database');
    }
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrisma();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

export { prisma };
export default getPrisma;
