# LawyerSpot API (Node.js + PostgreSQL)

Express API that powers the React (Next.js) frontend and admin panel. Replaces the legacy Python FastAPI backend with the same routes and session format.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **Database:** PostgreSQL 16
- **Frontend:** `../platform` (Next.js / React)

## Quick start

```powershell
# 1. PostgreSQL (Docker)
cd ..\backend
docker compose up -d

# 2. API setup
cd ..\backend-node
copy .env.example .env
npm install
npm run db:setup

# 3. Run API
npm run dev
```

API: http://127.0.0.1:4000  
Health: http://127.0.0.1:4000/health

## Environment

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `postgresql://lawyerspot:lawyerspot@localhost:5432/lawyerspot` |
| `PORT` | `4000` |
| `ADMIN_EMAIL` | `admin@lawyerspot.com` |
| `ADMIN_PASSWORD` | `admin123` |
| `ADMIN_SESSION_SECRET` | (must match `platform/.env.local`) |
| `CORS_ORIGINS` | `http://localhost:3000` |

## API routes

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | — |
| GET | `/api/v1/cms` | Public |
| POST | `/api/v1/admin/auth/login` | — |
| POST | `/api/v1/admin/auth/logout` | — |
| GET | `/api/v1/admin/cms` | Admin cookie |
| PUT | `/api/v1/admin/cms` | Admin cookie |

## Scripts

- `npm run db:schema` — create tables
- `npm run db:seed` — import `platform/data/cms.json`
- `npm run db:setup` — schema + seed
