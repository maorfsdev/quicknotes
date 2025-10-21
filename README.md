# QuickNotes

A minimal but production-worthy note-taking application built with NestJS, React, PostgreSQL, and Redis. Features full containerization, load balancing, health checks, and metrics exposure.

## Architecture

- **Backend**: NestJS (TypeScript) with feature-based modules
- **Frontend**: React + Vite + TypeScript served by Nginx
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis for tag-filter query caching
- **Authentication**: JWT with email/password
- **Load Balancer**: Nginx with health checks and round-robin
- **Orchestration**: Docker Compose with multi-instance scaling

## Quick Start

### Option 1: Full Containerization (Recommended)

1. **Prerequisites**:
   - Docker & Docker Compose
   - Make (optional, for convenience commands)

2. **Start all services**:
   ```bash
   # Build and start all services
   make up
   
   # Or manually:
   docker compose up -d
   ```

3. **Run database setup**:
   ```bash
   # Run migrations
   make migrate
   
   # Seed the database
   make seed
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Load Balancer: http://localhost:8080
   - API Health: http://localhost:8080/health
   - API Metrics: http://localhost:8080/metrics

### Option 2: Local Development

1. **Prerequisites**:
   - Node.js 18+ (see `.nvmrc`)
   - PostgreSQL
   - Redis

2. **Start dependencies** (choose one):
   ```bash
   # Option 1: Using Docker Compose for dependencies only
   docker-compose up -d postgres redis
   
   # Option 2: Install locally
   # PostgreSQL: https://www.postgresql.org/download/
   # Redis: https://redis.io/download
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit backend/.env and frontend/.env with your values
   ```

5. **Run database migrations**:
   ```bash
   cd backend
   npm run migration:run
   npm run seed
   ```

6. **Start the applications**:
   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend
   npm run dev:frontend
   ```

7. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - Metrics: http://localhost:3000/metrics

## Containerization & Orchestration

### Docker Services

The application includes the following containerized services:

- **postgres**: PostgreSQL 16 database with persistent storage
- **redis**: Redis 7 cache with persistence
- **api1 & api2**: Load-balanced NestJS API instances
- **lb**: Nginx load balancer with health checks
- **frontend**: React app served by Nginx

### Orchestration Commands

#### Linux/macOS (Make)
```bash
# Build all images
make build

# Start production services
make up

# Stop all services
make down

# View logs
make logs

# Run database seeding
make seed

# Run database migrations
make migrate

# Development with live reload
make dev-up

# Stop development services
make dev-down

# Clean up everything
make clean

# Check service health
make health

# Show service status
make status
```

#### Windows (PowerShell)
```powershell
# Build all images
.\scripts.ps1 build

# Start production services
.\scripts.ps1 up

# Stop all services
.\scripts.ps1 down

# View logs
.\scripts.ps1 logs

# Run database seeding
.\scripts.ps1 seed

# Run database migrations
.\scripts.ps1 migrate

# Development with live reload
.\scripts.ps1 dev-up

# Stop development services
.\scripts.ps1 dev-down

# Clean up everything
.\scripts.ps1 clean

# Check service health
.\scripts.ps1 health

# Show service status
.\scripts.ps1 status
```

#### Direct Docker Compose (All Platforms)
```bash
# Build all images
docker compose build

# Start production services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f --tail=100

# Run database seeding
docker compose exec api1 node dist/scripts/seed.js

# Run database migrations
docker compose exec api1 npx typeorm migration:run -d dist/database/data-source.js

# Development with live reload
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Stop development services
docker compose -f docker-compose.yml -f docker-compose.override.yml down

# Clean up everything
docker compose down -v --remove-orphans
docker system prune -f
docker volume prune -f
```

### Load Balancing & Scaling

The application features:

- **Round-robin load balancing** between API instances
- **Health checks** for automatic failover
- **Upstream instance headers** to identify which API served the request
- **Redis caching** shared across all API instances
- **Database connection pooling** for optimal performance

### Development Mode

For development with live reload:

```bash
# Start development services
make dev-up

# Access points:
# - Frontend: http://localhost:5173 (Vite dev server)
# - API1: http://localhost:3001 (with live reload)
# - API2: http://localhost:3002 (with live reload)
# - Load Balancer: http://localhost:8080
```

## Environment Variables

### Root Environment (env.example)
```bash
# Application Environment
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=quicknotes

# JWT Configuration
JWT_SECRET=change-me-in-production-use-strong-secret

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL_SECONDS=60

# API Configuration
PORT=3000
API_URL=http://localhost:3000

# Frontend Configuration
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=quicknotes
JWT_SECRET=your-super-secret-jwt-key-change-this
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL_SECONDS=60
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
```

## Load Balancer Testing

Test load balancing behavior:

```bash
# Check which API instance served the request
curl -I http://localhost:8080/health

# Look for these headers:
# X-Upstream-Instance: <hostname>-<pid>
# X-Server-Hostname: <hostname>
# X-Process-ID: <pid>

# Test round-robin behavior
for i in {1..10}; do
  curl -s http://localhost:8080/health | grep -o "X-Upstream-Instance: [^[:space:]]*"
done
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation with load-balanced examples.

## Architecture Details

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture overview and tradeoffs.

## Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Test containerized setup
make health
```

## Demo User

After running the seed script, you can login with:
- Email: test@example.com
- Password: Passw0rd!

## Development Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run build` - Build both applications
- `npm run test` - Run all tests

## Production Deployment

For production deployment:

1. **Update environment variables** with production values
2. **Use strong JWT secrets** and database passwords
3. **Configure proper SSL/TLS** termination
4. **Set up monitoring** with Prometheus/Grafana
5. **Configure log aggregation** (ELK stack, etc.)
6. **Set up backup strategies** for PostgreSQL and Redis
