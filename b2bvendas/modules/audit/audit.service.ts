/**
 * Audit Log Service
 * 
 * High-level service for audit logging with automatic context extraction
 */

import { NextRequest } from 'next/server';
import { createAuditLog } from './audit.repository';
import {
  AuditLogData,
  AuditAction,
  AuditResource,
  AuditSeverity,
} from './audit.types';
import logger from '@/lib/logger';

/**
 * Extract client info from request
 */
function extractClientInfo(req: NextRequest) {
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return { ip, userAgent };
}

/**
 * Log audit event
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await createAuditLog(data);
    
    // Also log to application logger for critical events
    if (data.severity === AuditSeverity.CRITICAL || data.severity === AuditSeverity.ERROR) {
      logger.warn('Audit event', {
        action: data.action,
        resource: data.resource,
        userId: data.userId,
        ip: data.ip,
      });
    }
  } catch (error) {
    logger.error('Failed to create audit log', { error });
  }
}

/**
 * Log audit event from request
 */
export async function logAuditFromRequest(
  req: NextRequest,
  data: Omit<AuditLogData, 'ip' | 'userAgent'>
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(req);
  
  await logAudit({
    ...data,
    ip,
    userAgent,
  });
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
  userId: string | undefined,
  req: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(req);
  
  await logAudit({
    userId,
    action,
    resource: AuditResource.USER,
    ip,
    userAgent,
    metadata,
    severity: action === AuditAction.LOGIN_FAILED ? AuditSeverity.WARNING : AuditSeverity.INFO,
  });
}

/**
 * Log user management event
 */
export async function logUserEvent(
  action: AuditAction,
  userId: string,
  targetUserId: string,
  req?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const clientInfo = req ? extractClientInfo(req) : undefined;
  
  await logAudit({
    userId,
    action,
    resource: AuditResource.USER,
    resourceId: targetUserId,
    ip: clientInfo?.ip,
    userAgent: clientInfo?.userAgent,
    metadata,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Log product event
 */
export async function logProductEvent(
  action: AuditAction,
  userId: string,
  productId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource: AuditResource.PRODUCT,
    resourceId: productId,
    metadata,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Log order event
 */
export async function logOrderEvent(
  action: AuditAction,
  userId: string,
  orderId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource: AuditResource.ORDER,
    resourceId: orderId,
    metadata,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  action: AuditAction,
  req: NextRequest,
  metadata?: Record<string, any>,
  severity: AuditSeverity = AuditSeverity.WARNING
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(req);
  
  await logAudit({
    action,
    resource: AuditResource.SECURITY,
    ip,
    userAgent,
    metadata: {
      ...metadata,
      path: req.nextUrl.pathname,
      method: req.method,
    },
    severity,
  });
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  req: NextRequest,
  endpoint?: string
): Promise<void> {
  await logSecurityEvent(
    AuditAction.RATE_LIMIT_EXCEEDED,
    req,
    { endpoint },
    AuditSeverity.WARNING
  );
}

/**
 * Log CSRF validation failure
 */
export async function logCsrfFailure(req: NextRequest): Promise<void> {
  await logSecurityEvent(
    AuditAction.CSRF_VALIDATION_FAILED,
    req,
    undefined,
    AuditSeverity.WARNING
  );
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  req: NextRequest,
  userId?: string,
  reason?: string
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(req);
  
  await logAudit({
    userId,
    action: AuditAction.UNAUTHORIZED_ACCESS,
    resource: AuditResource.SECURITY,
    ip,
    userAgent,
    metadata: {
      reason,
      path: req.nextUrl.pathname,
      method: req.method,
    },
    severity: AuditSeverity.WARNING,
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  req: NextRequest,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(req);
  
  await logAudit({
    action: AuditAction.SUSPICIOUS_ACTIVITY,
    resource: AuditResource.SECURITY,
    ip,
    userAgent,
    description,
    metadata: {
      ...metadata,
      path: req.nextUrl.pathname,
      method: req.method,
    },
    severity: AuditSeverity.ERROR,
  });
}

/**
 * Log data export
 */
export async function logDataExport(
  userId: string,
  resource: AuditResource,
  metadata?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.DATA_EXPORTED,
    resource,
    metadata,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Log settings change
 */
export async function logSettingsChange(
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.SETTINGS_UPDATED,
    resource: AuditResource.SETTINGS,
    metadata,
    severity: AuditSeverity.INFO,
  });
}

/**
 * Audit decorator for functions
 */
export function withAudit(
  action: AuditAction,
  resource: AuditResource,
  severity: AuditSeverity = AuditSeverity.INFO
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Extract userId and resourceId from arguments or result
      const [userId, resourceId] = args;
      
      await logAudit({
        userId,
        action,
        resource,
        resourceId,
        severity,
      });
      
      return result;
    };
    
    return descriptor;
  };
}

export * from './audit.types';
export * from './audit.repository';
