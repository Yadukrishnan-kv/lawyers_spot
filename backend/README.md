# LawyerSpot API (Python / FastAPI / PostgreSQL)

Backend for the LawyerSpot Next.js frontend.

## Stack

- **FastAPI** — REST API
- **SQLAlchemy 2** — ORM
- **PostgreSQL 16** — database
- **Alembic** — migrations (optional; seed script can `create_all`)

## Quick start

### 1. Start PostgreSQL

```powershell
cd D:\xampp\htdocs\lawrato\backend
docker compose up -d
```

### 2. Python environment

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

### 3. Seed database from existing CMS JSON

```powershell
python scripts/seed_from_json.py
```

### 4. Run API

```powershell
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/health  
- Public CMS: http://localhost:8000/api/v1/cms  
- Admin login: `POST http://localhost:8000/api/v1/admin/auth/login`

### 5. Next.js frontend

In `platform/.env.local`:

```env
BACKEND_URL=http://127.0.0.1:8000
ADMIN_EMAIL=admin@lawyerspot.com
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=lawyerspot-dev-secret-change-in-production
```

Start Next.js (`npm run dev`) — it proxies admin/public CMS routes to this API.

## API overview

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/cms` | Public |
| GET | `/api/v1/admin/cms` | Cookie |
| PUT | `/api/v1/admin/cms` | Cookie |
| POST | `/api/v1/admin/auth/login` | — |
| POST | `/api/v1/admin/auth/logout` | — |

Session cookie name: `lawyerspot_admin_session` (compatible with Next.js admin middleware).
