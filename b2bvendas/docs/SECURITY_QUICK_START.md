# Security Features - Quick Reference

## Installation

### 1. Install Dependencies
The required dependencies (`ioredis`) are already in package.json.

### 2. Setup Redis
```bash
# Docker (Recommended)
docker run -d -p 6379:6379 --name redis redis:alpine

# Or use docker-compose.yml
docker-compose up -d redis
```

### 3. Configure Environment
Add to `.env`:
```bash
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WHITELIST=127.0.0.1,::1
```

### 4. Run Database Migration
```bash
npx prisma migrate dev --name add-audit-logs
npx prisma generate
```

---

## Quick Start

### Rate Limiting

```typescript
import { rateLimitByIp } from '@/lib/security/rate-limiter';

// In API route
const limitResponse = await rateLimitByIp(req, {
  windowMs: 60000,  // 1 minute
  max: 100,         // 100 requests
});

if (limitResponse) return limitResponse;
```

### CSRF Protection

```typescript
import { csrfProtection, getCsrfToken } from '@/lib/security/csrf';

// In API route
const csrfError = await csrfProtection(req);
if (csrfError) return csrfError;

// In page/component
const token = getCsrfToken(req);
```

### Input Sanitization

```typescript
import { sanitizeHtml, sanitizeEmail } from '@/lib/security/sanitizer';

const clean = sanitizeHtml(userInput);
const email = sanitizeEmail(emailInput);
```

### File Validation

```typescript
import { validateFile } from '@/lib/security/file-validator';

const result = await validateFile(file, 'images');
if (!result.valid) {
  return { errors: result.errors };
}
```

### Audit Logging

```typescript
import { logAuthEvent, AuditAction } from '@/modules/audit/audit.service';

await logAuthEvent(AuditAction.LOGIN, userId, req);
```

---

## Module Structure

```
lib/security/
├── rate-limiter.ts       # Rate limiting with Redis
├── csrf.ts               # CSRF token generation/validation
├── sanitizer.ts          # Input sanitization
├── file-validator.ts     # File upload validation
├── security-headers.ts   # HTTP security headers
└── index.ts             # Exports

modules/audit/
├── audit.types.ts        # Type definitions
├── audit.repository.ts   # Database operations
└── audit.service.ts      # High-level API

app/api/audit/
└── route.ts             # Audit logs API endpoint

middleware.ts             # Main security middleware
```

---

## API Endpoints

### Query Audit Logs
```bash
GET /api/audit?userId={id}&action=LOGIN&page=1&limit=50
```

### Get Statistics
```bash
POST /api/audit
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

---

## Middleware Features

✅ Rate Limiting (100 req/min per IP)
✅ CSRF Protection (state-changing requests)
✅ Security Headers (CSP, HSTS, etc.)
✅ Request Timeout (30 seconds)
✅ Audit Logging (security events)
✅ Role-Based Access Control

---

## Security Headers Applied

```
Content-Security-Policy
Strict-Transport-Security
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
```

**Note**: X-XSS-Protection header is deprecated and disabled by default.

---

## Common Use Cases

### Protect API Endpoint
```typescript
// app/api/sensitive/route.ts
import { rateLimitByEndpoint, csrfProtection } from '@/lib/security';
import { logAuditFromRequest, AuditAction, AuditResource } from '@/modules/audit';

export async function POST(req: NextRequest) {
  // Rate limit
  const rateLimit = await rateLimitByEndpoint(req, 'sensitive', {
    windowMs: 60000,
    max: 10,
  });
  if (rateLimit) return rateLimit;
  
  // CSRF
  const csrf = await csrfProtection(req);
  if (csrf) return csrf;
  
  // Audit log
  await logAuditFromRequest(req, {
    userId: session.user.id,
    action: AuditAction.DATA_EXPORTED,
    resource: AuditResource.REPORT,
  });
  
  // Your logic here
}
```

### Sanitize User Input
```typescript
import { deepSanitize } from '@/lib/security/sanitizer';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cleanData = deepSanitize(data);
  
  // Save cleanData to database
}
```

### Validate File Upload
```typescript
import { validateFile, sanitizeUploadedFilename } from '@/lib/security/file-validator';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const result = await validateFile(file, 'images');
  if (!result.valid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  
  const safeFilename = sanitizeUploadedFilename(file.name);
  // Save file with safeFilename
}
```

---

## Testing

```bash
# Start Redis
docker-compose up -d redis

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev

# Test rate limiting
for i in {1..150}; do curl http://localhost:3000/api/test; done

# Check audit logs
curl http://localhost:3000/api/audit?limit=10
```

---

## Troubleshooting

**Redis Connection Error**
```bash
# Check Redis is running
docker ps | grep redis
redis-cli ping  # Should return PONG
```

**Rate Limiting Not Working**
- Verify REDIS_URL in .env
- Check Redis logs: `docker logs redis`

**CSRF Failures**
- Check token in cookie and header
- Ensure middleware is applied
- Verify SameSite cookie settings

**Audit Logs Not Saving**
- Run Prisma migration
- Check database connection
- Verify AuditLog model exists

---

## Performance

- **Rate Limiting**: ~2ms overhead per request
- **CSRF Validation**: ~1ms overhead
- **Audit Logging**: Async, no blocking
- **Security Headers**: Negligible overhead

---

## Security Checklist

- [ ] Redis installed and running
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Rate limits configured appropriately
- [ ] CSRF protection enabled
- [ ] Audit logs being recorded
- [ ] Security headers verified
- [ ] Whitelisted IPs configured
- [ ] Monitoring alerts set up

---

## Next Steps

1. Configure monitoring and alerts
2. Set up log rotation for audit logs
3. Integrate virus scanning for file uploads
4. Configure backup for Redis
5. Review and adjust rate limits based on traffic

---

For detailed documentation, see [SECURITY.md](./SECURITY.md)
