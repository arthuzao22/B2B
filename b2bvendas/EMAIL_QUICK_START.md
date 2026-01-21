# Email System Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies (Already Done ✅)

The following packages are already installed:
- `resend` - Email service provider
- `react-email` & `@react-email/components` - Email templates
- `bullmq` & `ioredis` - Queue management

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Resend API (Get your key from https://resend.com)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="B2B Vendas <noreply@b2bvendas.com>"

# Redis (for email queue)
REDIS_URL=redis://localhost:6379

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run Database Migration

```bash
cd b2bvendas
npx prisma migrate dev --name add_email_log
npx prisma generate
```

### 4. Start Redis

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up -d redis
```

**Option B: Using Docker directly**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option C: Using local Redis**
```bash
redis-server
```

### 5. Test the Email System

Start your development server:
```bash
npm run dev
```

Test with the API:
```bash
# Test welcome email
curl "http://localhost:3000/api/email/test?template=welcome&email=your@email.com"

# Test order confirmation
curl "http://localhost:3000/api/email/test?template=order-confirmation&email=your@email.com"
```

---

## 📧 Send Your First Email

### Using the Service (Recommended)

```typescript
import { emailService } from '@/modules/email';

// Send welcome email
await emailService.sendWelcomeEmail({
  userName: 'João Silva',
  userEmail: 'joao@example.com',
  companyName: 'ACME Corp',
});
```

### Using the API

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "user@example.com",
    "data": {
      "userName": "João Silva",
      "userEmail": "user@example.com",
      "companyName": "ACME Corp"
    }
  }'
```

---

## 📊 Monitor Your Emails

### Check Email Statistics

```bash
curl http://localhost:3000/api/email/stats
```

### View Email Logs

```bash
# By recipient
curl "http://localhost:3000/api/email/logs?recipient=user@example.com"

# By template
curl "http://localhost:3000/api/email/logs?template=welcome"

# By status
curl "http://localhost:3000/api/email/logs?status=sent"
```

---

## 🎯 Available Templates

1. **welcome** - Welcome email for new users
2. **order-confirmation** - Order confirmation with items
3. **order-status-update** - Order status changes
4. **order-shipped** - Shipping notification
5. **order-delivered** - Delivery confirmation
6. **password-reset** - Password reset link
7. **low-stock-alert** - Low stock notification for suppliers

---

## 🔍 Troubleshooting

### Email not sending?

1. **Check Redis is running:**
   ```bash
   redis-cli ping
   # Should respond with: PONG
   ```

2. **Check Resend API key:**
   ```bash
   echo $RESEND_API_KEY
   # Should show your API key
   ```

3. **Check logs:**
   ```bash
   tail -f logs/app.log
   ```

4. **Check queue stats:**
   ```bash
   curl http://localhost:3000/api/email/stats
   ```

### Common Issues

**Issue: "RESEND_API_KEY not found"**
- Solution: Add your Resend API key to `.env` file

**Issue: "Redis connection failed"**
- Solution: Make sure Redis is running (`docker-compose up -d redis`)

**Issue: "Module not found"**
- Solution: Run `npm install` and `npx prisma generate`

---

## 📚 More Resources

- **Complete Documentation**: `docs/EMAIL_SYSTEM.md`
- **Usage Examples**: `docs/EMAIL_EXAMPLES.ts`
- **Implementation Summary**: `EMAIL_SYSTEM_SUMMARY.md`

---

## ✅ Verification Checklist

- [ ] Environment variables configured in `.env`
- [ ] Database migration completed
- [ ] Redis server running
- [ ] Test email sent successfully
- [ ] Email appears in logs

---

## 🎉 You're Ready!

Your email system is now ready to use! Check the documentation for more advanced features like:
- Bulk email sending
- Priority emails
- Custom templates
- Email tracking
- Queue management

For help, check the troubleshooting section or review the complete documentation.
