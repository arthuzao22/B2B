# Docker & CI/CD Infrastructure

This document describes the Docker and CI/CD setup for the B2B Marketplace application.

## 📁 Files Overview

### Docker Files
- **Dockerfile** - Multi-stage production build with Node 20 Alpine
- **docker-compose.yml** - Complete stack with PostgreSQL and Redis
- **.dockerignore** - Optimized build context
- **.env.example** - Environment variables template

### CI/CD Workflows
- **.github/workflows/ci.yml** - Continuous Integration pipeline
- **.github/workflows/security.yml** - Security scanning and audits

### Application
- **app/api/health/route.ts** - Health check endpoint
- **next.config.ts** - Updated with standalone output and security headers

## 🚀 Quick Start

### Development with Docker Compose

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configurations**

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

6. **Access the application:**
   - App: http://localhost:3000
   - Health: http://localhost:3000/api/health
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Production Build

1. **Build Docker image:**
   ```bash
   docker build -t b2bvendas:latest .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_database_url" \
     -e NEXTAUTH_SECRET="your_secret" \
     -e NEXTAUTH_URL="your_url" \
     b2bvendas:latest
   ```

## 🏗️ Architecture

### Multi-Stage Docker Build

1. **deps** - Install production dependencies
2. **builder** - Build application and generate Prisma client
3. **runner** - Minimal production image with only necessary files

### Services

- **app** - Next.js 16 application
- **postgres** - PostgreSQL 16 database
- **redis** - Redis 7 cache

## 🔒 Security Features

### Dockerfile Security
- Non-root user (nextjs:nodejs)
- Minimal Alpine base image
- No unnecessary packages
- Health checks enabled

### Application Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection
- Content Security Policy ready
- Referrer-Policy

## 🧪 CI/CD Pipeline

### CI Workflow (ci.yml)

Triggers on push to main/develop and pull requests.

**Jobs:**
1. **Lint** - ESLint code quality checks
2. **Type Check** - TypeScript compilation
3. **Test** - Run tests with PostgreSQL & Redis
4. **Build** - Production build verification
5. **Docker Build** - Build and cache Docker image

### Security Workflow (security.yml)

Runs on push, pull requests, and daily at 2 AM UTC.

**Jobs:**
1. **CodeQL Analysis** - Static code analysis
2. **Dependency Scan** - npm audit for vulnerabilities
3. **Secret Scan** - TruffleHog for exposed secrets
4. **Docker Security** - Trivy vulnerability scanner

## 📊 Health Check Endpoint

**URL:** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-21T00:00:00.000Z",
  "version": "0.1.0",
  "uptime": 1234.56,
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database connection successful",
      "responseTime": 15
    },
    "redis": {
      "status": "ok",
      "message": "Redis connection successful"
    }
  }
}
```

**Status Codes:**
- 200 - Healthy or Degraded (Redis optional)
- 503 - Unhealthy (Database connection failed)

## 🔧 Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret (32+ chars)
- `NEXTAUTH_URL` - Application URL

### Optional
- `REDIS_URL` - Redis connection string
- `APP_VERSION` - Application version
- `NODE_ENV` - Environment (development/production)

### Database
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `POSTGRES_PORT` - Database port (default: 5432)

### Redis
- `REDIS_PASSWORD` - Redis password
- `REDIS_PORT` - Redis port (default: 6379)

## 🛠️ Common Commands

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service]

# Restart service
docker-compose restart [service]

# Execute command in container
docker-compose exec app [command]

# Rebuild and restart
docker-compose up -d --build

# Remove volumes (⚠️ destroys data)
docker-compose down -v
```

### Prisma

```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create migration
npx prisma migrate dev --name [migration_name]

# Open Prisma Studio
npx prisma studio

# Reset database (⚠️ destroys data)
npx prisma migrate reset
```

## 📈 Monitoring

### Docker Health Checks

All services have health checks configured:
- App: HTTP check on /api/health
- PostgreSQL: pg_isready
- Redis: redis-cli ping

### View Health Status

```bash
docker ps
docker inspect [container_id] | grep Health
```

## 🚨 Troubleshooting

### Build Failures

1. **Clear build cache:**
   ```bash
   docker builder prune
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   ```

### Database Connection Issues

1. **Check database is running:**
   ```bash
   docker-compose ps postgres
   ```

2. **Check logs:**
   ```bash
   docker-compose logs postgres
   ```

3. **Verify connection string in .env**

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

When making infrastructure changes:

1. Test locally with Docker Compose
2. Verify CI pipeline passes
3. Check security scans
4. Update this documentation
5. Test production build

## 📝 License

See main project LICENSE file.
