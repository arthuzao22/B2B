# Email System Documentation

## Overview

Complete email system for the B2B Marketplace with transactional templates, queue management, and comprehensive logging.

## Features

- ✅ **React-based Email Templates** - Beautiful, responsive emails using React Email
- ✅ **Queue System** - Asynchronous email sending with BullMQ and Redis
- ✅ **Database Logging** - Track all sent emails with status and metadata
- ✅ **Error Handling** - Automatic retry logic with exponential backoff
- ✅ **Multiple Templates** - Pre-built templates for common scenarios
- ✅ **Rate Limiting** - Control email sending rate to avoid spam
- ✅ **Monitoring** - Real-time statistics and queue monitoring

## Architecture

```
lib/email/
├── email-service.ts        # Core email sending service (Resend)
├── email-queue.ts          # Queue management with BullMQ
└── templates/              # Email templates
    ├── base-template.tsx
    ├── welcome.tsx
    ├── order-confirmation.tsx
    ├── order-status-update.tsx
    ├── order-shipped.tsx
    ├── order-delivered.tsx
    ├── password-reset.tsx
    └── low-stock-alert.tsx

modules/email/
├── email.types.ts          # TypeScript definitions
├── email.service.ts        # Business logic layer
└── email.repository.ts     # Database operations

app/api/email/
├── send/route.ts           # Send email endpoint
├── stats/route.ts          # Email statistics
└── logs/route.ts           # Email logs
```

## Setup

### 1. Install Dependencies

Already installed:
- `resend` - Email service provider
- `react-email` - Email templates
- `@react-email/components` - Email components
- `bullmq` - Queue management
- `ioredis` - Redis client

### 2. Configure Environment Variables

Add to your `.env`:

```bash
# Resend API
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=B2B Vendas <noreply@b2bvendas.com>

# Redis (for queue)
REDIS_URL=redis://localhost:6379

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Database Migration

```bash
npx prisma migrate dev --name add_email_log
npx prisma generate
```

### 4. Start Redis (if not running)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using docker-compose (already configured)
docker-compose up -d redis
```

## Usage

### Sending Emails via Code

```typescript
import { emailService } from '@/modules/email';

// Send welcome email
await emailService.sendWelcomeEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  companyName: 'ACME Corp',
  activationLink: 'https://...',
});

// Send order confirmation
await emailService.sendOrderConfirmationEmail(
  {
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    items: [
      {
        name: 'Product A',
        quantity: 2,
        price: 100.00,
        total: 200.00,
      },
    ],
    subtotal: 200.00,
    shipping: 20.00,
    discount: 0,
    total: 220.00,
    orderDate: '2024-01-21',
  },
  'john@example.com'
);

// Send with custom options
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Email',
  template: 'welcome',
  templateData: { userName: 'User' },
  priority: 'high',
  useQueue: true, // false for immediate send
});
```

### Sending Emails via API

#### 1. Send Template Email

```bash
POST /api/email/send
Content-Type: application/json

{
  "type": "welcome",
  "to": "user@example.com",
  "data": {
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "companyName": "ACME Corp"
  },
  "useQueue": true
}
```

#### 2. Send Custom Email

```bash
POST /api/email/send
Content-Type: application/json

{
  "type": "custom",
  "to": "user@example.com",
  "subject": "Custom Subject",
  "html": "<h1>Hello</h1>",
  "useQueue": true
}
```

#### 3. Get Email Statistics

```bash
GET /api/email/stats
GET /api/email/stats?startDate=2024-01-01&endDate=2024-01-31
```

#### 4. Get Email Logs

```bash
GET /api/email/logs?recipient=user@example.com
GET /api/email/logs?template=welcome
GET /api/email/logs?status=sent&limit=100
```

## Available Templates

### 1. Welcome Email
New user welcome email with activation link.

**Required Data:**
- `userName` - User's full name
- `userEmail` - User's email address

**Optional Data:**
- `companyName` - Company name
- `activationLink` - Account activation URL

### 2. Order Confirmation
Order confirmation with items and totals.

**Required Data:**
- `orderNumber` - Order number
- `customerName` - Customer name
- `items` - Array of order items
- `subtotal` - Subtotal amount
- `shipping` - Shipping cost
- `discount` - Discount amount
- `total` - Total amount
- `orderDate` - Order date

**Optional Data:**
- `estimatedDelivery` - Estimated delivery date
- `shippingAddress` - Delivery address

### 3. Order Status Update
Notification when order status changes.

**Required Data:**
- `orderNumber` - Order number
- `customerName` - Customer name
- `oldStatus` - Previous status
- `newStatus` - New status
- `statusMessage` - Status description
- `orderLink` - Link to order details

**Optional Data:**
- `trackingCode` - Tracking code

### 4. Order Shipped
Notification when order is shipped.

**Required Data:**
- `orderNumber` - Order number
- `customerName` - Customer name
- `trackingCode` - Tracking code
- `trackingUrl` - Tracking URL
- `estimatedDelivery` - Estimated delivery
- `items` - Array of items
- `shippingAddress` - Delivery address

**Optional Data:**
- `carrier` - Carrier name

### 5. Order Delivered
Notification when order is delivered.

**Required Data:**
- `orderNumber` - Order number
- `customerName` - Customer name
- `deliveryDate` - Delivery date

**Optional Data:**
- `feedbackLink` - Link to feedback form

### 6. Password Reset
Password reset with secure link.

**Required Data:**
- `userName` - User's name
- `resetLink` - Reset password URL
- `expiresIn` - Link expiration time

### 7. Low Stock Alert
Alert suppliers about low stock products.

**Required Data:**
- `supplierName` - Supplier name
- `products` - Array of products with low stock
- `dashboardLink` - Link to dashboard

## Queue Management

The email queue uses BullMQ with Redis for reliable async processing.

### Queue Configuration

- **Concurrency**: 10 emails processed simultaneously
- **Rate Limit**: 100 emails per 60 seconds
- **Max Attempts**: 3 attempts with exponential backoff
- **Retry Delay**: 2s, 4s, 8s

### Queue Operations

```typescript
import { 
  getQueueStats,
  pauseQueue,
  resumeQueue,
  cleanQueue,
} from '@/lib/email/email-queue';

// Get queue statistics
const stats = await getQueueStats();
console.log(stats);
// { waiting: 10, active: 2, completed: 500, failed: 5 }

// Pause queue
await pauseQueue();

// Resume queue
await resumeQueue();

// Clean old jobs (24 hours)
await cleanQueue(24 * 3600 * 1000);
```

## Database Schema

The `EmailLog` model tracks all sent emails:

```prisma
model EmailLog {
  id              String      @id @default(cuid())
  to              String
  from            String
  subject         String
  template        String
  status          EmailStatus
  htmlContent     String?
  textContent     String?
  templateData    Json?
  externalId      String?     @unique
  errorMessage    String?
  attempts        Int         @default(0)
  lastAttemptAt   DateTime?
  sentAt          DateTime?
  deliveredAt     DateTime?
  openedAt        DateTime?
  metadata        Json?
  tags            String[]
  criadoEm        DateTime    @default(now())
  atualizadoEm    DateTime    @updatedAt
}

enum EmailStatus {
  pending
  sent
  failed
  bounced
  delivered
  opened
  clicked
}
```

## Monitoring

### View Email Statistics

```typescript
import { emailService } from '@/modules/email';

const stats = await emailService.getEmailStats(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

console.log(stats);
// {
//   total: 1000,
//   byStatus: { sent: 950, failed: 50 },
//   byTemplate: { welcome: 300, 'order-confirmation': 700 }
// }
```

### View Queue Health

```bash
curl http://localhost:3000/api/email/stats
```

## Error Handling

Emails are automatically retried up to 3 times with exponential backoff:

1. **First attempt**: Immediate
2. **Second attempt**: After 2 seconds
3. **Third attempt**: After 4 seconds
4. **Fourth attempt**: After 8 seconds

Failed emails are logged with error messages for debugging.

## Rate Limiting

Built-in rate limiting prevents spam:

- **Maximum**: 100 emails per 60 seconds
- **Concurrency**: 10 emails processed simultaneously

## Best Practices

1. **Always use the queue** for non-critical emails
2. **Use priority** for time-sensitive emails (password reset, order confirmation)
3. **Include tags** for better organization and filtering
4. **Monitor queue stats** regularly
5. **Clean old logs** periodically (90 days)
6. **Test templates** before sending to customers

## Testing

### Test Email Service

```typescript
import { emailService } from '@/lib/email/email-service';

// Verify service
const isConfigured = await emailService.verify();
console.log('Email service configured:', isConfigured);
```

### Test Template Rendering

```bash
# Preview templates using React Email CLI
npx email dev
```

### Send Test Email

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": {
      "userName": "Test User",
      "userEmail": "test@example.com"
    },
    "useQueue": false
  }'
```

## Troubleshooting

### Emails not sending

1. Check Redis is running: `redis-cli ping`
2. Check Resend API key is configured
3. Check email service logs: `tail -f logs/app.log`
4. Check queue stats: `curl http://localhost:3000/api/email/stats`

### Queue not processing

1. Ensure email worker is running
2. Check Redis connection
3. Check for stalled jobs
4. Restart the application

### Templates not rendering

1. Check template data matches interface
2. Verify all required fields are provided
3. Check console for React errors

## Production Considerations

1. **Use Resend** for production (not SMTP)
2. **Configure proper FROM address** and domain
3. **Set up email tracking** (opens, clicks)
4. **Monitor failed emails** and set up alerts
5. **Scale Redis** for high volume
6. **Set up queue dashboard** (Bull Board)
7. **Implement unsubscribe** handling
8. **Add email preferences** management

## Support

For issues or questions:
- Check logs: `logs/app.log`
- Review API responses
- Check queue stats
- Review email logs in database

## License

MIT
