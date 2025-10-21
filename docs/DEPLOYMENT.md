# QuickNotes Deployment Guide

This guide covers different deployment options for the QuickNotes application.

## 🚀 Quick Deploy Options

### 1. Railway (Recommended for Beginners)

Railway provides the easiest deployment with built-in PostgreSQL and Redis.

#### Steps:
1. **Connect GitHub**: Push your code to GitHub
2. **Deploy on Railway**: 
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Add PostgreSQL and Redis services
3. **Configure Environment Variables**:
   ```bash
   # Database
   DB_HOST=your-postgres-host
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your-password
   DB_DATABASE=railway
   
   # Redis
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
   
   # API URL (for frontend)
   VITE_API_URL=https://your-app.railway.app
   ```

### 2. DigitalOcean App Platform

#### Steps:
1. **Prepare for Deployment**:
   ```bash
   # Create production docker-compose
   cp docker-compose.yml docker-compose.prod.yml
   ```

2. **Deploy on DigitalOcean**:
   - Connect GitHub repo
   - Configure services (PostgreSQL, Redis, App)
   - Set environment variables

### 3. AWS ECS (Advanced)

#### Prerequisites:
- AWS CLI configured
- Docker images pushed to ECR

#### Steps:
1. **Push Images to ECR**:
   ```bash
   # Build and tag images
   docker build -t quicknotes-backend ./backend
   docker build -t quicknotes-frontend ./frontend
   
   # Tag for ECR
   docker tag quicknotes-backend:latest your-account.dkr.ecr.region.amazonaws.com/quicknotes-backend:latest
   docker tag quicknotes-frontend:latest your-account.dkr.ecr.region.amazonaws.com/quicknotes-frontend:latest
   
   # Push to ECR
   docker push your-account.dkr.ecr.region.amazonaws.com/quicknotes-backend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/quicknotes-frontend:latest
   ```

2. **Create ECS Task Definition**
3. **Set up RDS (PostgreSQL) and ElastiCache (Redis)**
4. **Configure Application Load Balancer**

## 🛠 Production Configuration

### Environment Variables

Create `.env.production` files:

#### Backend (.env.production):
```bash
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-db-password
DB_DATABASE=quicknotes_prod

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TTL_SECONDS=300

# JWT
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Port
PORT=3000
NODE_ENV=production
```

#### Frontend (.env.production):
```bash
VITE_API_URL=https://your-api-domain.com
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: quicknotes_prod
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  api1:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  api2:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ops/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api1
      - api2
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      - VITE_API_URL=https://your-domain.com
    ports:
      - "3000:80"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 🔒 Security Considerations

### 1. SSL/TLS Certificates
- Use **Let's Encrypt** for free SSL certificates
- Configure HTTPS redirects
- Update CORS origins to use HTTPS

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

### 3. Environment Security
- Use secrets management (AWS Secrets Manager, etc.)
- Never commit `.env` files
- Rotate JWT secrets regularly

## 📊 Monitoring & Logging

### 1. Application Monitoring
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** (Elasticsearch, Logstash, Kibana) for logs
- **Sentry** for error tracking

### 2. Health Checks
- Configure load balancer health checks
- Set up uptime monitoring
- Database connection monitoring

## 🚀 Deployment Checklist

- [ ] Code pushed to version control
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CORS origins updated
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Domain DNS configured
- [ ] Load testing completed

## 📈 Scaling Considerations

### Horizontal Scaling
- Multiple API instances behind load balancer
- Database read replicas
- Redis clustering for high availability

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies

## 🔧 Maintenance

### Regular Tasks
- Update dependencies
- Monitor resource usage
- Review security logs
- Backup verification
- Performance optimization

### Updates
- Blue-green deployments
- Rolling updates
- Database migration strategies
