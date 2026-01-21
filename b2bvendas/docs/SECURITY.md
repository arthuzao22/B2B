# Security Features Documentation

## Overview

This document describes the advanced security features implemented for the B2B Marketplace platform. The security system includes rate limiting, CSRF protection, input sanitization, file validation, security headers, and comprehensive audit logging.

## Table of Contents

1. [Rate Limiting](#rate-limiting)
2. [CSRF Protection](#csrf-protection)
3. [Input Sanitization](#input-sanitization)
4. [File Upload Validation](#file-upload-validation)
5. [Security Headers](#security-headers)
6. [Audit Logging](#audit-logging)
7. [Middleware Integration](#middleware-integration)
8. [Configuration](#configuration)

---

## Rate Limiting

### Overview
Rate limiting prevents abuse by limiting the number of requests from a single IP address, user, or endpoint within a time window.

### Implementation
Uses Redis with sliding window algorithm for accurate rate limiting.

### Usage

```typescript
import { rateLimitByIp, rateLimitByUser, rateLimitByEndpoint } from '@/lib/security/rate-limiter';

// Rate limit by IP
const response = await rateLimitByIp(req, {
  windowMs: 60000,  // 1 minute
  max: 100,         // 100 requests per minute
});

// Rate limit by user
const result = await rateLimitByUser(userId, {
  windowMs: 60000,
  max: 200,
});

// Rate limit specific endpoint
const response = await rateLimitByEndpoint(req, '/api/sensitive', {
  windowMs: 60000,
  max: 10,
});
```

### Configuration

```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 60000,     // Time window in ms
  max: 100,            // Max requests per window
  keyPrefix: 'api',    // Redis key prefix
};
```

### Whitelist
Set trusted IPs in environment variables:
```bash
RATE_LIMIT_WHITELIST=192.168.1.1,10.0.0.1
```

---

## CSRF Protection

### Overview
CSRF (Cross-Site Request Forgery) protection prevents unauthorized commands from being transmitted from a user that the web application trusts.

### Implementation
Uses double-submit cookie pattern with cryptographically secure tokens.

### Usage

```typescript
import { csrfProtection, getCsrfToken } from '@/lib/security/csrf';

// Validate CSRF token (in middleware)
const csrfError = await csrfProtection(req);
if (csrfError) return csrfError;

// Get token for client-side
const token = getCsrfToken(req);
```

### Client-Side Integration

Add token to forms:
```html
<input type="hidden" name="csrf-token" value="{csrfToken}" />
```

Add token to API requests:
```javascript
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## Input Sanitization

### Overview
Input sanitization prevents XSS (Cross-Site Scripting) attacks by cleaning user input.

### Usage

```typescript
import {
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeFilename,
  deepSanitize,
} from '@/lib/security/sanitizer';

// Escape HTML
const safe = escapeHtml(userInput);

// Sanitize HTML (allows safe tags)
const cleanHtml = sanitizeHtml(richTextInput);

// Sanitize URL
const safeUrl = sanitizeUrl(userUrl);

// Sanitize email
const cleanEmail = sanitizeEmail(emailInput);

// Sanitize filename
const safeFilename = sanitizeFilename(uploadedFile.name);

// Deep sanitize entire object
const cleanData = deepSanitize(userObject);
```

### Allowed HTML Tags
By default, only these tags are allowed:
- `p`, `br`, `strong`, `em`, `u`
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `ul`, `ol`, `li`
- `a` (with href, title, target attributes)
- `blockquote`, `code`, `pre`

---

## File Upload Validation

### Overview
Validates uploaded files for security vulnerabilities including file type, size, and malicious content.

### Usage

```typescript
import { validateFile, validateFiles, ALLOWED_FILE_TYPES } from '@/lib/security/file-validator';

// Validate single file
const result = await validateFile(file, 'images');
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Validate multiple files
const results = await validateFiles(files, 'documents', 10);
if (!results.valid) {
  console.error('Errors:', results.errors);
}
```

### Allowed File Types

**Images**: jpg, jpeg, png, gif, webp, svg (max 5MB)
**Documents**: pdf, doc, docx, xls, xlsx, txt, csv (max 10MB)
**Archives**: zip, tar, gz, rar (max 50MB)
**Videos**: mp4, webm, ogg (max 100MB)

### Security Features

- MIME type validation
- File extension validation
- File signature verification (magic numbers)
- Dangerous extension blocking (.exe, .bat, .sh, etc.)
- Double extension detection
- Null byte detection
- Directory traversal prevention

---

## Security Headers

### Overview
Security headers protect against various attacks including XSS, clickjacking, and MIME sniffing.

### Headers Applied

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
```

### Usage

```typescript
import { securityHeadersMiddleware, SECURITY_PRESETS } from '@/lib/security/security-headers';

// Apply default headers
response = securityHeadersMiddleware(response);

// Apply strict preset
response = securityHeadersMiddleware(response, SECURITY_PRESETS.strict);

// Custom configuration
response = securityHeadersMiddleware(response, {
  xFrameOptions: 'DENY',
  contentSecurityPolicy: true,
});
```

---

## Audit Logging

### Overview
Comprehensive audit logging tracks all security-relevant events and user actions.

### Logged Events

**Authentication**: Login, logout, failed login attempts
**User Management**: User creation, updates, deletion
**Resources**: Product, order, inventory changes
**Security**: Rate limit exceeded, CSRF failures, unauthorized access
**Settings**: Configuration changes

### Usage

```typescript
import {
  logAuthEvent,
  logUserEvent,
  logProductEvent,
  logSecurityEvent,
  logAuditFromRequest,
} from '@/modules/audit/audit.service';
import { AuditAction, AuditResource } from '@/modules/audit/audit.types';

// Log authentication
await logAuthEvent(AuditAction.LOGIN, userId, req);

// Log user management
await logUserEvent(
  AuditAction.USER_CREATED,
  adminUserId,
  newUserId,
  req
);

// Log product changes
await logProductEvent(
  AuditAction.PRODUCT_UPDATED,
  userId,
  productId,
  { changes: diff }
);

// Log security events
await logSecurityEvent(
  AuditAction.RATE_LIMIT_EXCEEDED,
  req,
  { endpoint: '/api/endpoint' }
);
```

### Querying Audit Logs

```typescript
import { queryAuditLogs } from '@/modules/audit/audit.repository';

const logs = await queryAuditLogs({
  userId: 'user-id',
  action: AuditAction.LOGIN,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  page: 1,
  limit: 50,
});
```

### API Endpoint

```bash
# Query logs
GET /api/audit?userId={userId}&action={action}&page=1&limit=50

# Get statistics
POST /api/audit
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

---

## Middleware Integration

### Overview
All security features are integrated into the Next.js middleware for automatic protection.

### Features Applied

1. **Rate Limiting**: 100 requests per minute per IP
2. **CSRF Protection**: Validates tokens on state-changing requests
3. **Security Headers**: Comprehensive headers on all responses
4. **Request Timeout**: 30 seconds maximum
5. **Audit Logging**: Logs security events and unauthorized access

### Middleware Flow

```
Request → Rate Limit Check → CSRF Validation → Auth Check → 
Role Check → Inject CSRF Token → Apply Security Headers → Response
```

---

## Configuration

### Environment Variables

```bash
# Redis (required for rate limiting)
REDIS_URL=redis://localhost:6379

# Rate limiting
RATE_LIMIT_WHITELIST=192.168.1.1,10.0.0.1

# Node environment
NODE_ENV=production
```

### Redis Setup

Install and start Redis:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

---

## Security Best Practices

### 1. Rate Limiting
- Apply stricter limits to sensitive endpoints
- Whitelist trusted IPs (internal services, CDN)
- Monitor rate limit violations

### 2. CSRF Protection
- Always validate tokens on state-changing requests
- Use SameSite cookies in production
- Rotate tokens periodically

### 3. Input Sanitization
- Sanitize all user input before storage
- Use prepared statements for database queries
- Validate input on both client and server

### 4. File Uploads
- Store files outside web root
- Use unique, unpredictable filenames
- Scan files for viruses (integrate antivirus)
- Limit file sizes appropriately

### 5. Security Headers
- Use strict CSP in production
- Enable HSTS with preload
- Disable embedding via X-Frame-Options

### 6. Audit Logging
- Log all security-relevant events
- Monitor logs for suspicious activity
- Implement log retention policy (90 days default)
- Regular log analysis for security incidents

---

## Testing

### Rate Limiting Test
```bash
# Test rate limiting
for i in {1..150}; do
  curl http://localhost:3000/api/test
done
```

### CSRF Test
```bash
# Should fail without token
curl -X POST http://localhost:3000/api/endpoint

# Should succeed with token
curl -X POST http://localhost:3000/api/endpoint \
  -H "X-CSRF-Token: {token}"
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. Rate limit violations
2. Failed login attempts
3. CSRF validation failures
4. Unauthorized access attempts
5. Suspicious file uploads
6. Security header violations

### Alert Thresholds

- **Critical**: >100 failed logins from single IP in 1 hour
- **Warning**: >50 rate limit violations in 1 hour
- **Info**: CSRF failures (may be legitimate browser issues)

---

## Troubleshooting

### Rate Limiting Issues

**Problem**: Legitimate users getting rate limited
**Solution**: Increase limits or add IP to whitelist

**Problem**: Rate limiting not working
**Solution**: Check Redis connection and logs

### CSRF Issues

**Problem**: Forms failing with CSRF error
**Solution**: Ensure token is included in request headers/body

**Problem**: Token not being set
**Solution**: Check middleware configuration and cookie settings

### Audit Logs Not Recording

**Problem**: Logs not appearing in database
**Solution**: Check Prisma schema migration and database connection

---

## Migration

### Database Migration

Run Prisma migration to create AuditLog table:
```bash
npx prisma migrate dev --name add-audit-logs
npx prisma generate
```

### Schema
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  resource    String
  resourceId  String?
  ip          String?
  userAgent   String?
  metadata    Json
  severity    String
  timestamp   DateTime @default(now())
  
  @@map("audit_logs")
}
```

---

## Support

For security issues or questions:
- Create an issue in the repository
- Contact the security team
- Review audit logs for incidents

---

## License

This security implementation is part of the B2B Marketplace platform.
