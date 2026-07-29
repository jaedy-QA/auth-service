# Auth Service Repository (`auth-service`)

Authentication microservice for the Notes App.

## Features

- **User Registration**: `POST /api/auth/register`
- **User Login**: `POST /api/auth/login`
- **Session Verification**: `GET /api/auth/me`
- **Logout**: `POST /api/auth/logout`

## Pre-seeded Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `password123`

## Development

```bash
npm install
STANDALONE=true AUTH_PORT=3001 npm run start
```
