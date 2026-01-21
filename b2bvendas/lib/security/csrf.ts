/**
 * CSRF Token Generation and Validation
 * 
 * Implements CSRF protection using double-submit cookie pattern
 * Generates secure tokens and validates them on state-changing requests
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Token configuration
const TOKEN_LENGTH = 32;
const TOKEN_COOKIE_NAME = 'csrf-token';
const TOKEN_HEADER_NAME = 'x-csrf-token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('base64url');
}

/**
 * Hash token for comparison (timing-safe)
 */
function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('base64url');
}

/**
 * Compare tokens in a timing-safe manner
 */
function compareTokens(token1: string, token2: string): boolean {
  try {
    const hash1 = hashToken(token1);
    const hash2 = hashToken(token2);
    return crypto.timingSafeEqual(
      Buffer.from(hash1),
      Buffer.from(hash2)
    );
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request
 */
function extractTokenFromRequest(req: NextRequest): string | null {
  // Check header first
  const headerToken = req.headers.get(TOKEN_HEADER_NAME);
  if (headerToken) return headerToken;
  
  // Check body for form submissions
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    // Token would need to be in form data
    // This requires parsing the body, handled at route level
  }
  
  return null;
}

/**
 * Extract CSRF token from cookie
 */
function extractTokenFromCookie(req: NextRequest): string | null {
  const cookies = req.cookies.get(TOKEN_COOKIE_NAME);
  return cookies?.value || null;
}

/**
 * Check if request method requires CSRF protection
 */
function requiresCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip validation for safe methods
  if (!requiresCsrfProtection(req.method)) {
    return true;
  }
  
  const requestToken = extractTokenFromRequest(req);
  const cookieToken = extractTokenFromCookie(req);
  
  // Both tokens must exist
  if (!requestToken || !cookieToken) {
    return false;
  }
  
  // Tokens must match
  return compareTokens(requestToken, cookieToken);
}

/**
 * Add CSRF token to response cookies
 */
export function setCsrfCookie(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken();
  
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/',
  });
  
  // Also send token in header for client-side access
  response.headers.set(TOKEN_HEADER_NAME, csrfToken);
  
  return response;
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(req: NextRequest): Promise<NextResponse | null> {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  if (!requiresCsrfProtection(req.method)) {
    return null;
  }
  
  // Skip for API routes that use other auth mechanisms
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/auth')) {
    return null;
  }
  
  // Validate token
  if (!validateCsrfToken(req)) {
    return NextResponse.json(
      { 
        error: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED'
      },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Middleware to inject CSRF token into responses
 */
export function injectCsrfToken(req: NextRequest, response: NextResponse): NextResponse {
  // Only inject token for HTML responses or API endpoints that need it
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    // Check if cookie already exists
    const existingToken = req.cookies.get(TOKEN_COOKIE_NAME);
    
    if (!existingToken) {
      // Generate and set new token
      return setCsrfCookie(response);
    }
  }
  
  return response;
}

/**
 * Get CSRF token for client-side use
 */
export function getCsrfToken(req: NextRequest): string {
  const existingToken = extractTokenFromCookie(req);
  return existingToken || generateCsrfToken();
}

/**
 * Verify CSRF token from request body
 */
export function verifyCsrfFromBody(cookieToken: string, bodyToken: string): boolean {
  if (!cookieToken || !bodyToken) {
    return false;
  }
  
  return compareTokens(cookieToken, bodyToken);
}

export const CSRF_CONFIG = {
  TOKEN_LENGTH,
  TOKEN_COOKIE_NAME,
  TOKEN_HEADER_NAME,
  TOKEN_EXPIRY,
} as const;
