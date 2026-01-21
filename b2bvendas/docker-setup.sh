#!/bin/bash

# B2B Vendas - Docker Setup Script
# This script sets up the Docker environment for the B2B Marketplace

set -e

echo "🚀 B2B Vendas - Docker Setup"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding."
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
fi

echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || {
    echo "⚠️  Migration failed. You may need to run it manually:"
    echo "   docker-compose exec app npx prisma migrate deploy"
}

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Service URLs:"
echo "   Application: http://localhost:3000"
echo "   Health Check: http://localhost:3000/api/health"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
