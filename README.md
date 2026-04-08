# Gilded Heirloom

This project now uses a split setup:

- `./` keeps the existing Vite frontend unchanged.
- `./backend` is a standalone Express + TypeScript + Prisma service.

## Frontend

Run the existing frontend from the project root:

```powershell
npm install
npm run dev
```

The frontend scripts and root TypeScript config are intentionally separate from the backend.

## Backend Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- PostgreSQL available locally or remotely
- A valid `DATABASE_URL`

This workspace was verified with:

- Node `v22.14.0`
- npm `10.9.2`

## Backend Setup

Move into the isolated backend directory before installing or running backend commands:

```powershell
cd .\backend
npm install
```

Copy or update the backend environment file as needed:

```powershell
Copy-Item .env.example .env
```

Default backend environment values:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gilded_heirloom?schema=public"
CORS_ORIGIN="http://localhost:3000"
LOG_LEVEL=info
```

## Backend Commands

```powershell
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Backend Verification Flow

Start the backend in one terminal:

```powershell
cd .\backend
npm run dev
```

Then verify the core Phase 1 routes from another terminal:

```powershell
curl.exe -i http://127.0.0.1:5000/health
curl.exe -i http://127.0.0.1:5000/missing-route
curl.exe -i http://127.0.0.1:5000/test/internal-error
```

Expected behavior:

- `GET /health` returns `200` with JSON containing `success: true` and a timestamp.
- Unknown routes return `404` with a standardized JSON error payload.
- `GET /test/internal-error` returns `500` with the global error-handler payload.

Example successful responses:

```json
{"success":true,"timestamp":"2026-04-07T08:26:37.753Z","service":"backend"}
```

```json
{"success":false,"error":{"message":"Route not found: GET /missing-route","statusCode":404},"timestamp":"2026-04-07T08:26:37.903Z"}
```

```json
{"success":false,"error":{"message":"Internal server error","statusCode":500},"timestamp":"2026-04-07T08:26:38.077Z"}
```

## Prisma Notes

- Prisma Client generation was verified successfully with `npm run prisma:generate`.
- Catalog seed data can be loaded with `npm run prisma:seed`.
- `localhost:5432` is reachable in this environment.
- The initial catalog migration baseline is recorded and `npx prisma migrate status` reports the database schema is up to date.
- The backend is configured for Prisma 7 using [`backend/prisma.config.ts`](/C:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/prisma.config.ts), so the datasource URL is loaded there instead of inside `schema.prisma`.

## Phase 1 Done

- Isolated backend scaffold under [`backend`](/C:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend)
- Separate backend `package.json`, `tsconfig.json`, `.env`, and `.gitignore`
- Express app/server split with middleware ordering
- Health route and internal error test route
- Pino logger, standardized 404/500 handlers, and typed env loading
- Prisma baseline with PostgreSQL datasource config and generated client
