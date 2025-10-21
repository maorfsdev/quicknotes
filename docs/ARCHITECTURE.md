# QuickNotes Architecture

## Overview

QuickNotes is a full-stack note-taking application built with modern technologies and following best practices for scalability, maintainability, and performance.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database     │
│   (React)       │    │   (NestJS)      │    │ (PostgreSQL)   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Router    │ │    │ │   Auth      │ │    │ │   Users     │ │
│ │   Context   │ │    │ │   Module    │ │    │ │   Table     │ │
│ │   API       │ │◄───┤ │             │ │◄───┤ │             │ │
│ │   Client    │ │    │ └─────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │                 │    │                 │
│                 │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │   Notes     │ │    │ │   Notes     │ │
│ │ Components │ │    │ │   Module    │ │    │ │   Table     │ │
│ │   - Login  │ │◄───┤ │             │ │◄───┤ │             │ │
│ │   - Notes  │ │    │ └─────────────┘ │    │ └─────────────┘ │
│ │   - Editor │ │    │                 │    │                 │
│ └─────────────┘ │    │ ┌─────────────┐ │    │                 │
│                 │    │ │   Cache     │ │    │                 │
│                 │    │ │   Module    │ │    │                 │
│                 │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         │              │    (Cache)      │              │
         │              │                 │              │
         │              └─────────────────┘              │
         │                                                │
         │              ┌─────────────────┐              │
         │              │   Health &      │              │
         │              │   Metrics       │              │
         │              │   Endpoints     │              │
         │              └─────────────────┘              │
```

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis for query result caching
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: class-validator with DTOs
- **Health Checks**: @nestjs/terminus
- **Metrics**: Prometheus client

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Development**: Docker Compose for dependencies

## Key Design Decisions

### 1. Monorepo Structure
**Decision**: Single repository with workspaces for backend and frontend
**Rationale**: 
- Simplified dependency management
- Shared tooling and configuration
- Easier development workflow
- Single deployment pipeline

### 2. Feature-Based Module Organization
**Decision**: Organize backend code by feature (auth, notes, users, etc.)
**Rationale**:
- Clear separation of concerns
- Easier to maintain and test
- Scalable for team development
- Follows Domain-Driven Design principles

### 3. JWT Authentication
**Decision**: Stateless JWT tokens for authentication
**Rationale**:
- Stateless and scalable
- Works well with microservices
- No server-side session storage needed
- Industry standard for APIs

### 4. Redis Caching Strategy
**Decision**: Cache tag-filtered note queries per user
**Rationale**:
- Reduces database load for common queries
- Improves response times
- Cache invalidation on data changes
- TTL-based expiration

### 5. Database Design
**Decision**: Separate User and Note entities with foreign key relationship
**Rationale**:
- Clear data model
- User isolation for security
- Efficient querying with indexes
- Support for future features (sharing, permissions)

### 6. Frontend State Management
**Decision**: React Context API instead of Redux
**Rationale**:
- Simpler for this application size
- Built-in React solution
- Less boilerplate
- Sufficient for current requirements

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Backend validates credentials against database
3. JWT token generated and returned
4. Frontend stores token and includes in subsequent requests
5. Backend validates token on protected routes

### Note Operations Flow
1. User creates/updates/deletes note
2. Frontend sends request with JWT token
3. Backend validates token and user permissions
4. Database operation performed
5. Cache invalidated for user
6. Response returned to frontend

### Caching Flow
1. User requests notes with tag filter
2. Backend checks Redis cache for user+filter combination
3. If cache hit: return cached data
4. If cache miss: query database, cache result, return data
5. Cache expires after TTL or invalidated on data changes

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration (24 hours)
- Secure token storage in localStorage
- Automatic logout on 401 responses

### Authorization
- User isolation: users can only access their own notes
- JWT contains user ID for authorization
- Database queries filtered by user ID

### Input Validation
- DTO validation on all endpoints
- SQL injection prevention via TypeORM
- XSS prevention through React's built-in escaping

## Performance Optimizations

### Backend
- Redis caching for frequently accessed data
- Database indexes on user ID and tags
- Connection pooling with TypeORM
- Prometheus metrics for monitoring

### Frontend
- Vite for fast development and building
- Code splitting with React.lazy (future enhancement)
- Optimistic UI updates
- Efficient re-rendering with proper key props

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Redis for shared cache
- Database connection pooling
- Load balancer ready

### Future Enhancements
- Microservices architecture
- Message queues for async processing
- CDN for static assets
- Database read replicas

## Monitoring & Observability

### Health Checks
- Database connectivity
- Redis connectivity
- Memory usage
- Custom health indicators

### Metrics
- Request counters
- Cache hit/miss ratios
- Response time histograms
- Custom business metrics

### Logging
- Structured logging with NestJS
- Error tracking and alerting
- Performance monitoring

## Trade-offs

### Chosen Approaches
1. **Monorepo vs Multi-repo**: Chose monorepo for simplicity
2. **JWT vs Sessions**: Chose JWT for statelessness
3. **Redis vs In-memory cache**: Chose Redis for persistence
4. **Context vs Redux**: Chose Context for simplicity

### Alternative Approaches Considered
1. **GraphQL**: REST chosen for simplicity and caching
2. **MongoDB**: PostgreSQL chosen for ACID compliance
3. **Server-side rendering**: SPA chosen for simplicity
4. **Microservices**: Monolith chosen for current scale

## Development Workflow

### Local Development
1. Start dependencies (PostgreSQL, Redis)
2. Run database migrations
3. Seed demo data
4. Start backend and frontend
5. Access application at localhost:5173

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing (future enhancement)

### Deployment Considerations
- Environment-specific configurations
- Database migration strategy
- Health check endpoints for load balancers
- Graceful shutdown handling
