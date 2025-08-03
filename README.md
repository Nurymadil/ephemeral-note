# Ephemeral Note API

This is a backend application built with NestJS and TypeScript for managing user notes with secure, one-time share links. It includes JWT authentication with refresh tokens, PostgreSQL database via Prisma, and Docker support. The app implements "Secure Share Links" as per the task specification: one-time links with TTL, stored token hashes, and proper status codes (404/410 for expired/used).

## Features
- User registration and authentication (JWT access + refresh tokens).
- CRUD operations for notes (only for the author).
- Secure share links: Create, list, view (one-time, public), revoke.
- Password change with verification.
- Swagger API documentation at `/api`.
- Dockerized setup with auto-migrations.
- Seeding for demo data.
- Validation, error handling, and security (bcrypt for passwords, token hashes).

## Prerequisites
- Node.js v18+ (for local dev).
- Docker and docker-compose (for production-like setup).
- pnpm (package manager, as specified).

## Setup
1. Clone the repository:
   ```
   git clone https://github.com/Nurymadil/ephemeral-note.git
   cd ephemeral-note
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Copy the example environment file and configure it:
   ```
   cp .env.example .env
   ```
   - Edit `.env` with your values (e.g., JWT_SECRET, DATABASE_URL for local: `postgresql://postgres:password@localhost:5432/ephemeral_note?schema=public`).
   - For Docker, DATABASE_URL uses `db` as host (already set in .env.example).

4. Generate Prisma client (if needed):
   ```
   npx prisma generate
   ```

## Running the Application

### With Docker (Recommended, as per task)
This starts the app and PostgreSQL DB, runs migrations automatically.
```
docker-compose up -d
```
- App runs on `http://localhost:3000`.
- Swagger: `http://localhost:3000/api`.
- Check logs: `docker-compose logs -f app`.
- Stop: `docker-compose down`.

Note: DB healthcheck ensures migrations run after DB is ready.

### Locally (for Development)
1. Start a local PostgreSQL DB (e.g., via Docker):
   ```
   docker run -d -p 5432:5432 --name pg -e POSTGRES_PASSWORD=password -e POSTGRES_USER=postgres -e POSTGRES_DB=ephemeral_note postgres:14
   ```

2. Apply migrations:
   ```
   npx prisma migrate dev --name init
   ```

3. Start the app:
   ```
   pnpm start:dev
   ```
   - Watches for changes.

## Seeding Data
Run this to create a demo user and 5 notes (required as per task). Ensure DB is running and migrated.
```
pnpm seed
```
- Test user: `email: test@example.com`, `password: password`.
- Notes: 5 sample notes owned by the test user.

## API Documentation
- Swagger UI: `http://localhost:3000/api` (interactive docs with schemas, examples, and auth).

## Example Requests (cURL)
All requests to `http://localhost:3000`. Use Bearer token for authorized endpoints (get from /auth/login).

### Register User
```
curl -X POST http://localhost:3000/users/register \
-H "Content-Type: application/json" \
-d '{"email": "newuser@example.com", "password": "securepass"}'
```

### Login (Get Tokens)
```
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password"}'
```
- Response: `{ "access_token": "...", "refresh_token": "..." }`.

### Refresh Tokens
```
curl -X POST http://localhost:3000/auth/refresh \
-H "Content-Type: application/json" \
-d '{"refresh_token": "your_refresh_token"}'
```

### Change Password
```
curl -X PATCH http://localhost:3000/users/me/password \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"oldPassword": "password", "newPassword": "newpass"}'
```

### Create Note
```
curl -X POST http://localhost:3000/notes \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"title": "My Note", "body": "Content"}'
```

### Get All Notes
```
curl -X GET http://localhost:3000/notes \
-H "Authorization: Bearer <access_token>"
```

### Get One Note
```
curl -X GET http://localhost:3000/notes/1 \
-H "Authorization: Bearer <access_token>"
```

### Update Note
```
curl -X PATCH http://localhost:3000/notes/1 \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"title": "Updated Title"}'
```

### Delete Note
```
curl -X DELETE http://localhost:3000/notes/1 \
-H "Authorization: Bearer <access_token>"
```

### Create Share Link
```
curl -X POST http://localhost:3000/notes/1/share \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{"ttlMinutes": 10}'
```
- Response: `{ "token": "uuid-string" }`.

### View Public Note (One-Time)
```
curl -X GET http://localhost:3000/public/notes/<token>
```
- First: Note data (200).
- Second/Expired: 410 Gone.

### List Share Links
```
curl -X GET http://localhost:3000/notes/1/share \
-H "Authorization: Bearer <access_token>"
```

### Revoke Share Link
```
curl -X DELETE http://localhost:3000/notes/1/share/<tokenId> \
-H "Authorization: Bearer <access_token>"
```

## Testing
Run e2e tests (includes at least 5 for share links):
```
pnpm test:e2e
```

## Linting and Formatting
- Lint: `pnpm lint`
- Format: `pnpm format`
- Husky pre-commit hook enforces this.

## License
MIT