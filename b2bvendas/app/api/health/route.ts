import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
    redis?: {
      status: 'ok' | 'error';
      message?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '0.1.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'ok',
      },
    },
  };

  // Check Database Connection
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;
    
    healthStatus.checks.database = {
      status: 'ok',
      message: 'Database connection successful',
      responseTime: dbResponseTime,
    };
  } catch (error) {
    healthStatus.checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
    healthStatus.status = 'unhealthy';
  }

  // Check Redis Connection (if REDIS_URL is configured)
  if (process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid errors if redis is not installed
      const { createClient } = await import('redis').catch(() => ({ createClient: null }));
      
      if (createClient) {
        const redisClient = createClient({
          url: process.env.REDIS_URL,
        });

        await redisClient.connect();
        await redisClient.ping();
        await redisClient.disconnect();

        healthStatus.checks.redis = {
          status: 'ok',
          message: 'Redis connection successful',
        };
      } else {
        healthStatus.checks.redis = {
          status: 'ok',
          message: 'Redis client not configured',
        };
      }
    } catch (error) {
      healthStatus.checks.redis = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Redis connection failed',
      };
      // Redis is optional, so mark as degraded instead of unhealthy
      if (healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded';
      }
    }
  }

  // Determine HTTP status code
  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthStatus, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
