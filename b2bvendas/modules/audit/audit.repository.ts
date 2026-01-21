/**
 * Audit Log Repository
 * 
 * Database operations for audit logs
 */

import { prisma } from '@/lib/prisma/client';
import {
  AuditLogData,
  AuditLogFilter,
  AuditLogResponse,
  AuditAction,
  AuditResource,
  AuditSeverity,
} from './audit.types';

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        ip: data.ip,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
        severity: data.severity || AuditSeverity.INFO,
        description: data.description,
      },
    });
  } catch (error) {
    // Log error but don't throw to prevent breaking main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(
  filter: AuditLogFilter
): Promise<AuditLogResponse> {
  const {
    userId,
    action,
    resource,
    resourceId,
    severity,
    startDate,
    endDate,
    ip,
    page = 1,
    limit = 50,
  } = filter;

  // Build where clause
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = Array.isArray(action) ? { in: action } : action;
  }

  if (resource) {
    where.resource = Array.isArray(resource) ? { in: resource } : resource;
  }

  if (resourceId) {
    where.resourceId = resourceId;
  }

  if (severity) {
    where.severity = severity;
  }

  if (ip) {
    where.ip = ip;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  // Execute query with pagination
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      userId: log.userId || undefined,
      action: log.action as AuditAction,
      resource: log.resource as AuditResource,
      resourceId: log.resourceId || undefined,
      ip: log.ip || undefined,
      userAgent: log.userAgent || undefined,
      metadata: log.metadata as Record<string, any>,
      severity: log.severity as AuditSeverity,
      description: log.description || undefined,
      timestamp: log.timestamp,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get audit logs for specific user
 */
export async function getUserAuditLogs(
  userId: string,
  page = 1,
  limit = 50
): Promise<AuditLogResponse> {
  return queryAuditLogs({ userId, page, limit });
}

/**
 * Get audit logs for specific resource
 */
export async function getResourceAuditLogs(
  resource: AuditResource,
  resourceId: string,
  page = 1,
  limit = 50
): Promise<AuditLogResponse> {
  return queryAuditLogs({ resource, resourceId, page, limit });
}

/**
 * Get recent security events
 */
export async function getSecurityEvents(
  hours = 24,
  limit = 100
): Promise<AuditLogResponse> {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return queryAuditLogs({
    resource: AuditResource.SECURITY,
    startDate,
    limit,
    page: 1,
  });
}

/**
 * Get failed login attempts
 */
export async function getFailedLoginAttempts(
  hours = 24,
  ip?: string
): Promise<AuditLogResponse> {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return queryAuditLogs({
    action: AuditAction.LOGIN_FAILED,
    startDate,
    ip,
    limit: 100,
    page: 1,
  });
}

/**
 * Get suspicious activities
 */
export async function getSuspiciousActivities(
  hours = 24,
  limit = 100
): Promise<AuditLogResponse> {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return queryAuditLogs({
    action: [
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.RATE_LIMIT_EXCEEDED,
      AuditAction.CSRF_VALIDATION_FAILED,
      AuditAction.UNAUTHORIZED_ACCESS,
    ],
    startDate,
    limit,
    page: 1,
  });
}

/**
 * Delete old audit logs (retention policy)
 */
export async function deleteOldAuditLogs(daysToKeep = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
      // Keep critical logs longer
      severity: {
        not: AuditSeverity.CRITICAL,
      },
    },
  });

  return result.count;
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(startDate: Date, endDate: Date) {
  const [
    totalLogs,
    actionStats,
    resourceStats,
    severityStats,
    topUsers,
  ] = await Promise.all([
    // Total logs count
    prisma.auditLog.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),

    // Group by action
    prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    }),

    // Group by resource
    prisma.auditLog.groupBy({
      by: ['resource'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    }),

    // Group by severity
    prisma.auditLog.groupBy({
      by: ['severity'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    }),

    // Top users by activity
    prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        userId: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    }),
  ]);

  return {
    totalLogs,
    actionStats: actionStats.map((stat) => ({
      action: stat.action,
      count: stat._count,
    })),
    resourceStats: resourceStats.map((stat) => ({
      resource: stat.resource,
      count: stat._count,
    })),
    severityStats: severityStats.map((stat) => ({
      severity: stat.severity,
      count: stat._count,
    })),
    topUsers: topUsers.map((stat) => ({
      userId: stat.userId,
      count: stat._count,
    })),
  };
}
