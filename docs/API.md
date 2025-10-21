# QuickNotes API Documentation

## Base URLs

### Load Balanced (Recommended)
```
http://localhost:8080
```

### Direct API Access
```
http://localhost:3000  # API1
http://localhost:3001  # API2 (development)
```

## Load Balancer Headers

When using the load balancer, responses include upstream instance information:

```
X-Upstream-Instance: <hostname>-<pid>
X-Server-Hostname: <hostname>
X-Process-ID: <pid>
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "uuid"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token"
}
```

### Notes

#### Get All Notes
```http
GET /notes?tags=work,personal
Authorization: Bearer <token>
```

**Query Parameters:**
- `tags` (optional): Comma-separated list of tags to filter by

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Note Title",
    "content": "Note content...",
    "tags": ["work", "important"],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Note
```http
GET /notes/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Note Title",
  "content": "Note content...",
  "tags": ["work", "important"],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Create Note
```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Note",
  "content": "Note content...",
  "tags": ["work", "important"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "New Note",
  "content": "Note content...",
  "tags": ["work", "important"],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Update Note
```http
PATCH /notes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["work", "updated"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["work", "updated"],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Delete Note
```http
DELETE /notes/{id}
Authorization: Bearer <token>
```

**Response:**
```http
204 No Content
```

### Health & Metrics

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

#### Metrics
```http
GET /metrics
```

**Response:**
```
# HELP notes_requests_total Total number of notes requests
# TYPE notes_requests_total counter
notes_requests_total{method="GET",endpoint="/notes"} 10

# HELP cache_hits_total Total number of cache hits
# TYPE cache_hits_total counter
cache_hits_total{cache_type="notes"} 5
```

## Example cURL Commands

### 1. Register a new user (Load Balanced)
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Login (Load Balanced)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Create a note (Load Balanced)
```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "My Note", "content": "This is my first note", "tags": ["personal", "important"]}'
```

### 4. Get all notes (Load Balanced)
```bash
curl -X GET http://localhost:8080/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get notes filtered by tags (Load Balanced)
```bash
curl -X GET "http://localhost:8080/notes?tags=work,important" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update a note (Load Balanced)
```bash
curl -X PATCH http://localhost:8080/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Updated Note", "content": "Updated content"}'
```

### 7. Delete a note (Load Balanced)
```bash
curl -X DELETE http://localhost:8080/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Test Load Balancing
```bash
# Check which API instance served the request
curl -I http://localhost:8080/health

# Test round-robin behavior
for i in {1..5}; do
  echo "Request $i:"
  curl -s http://localhost:8080/health | grep -o "X-Upstream-Instance: [^[:space:]]*"
  echo ""
done
```

### 9. Check Cache Headers
```bash
# First request (cache miss)
curl -I "http://localhost:8080/notes?tags=work" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Second request (cache hit)
curl -I "http://localhost:8080/notes?tags=work" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Note not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```
