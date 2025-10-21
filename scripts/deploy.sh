#!/bin/bash

# QuickNotes Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="quicknotes"

echo "🚀 Deploying QuickNotes to $ENVIRONMENT environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if environment file exists
if [ ! -f "env.$ENVIRONMENT" ]; then
    echo "❌ Environment file env.$ENVIRONMENT not found."
    echo "Please create env.$ENVIRONMENT with your production configuration."
    exit 1
fi

# Load environment variables
export $(cat env.$ENVIRONMENT | grep -v '^#' | xargs)

echo "📦 Building Docker images..."

# Build backend image
echo "Building backend image..."
docker build -t $PROJECT_NAME-backend:latest ./backend

# Build frontend image
echo "Building frontend image..."
docker build -t $PROJECT_NAME-frontend:latest ./frontend

echo "🗄️ Starting database and cache services..."

# Start database and cache first
docker compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USERNAME -d $DB_DATABASE -c "SELECT 1;" > /dev/null 2>&1 || {
    echo "❌ Database is not ready. Please check your database configuration."
    exit 1
}

# Start application services
echo "🚀 Starting application services..."
docker compose -f docker-compose.prod.yml up -d api1 api2 lb frontend

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check service health
echo "🔍 Checking service health..."

# Check API health
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ API services are healthy"
else
    echo "❌ API services are not responding"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs frontend"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:8080"
echo "  Health: http://localhost:8080/health"
echo "  Metrics: http://localhost:8080/metrics"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker compose -f docker-compose.prod.yml down"
echo "  Restart services: docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🔧 Next steps:"
echo "  1. Configure your domain DNS"
echo "  2. Set up SSL certificates"
echo "  3. Configure monitoring"
echo "  4. Set up backups"
