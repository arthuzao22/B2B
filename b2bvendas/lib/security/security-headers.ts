/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers to protect against common attacks:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME sniffing
 * - Information disclosure
 */

import { NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean;
  strictTransportSecurity?: boolean;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  xssProtection?: boolean;
  expectCT?: boolean;
}

/**
 * Default Content Security Policy
 */
const DEFAULT_CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://api.resend.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Build CSP string from policy object
 */
function buildCSP(policy: typeof DEFAULT_CSP): string {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Get default CSP based on environment
 */
function getDefaultCSP(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const csp = { ...DEFAULT_CSP };
  
  if (isDevelopment) {
    // Relaxed CSP for development
    csp['script-src'].push('http://localhost:*');
    csp['connect-src'].push('ws://localhost:*', 'http://localhost:*');
    // Remove upgrade-insecure-requests in dev
    delete csp['upgrade-insecure-requests'];
  }
  
  return buildCSP(csp);
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Content Security Policy
  if (config.contentSecurityPolicy !== false) {
    const csp = typeof config.contentSecurityPolicy === 'string'
      ? config.contentSecurityPolicy
      : getDefaultCSP();
    
    response.headers.set('Content-Security-Policy', csp);
  }
  
  // Strict-Transport-Security (HTTPS only in production)
  if (config.strictTransportSecurity !== false && isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  
  // X-Frame-Options (Clickjacking protection)
  const frameOptions = config.xFrameOptions || 'DENY';
  response.headers.set('X-Frame-Options', frameOptions);
  
  // X-Content-Type-Options (MIME sniffing protection)
  if (config.xContentTypeOptions !== false) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  // Referrer-Policy
  const referrerPolicy = config.referrerPolicy || 'strict-origin-when-cross-origin';
  response.headers.set('Referrer-Policy', referrerPolicy);
  
  // Permissions-Policy (formerly Feature-Policy)
  const permissionsPolicy = config.permissionsPolicy || 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()';
  response.headers.set('Permissions-Policy', permissionsPolicy);
  
  // X-XSS-Protection (Legacy browsers)
  if (config.xssProtection !== false) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  
  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Expect-CT (Certificate Transparency)
  if (config.expectCT !== false && isProduction) {
    response.headers.set('Expect-CT', 'max-age=86400, enforce');
  }
  
  // Remove sensitive headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // Cross-Origin policies
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  return response;
}

/**
 * Security headers middleware for Next.js
 */
export function securityHeadersMiddleware(
  response: NextResponse,
  config?: SecurityHeadersConfig
): NextResponse {
  return applySecurityHeaders(response, config);
}

/**
 * CORS headers configuration
 */
export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Apply CORS headers
 */
export function applyCORSHeaders(
  response: NextResponse,
  origin: string | null,
  config: CORSConfig
): NextResponse {
  const { allowedOrigins, allowedMethods, allowedHeaders, credentials, maxAge } = config;
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  // Allow credentials
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Allowed methods
  const methods = allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  
  // Allowed headers
  const headers = allowedHeaders || [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ];
  response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
  
  // Max age
  const age = maxAge || 86400;
  response.headers.set('Access-Control-Max-Age', age.toString());
  
  return response;
}

/**
 * Create security headers for API routes
 */
export function apiSecurityHeaders(response: NextResponse): NextResponse {
  // Specific headers for API endpoints
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

/**
 * Preset configurations for different scenarios
 */
export const SECURITY_PRESETS = {
  strict: {
    contentSecurityPolicy: true,
    strictTransportSecurity: true,
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    referrerPolicy: 'no-referrer',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    xssProtection: true,
    expectCT: true,
  },
  moderate: {
    contentSecurityPolicy: true,
    strictTransportSecurity: true,
    xFrameOptions: 'SAMEORIGIN',
    xContentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    xssProtection: true,
    expectCT: false,
  },
  relaxed: {
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    xFrameOptions: 'SAMEORIGIN',
    xContentTypeOptions: true,
    referrerPolicy: 'no-referrer-when-downgrade',
    xssProtection: true,
    expectCT: false,
  },
} as const;

/**
 * Get security headers preset
 */
export function getSecurityPreset(
  preset: keyof typeof SECURITY_PRESETS = 'moderate'
): SecurityHeadersConfig {
  return SECURITY_PRESETS[preset];
}
