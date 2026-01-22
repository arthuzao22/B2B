/**
 * Rate Limiter Middleware
 * 
 * Implementação in-memory (Map) para rate limiting
 * Usando sliding window algorithm simples
 * 
 * ⚠️ IMPORTANTE: Em produção, usar Redis para suportar múltiplas instâncias
 */

import { NextRequest, NextResponse } from 'next/server';

// Store in-memory: Map<key, { count: number, resetAt: number }>
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Rate limit configuration types
export interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  max: number;            // Maximum requests per window
  keyPrefix?: string;     // Prefix for keys
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (req: NextRequest) => NextResponse;
}

// IP whitelist for trusted sources
const TRUSTED_IPS = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];

/**
 * Extract client IP from request
 */
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

/**
 * Check if IP is whitelisted
 */
function isWhitelisted(ip: string): boolean {
  return TRUSTED_IPS.includes(ip);
}

/**
 * Generate rate limit key
 */
function generateKey(prefix: string, identifier: string): string {
  return `rate_limit:${prefix}:${identifier}`;
}

/**
 * Sliding window rate limiter implementation (in-memory)
 */
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  
  try {
    const record = rateLimitStore.get(key);
    
    // Se não existe ou expirou, criar novo
    if (!record || record.resetAt < now) {
      const resetAt = now + config.windowMs;
      rateLimitStore.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: config.max - 1, resetAt };
    }
    
    // Incrementar contador
    record.count += 1;
    
    const allowed = record.count <= config.max;
    const remaining = Math.max(0, config.max - record.count);
    
    return { allowed, remaining, resetAt: record.resetAt };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if error
    return { allowed: true, remaining: config.max, resetAt: now + config.windowMs };
  }
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIp(
  req: NextRequest,
  config: RateLimitConfig = { windowMs: 60000, max: 100 }
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  
  // Skip whitelisted IPs
  if (isWhitelisted(ip)) {
    return null;
  }
  
  const key = generateKey(config.keyPrefix || 'ip', ip);
  const result = await checkRateLimit(key, config);
  
  if (!result.allowed) {
    const response = config.handler 
      ? config.handler(req)
      : NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
    
    response.headers.set('X-RateLimit-Limit', config.max.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
    response.headers.set('Retry-After', Math.ceil(config.windowMs / 1000).toString());
    
    return response;
  }
  
  return null;
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUser(
  userId: string,
  config: RateLimitConfig = { windowMs: 60000, max: 200 }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = generateKey(config.keyPrefix || 'user', userId);
  return checkRateLimit(key, config);
}

/**
 * Rate limit by endpoint
 */
export async function rateLimitByEndpoint(
  req: NextRequest,
  endpoint: string,
  config: RateLimitConfig = { windowMs: 60000, max: 50 }
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const key = generateKey(config.keyPrefix || 'endpoint', `${endpoint}:${ip}`);
  const result = await checkRateLimit(key, config);
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded for ${endpoint}` },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
        }
      }
    );
  }
  
  return null;
}

/**
 * Combined rate limiter middleware
 */
export async function rateLimiter(
  req: NextRequest,
  configs: {
    ip?: RateLimitConfig;
    user?: { userId: string; config: RateLimitConfig };
    endpoint?: { name: string; config: RateLimitConfig };
  }
): Promise<NextResponse | null> {
  // Check IP rate limit
  if (configs.ip) {
    const ipLimit = await rateLimitByIp(req, configs.ip);
    if (ipLimit) return ipLimit;
  }
  
  // Check user rate limit
  if (configs.user) {
    const userLimit = await rateLimitByUser(configs.user.userId, configs.user.config);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'User rate limit exceeded' },
        { status: 429 }
      );
    }
  }
  
  // Check endpoint rate limit
  if (configs.endpoint) {
    const endpointLimit = await rateLimitByEndpoint(
      req,
      configs.endpoint.name,
      configs.endpoint.config
    );
    if (endpointLimit) return endpointLimit;
  }
  
  return null;
}

/**
 * Reset rate limit for a specific key
 */
export async function resetRateLimit(prefix: string, identifier: string): Promise<void> {
  const key = generateKey(prefix, identifier);
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  prefix: string,
  identifier: string,
  windowMs: number
): Promise<{ count: number; resetAt: number }> {
  const key = generateKey(prefix, identifier);
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    return { count: 0, resetAt: now + windowMs };
  }
  
  return {
    count: entry.count,
    resetAt: entry.resetAt
  };
}
