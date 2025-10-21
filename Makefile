# QuickNotes Orchestration Makefile

.PHONY: help build up down logs seed migrate dev-up dev-down clean

# Default target
help:
	@echo "QuickNotes Orchestration Commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all services in production mode"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - Show logs from all services"
	@echo "  make seed      - Run database seeding"
	@echo "  make migrate   - Run database migrations"
	@echo "  make dev-up    - Start services in development mode with live reload"
	@echo "  make dev-down  - Stop development services"
	@echo "  make clean     - Clean up containers, images, and volumes"
	@echo ""
	@echo "URLs:"
	@echo "  Frontend:      http://localhost:5173"
	@echo "  Load Balancer: http://localhost:8080"
	@echo "  API Health:    http://localhost:8080/health"
	@echo "  API Metrics:   http://localhost:8080/metrics"

# Build all images
build:
	@echo "Building all Docker images..."
	docker compose build

# Start production services
up:
	@echo "Starting production services..."
	docker compose up -d
	@echo "Services started! Check status with 'make logs'"

# Stop all services
down:
	@echo "Stopping all services..."
	docker compose down

# Show logs
logs:
	@echo "Showing logs from all services..."
	docker compose logs -f --tail=100

# Run database seeding
seed:
	@echo "Running database seeding..."
	docker compose exec api1 node dist/scripts/seed.js

# Run database migrations
migrate:
	@echo "Running database migrations..."
	docker compose exec api1 npx typeorm migration:run -d dist/database/data-source.js

# Start development services with live reload
dev-up:
	@echo "Starting development services with live reload..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "Development services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "API1: http://localhost:3001"
	@echo "API2: http://localhost:3002"
	@echo "Load Balancer: http://localhost:8080"

# Stop development services
dev-down:
	@echo "Stopping development services..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

# Clean up everything
clean:
	@echo "Cleaning up containers, images, and volumes..."
	docker compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

# Check service health
health:
	@echo "Checking service health..."
	@echo "Load Balancer Health:"
	@curl -s http://localhost:8080/health || echo "Load balancer not responding"
	@echo ""
	@echo "API1 Health:"
	@curl -s http://localhost:3001/health || echo "API1 not responding"
	@echo ""
	@echo "API2 Health:"
	@curl -s http://localhost:3002/health || echo "API2 not responding"
	@echo ""
	@echo "Frontend Health:"
	@curl -s http://localhost:5173/health || echo "Frontend not responding"

# Show service status
status:
	@echo "Service Status:"
	docker compose ps
