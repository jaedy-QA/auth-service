# Auth Service

Authentication service for the Notes App.

## What it provides

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
cd auth-service
npm install
```

## Run locally

```bash
npm run dev
```

The service runs on port `3001` by default. To use a different port:

```bash
AUTH_PORT=3002 npm run dev
```

## Demo accounts

- Demo user: `demo@example.com` / `password123`
- Test user: `test@qa.com` / `testonly`

## Notes

- Users and sessions are stored in memory, so restarting the service resets them.
- The notes API and frontend expect this service to be running when you use the app.
