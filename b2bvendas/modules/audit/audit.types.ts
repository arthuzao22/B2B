/**
 * Audit Log Types
 * 
 * Type definitions for the audit logging system
 */

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  
  // Products
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  PRODUCT_VIEWED = 'PRODUCT_VIEWED',
  
  // Orders
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // Inventory
  STOCK_UPDATED = 'STOCK_UPDATED',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  
  // Pricing
  PRICE_UPDATED = 'PRICE_UPDATED',
  PRICE_LIST_CREATED = 'PRICE_LIST_CREATED',
  PRICE_LIST_UPDATED = 'PRICE_LIST_UPDATED',
  
  // Security
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VALIDATION_FAILED = 'CSRF_VALIDATION_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Settings
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  
  // API
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  
  // Data Export
  DATA_EXPORTED = 'DATA_EXPORTED',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

export enum AuditResource {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  CATEGORY = 'CATEGORY',
  PRICE_LIST = 'PRICE_LIST',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS',
  API_KEY = 'API_KEY',
  REPORT = 'REPORT',
  SECURITY = 'SECURITY',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity?: AuditSeverity;
  description?: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: AuditResource | AuditResource[];
  resourceId?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  ip?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogEntry extends AuditLogData {
  id: string;
  timestamp: Date;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
