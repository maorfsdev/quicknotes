# QuickNotes PowerShell Script for Windows
# Alternative to Makefile for Windows users

param(
    [Parameter(Position=0)]
    [string]$Command
)

function Show-Help {
    Write-Host "QuickNotes PowerShell Commands:"
    Write-Host "  .\scripts.ps1 build     - Build all Docker images"
    Write-Host "  .\scripts.ps1 up        - Start all services in production mode"
    Write-Host "  .\scripts.ps1 down      - Stop all services"
    Write-Host "  .\scripts.ps1 logs      - Show logs from all services"
    Write-Host "  .\scripts.ps1 seed      - Run database seeding"
    Write-Host "  .\scripts.ps1 migrate   - Run database migrations"
    Write-Host "  .\scripts.ps1 dev-up    - Start services in development mode with live reload"
    Write-Host "  .\scripts.ps1 dev-down  - Stop development services"
    Write-Host "  .\scripts.ps1 clean     - Clean up containers, images, and volumes"
    Write-Host "  .\scripts.ps1 health    - Check service health"
    Write-Host "  .\scripts.ps1 status    - Show service status"
    Write-Host ""
    Write-Host "URLs:"
    Write-Host "  Frontend:      http://localhost:5173"
    Write-Host "  Load Balancer: http://localhost:8080"
    Write-Host "  API Health:    http://localhost:8080/health"
    Write-Host "  API Metrics:   http://localhost:8080/metrics"
}

function Build-Images {
    Write-Host "Building all Docker images..."
    docker compose build
}

function Start-Services {
    Write-Host "Starting production services..."
    docker compose up -d
    Write-Host "Services started! Check status with '.\scripts.ps1 status'"
}

function Stop-Services {
    Write-Host "Stopping all services..."
    docker compose down
}

function Show-Logs {
    Write-Host "Showing logs from all services..."
    docker compose logs -f --tail=100
}

function Seed-Database {
    Write-Host "Running database seeding..."
    docker compose exec api1 node dist/scripts/seed.js
}

function Run-Migrations {
    Write-Host "Running database migrations..."
    docker compose exec api1 npx typeorm migration:run -d dist/database/data-source.js
}

function Start-DevServices {
    Write-Host "Starting development services with live reload..."
    docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
    Write-Host "Development services started!"
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "API1: http://localhost:3001"
    Write-Host "API2: http://localhost:3002"
    Write-Host "Load Balancer: http://localhost:8080"
}

function Stop-DevServices {
    Write-Host "Stopping development services..."
    docker compose -f docker-compose.yml -f docker-compose.override.yml down
}

function Clean-All {
    Write-Host "Cleaning up containers, images, and volumes..."
    docker compose down -v --remove-orphans
    docker system prune -f
    docker volume prune -f
}

function Check-Health {
    Write-Host "Checking service health..."
    Write-Host "Load Balancer Health:"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
        Write-Host "✅ Load balancer responding: $($response.StatusCode)"
    } catch {
        Write-Host "❌ Load balancer not responding"
    }
    
    Write-Host ""
    Write-Host "API1 Health:"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
        Write-Host "✅ API1 responding: $($response.StatusCode)"
    } catch {
        Write-Host "❌ API1 not responding"
    }
    
    Write-Host ""
    Write-Host "API2 Health:"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
        Write-Host "✅ API2 responding: $($response.StatusCode)"
    } catch {
        Write-Host "❌ API2 not responding"
    }
    
    Write-Host ""
    Write-Host "Frontend Health:"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173/health" -UseBasicParsing
        Write-Host "✅ Frontend responding: $($response.StatusCode)"
    } catch {
        Write-Host "❌ Frontend not responding"
    }
}

function Show-Status {
    Write-Host "Service Status:"
    docker compose ps
}

# Main script logic
switch ($Command.ToLower()) {
    "build" { Build-Images }
    "up" { Start-Services }
    "down" { Stop-Services }
    "logs" { Show-Logs }
    "seed" { Seed-Database }
    "migrate" { Run-Migrations }
    "dev-up" { Start-DevServices }
    "dev-down" { Stop-DevServices }
    "clean" { Clean-All }
    "health" { Check-Health }
    "status" { Show-Status }
    default { Show-Help }
}
