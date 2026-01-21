# Security Features - Example Usage

## Example 1: Protected API Endpoint

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByEndpoint, csrfProtection } from '@/lib/security';
import { logProductEvent, AuditAction } from '@/modules/audit/audit.service';
import { sanitizeInput, deepSanitize } from '@/lib/security/sanitizer';

export async function POST(req: NextRequest) {
  // 1. Rate limiting - 20 product creations per minute
  const rateLimit = await rateLimitByEndpoint(req, 'products', {
    windowMs: 60000,
    max: 20,
  });
  if (rateLimit) return rateLimit;

  // 2. CSRF protection
  const csrfError = await csrfProtection(req);
  if (csrfError) return csrfError;

  // 3. Get and sanitize input
  const data = await req.json();
  const cleanData = deepSanitize(data);

  // 4. Your business logic
  const product = await createProduct(cleanData);

  // 5. Audit log
  await logProductEvent(
    AuditAction.PRODUCT_CREATED,
    req.userId, // From auth middleware
    product.id,
    { name: product.name }
  );

  return NextResponse.json(product);
}
```

## Example 2: File Upload with Validation

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateFile, sanitizeUploadedFilename } from '@/lib/security/file-validator';
import { logAuditFromRequest, AuditAction, AuditResource } from '@/modules/audit/audit.service';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  // Validate file
  const validation = await validateFile(file, 'images');
  
  if (!validation.valid) {
    return NextResponse.json(
      { 
        error: 'Invalid file',
        details: validation.errors,
        warnings: validation.warnings 
      },
      { status: 400 }
    );
  }

  // Sanitize filename
  const safeFilename = sanitizeUploadedFilename(file.name);

  // Save file (implementation depends on your storage)
  const fileUrl = await saveFile(file, safeFilename);

  // Audit log
  await logAuditFromRequest(req, {
    userId: req.userId,
    action: AuditAction.DATA_EXPORTED,
    resource: AuditResource.PRODUCT,
    metadata: {
      filename: safeFilename,
      size: file.size,
      type: file.type,
    },
  });

  return NextResponse.json({ url: fileUrl });
}
```

## Example 3: Authentication with Audit

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent, AuditAction } from '@/modules/audit/audit.service';
import { rateLimitByIp } from '@/lib/security/rate-limiter';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  // Strict rate limiting for login attempts
  const rateLimit = await rateLimitByIp(req, {
    windowMs: 900000, // 15 minutes
    max: 5, // 5 attempts
  });
  if (rateLimit) return rateLimit;

  const { email, password } = await req.json();

  // Find user
  const user = await findUserByEmail(email);

  if (!user) {
    // Log failed attempt (no user found)
    await logAuthEvent(
      AuditAction.LOGIN_FAILED,
      undefined,
      req,
      { reason: 'user_not_found', email }
    );
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    // Log failed attempt (wrong password)
    await logAuthEvent(
      AuditAction.LOGIN_FAILED,
      user.id,
      req,
      { reason: 'invalid_password' }
    );
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create session
  const session = await createSession(user);

  // Log successful login
  await logAuthEvent(AuditAction.LOGIN, user.id, req);

  return NextResponse.json({ session });
}
```

## Example 4: Admin Panel Security

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByUser } from '@/lib/security/rate-limiter';
import { logUserEvent, AuditAction } from '@/modules/audit/audit.service';
import { getServerSession } from 'next-auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin role
  const session = await getServerSession();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Rate limit per admin user
  const rateLimit = await rateLimitByUser(session.user.id, {
    windowMs: 60000,
    max: 30,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const userId = params.id;

  // Delete user
  await deleteUser(userId);

  // Audit log
  await logUserEvent(
    AuditAction.USER_DELETED,
    session.user.id,
    userId,
    req,
    { deletedBy: session.user.email }
  );

  return NextResponse.json({ success: true });
}
```

## Example 5: Data Export with Security

```typescript
// app/api/export/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByUser } from '@/lib/security/rate-limiter';
import { logDataExport } from '@/modules/audit/audit.service';
import { AuditResource } from '@/modules/audit/audit.types';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Strict rate limit for exports (expensive operation)
  const rateLimit = await rateLimitByUser(session.user.id, {
    windowMs: 3600000, // 1 hour
    max: 10, // 10 exports per hour
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Export rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  // Generate export
  const data = await exportOrders(session.user.id);
  const csv = convertToCSV(data);

  // Audit log
  await logDataExport(
    session.user.id,
    AuditResource.ORDER,
    {
      format: 'csv',
      recordCount: data.length,
      dateRange: { start: data[0]?.date, end: data[data.length - 1]?.date },
    }
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=orders.csv',
    },
  });
}
```

## Example 6: Server Action with Security

```typescript
// app/actions/update-profile.ts
'use server'

import { revalidatePath } from 'next/cache';
import { deepSanitize } from '@/lib/security/sanitizer';
import { logUserEvent, AuditAction } from '@/modules/audit/audit.service';
import { getServerSession } from 'next-auth';

export async function updateProfile(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Extract and sanitize data
  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    bio: formData.get('bio') as string,
  };

  const cleanData = deepSanitize(rawData);

  // Update user
  await updateUser(session.user.id, cleanData);

  // Audit log
  await logUserEvent(
    AuditAction.USER_UPDATED,
    session.user.id,
    session.user.id,
    undefined,
    { fields: Object.keys(cleanData) }
  );

  revalidatePath('/profile');
  return { success: true };
}
```

## Example 7: Webhook Endpoint Security

```typescript
// app/api/webhooks/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateRequestOrigin } from '@/lib/utils/helpers';
import { logSecurityEvent, AuditAction } from '@/modules/audit/audit.service';
import crypto from 'crypto';

const ALLOWED_ORIGINS = ['https://api.stripe.com', 'https://hooks.stripe.com'];

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');

  // Validate origin
  if (!validateRequestOrigin(origin, ALLOWED_ORIGINS)) {
    await logSecurityEvent(
      AuditAction.SUSPICIOUS_ACTIVITY,
      req,
      { reason: 'invalid_webhook_origin', origin },
    );
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify webhook signature
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  const isValid = verifyWebhookSignature(body, signature);
  if (!isValid) {
    await logSecurityEvent(
      AuditAction.SUSPICIOUS_ACTIVITY,
      req,
      { reason: 'invalid_webhook_signature' },
    );
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process webhook
  const event = JSON.parse(body);
  await processWebhook(event);

  return NextResponse.json({ received: true });
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const secret = process.env.WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Example 8: Form Submission with CSRF

```typescript
// app/products/new/page.tsx
'use client'

import { useState, useEffect } from 'react';

export default function NewProductPage() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Get CSRF token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
      ?.split('=')[1];
    
    setCsrfToken(token || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Success
    } else if (response.status === 403) {
      // CSRF error
      alert('Security token expired. Please refresh the page.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrf-token" value={csrfToken} />
      {/* Form fields */}
      <button type="submit">Create Product</button>
    </form>
  );
}
```

## Example 9: Querying Audit Logs

```typescript
// app/admin/audit/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { AuditLogResponse } from '@/modules/audit/audit.types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (filters = {}) => {
    const params = new URLSearchParams({
      page: '1',
      limit: '50',
      ...filters,
    });

    const response = await fetch(`/api/audit?${params}`);
    const data = await response.json();
    setLogs(data);
  };

  const filterByAction = (action: string) => {
    fetchLogs({ action });
  };

  const filterByUser = (userId: string) => {
    fetchLogs({ userId });
  };

  return (
    <div>
      <h1>Audit Logs</h1>
      
      {/* Filters */}
      <div>
        <button onClick={() => filterByAction('LOGIN')}>Login Events</button>
        <button onClick={() => filterByAction('PRODUCT_CREATED')}>Product Created</button>
      </div>

      {/* Logs table */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {logs?.logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.userId}</td>
              <td>{log.action}</td>
              <td>{log.resource}</td>
              <td>{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        Page {logs?.page} of {logs?.totalPages}
      </div>
    </div>
  );
}
```

---

## Testing Security Features

```typescript
// __tests__/security.test.ts
import { rateLimitByIp } from '@/lib/security/rate-limiter';
import { validateCsrfToken } from '@/lib/security/csrf';
import { sanitizeHtml, sanitizeEmail } from '@/lib/security/sanitizer';
import { validateFile } from '@/lib/security/file-validator';

describe('Security Features', () => {
  describe('Rate Limiting', () => {
    it('should block after max requests', async () => {
      // Test implementation
    });
  });

  describe('CSRF Protection', () => {
    it('should reject invalid tokens', () => {
      // Test implementation
    });
  });

  describe('Input Sanitization', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script><p>Hello</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('<p>Hello</p>');
    });

    it('should validate email format', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('invalid-email')).toBe('');
    });
  });

  describe('File Validation', () => {
    it('should reject dangerous file types', async () => {
      const file = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' });
      const result = await validateFile(file, 'images');
      expect(result.valid).toBe(false);
    });
  });
});
```
