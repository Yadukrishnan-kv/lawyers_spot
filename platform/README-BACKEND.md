# LawyerSpot — Full stack setup

## Architecture

```
Next.js 15 (platform/)  →  FastAPI (backend/)  →  PostgreSQL
     UI + Admin              REST API               Database
```

## 1. PostgreSQL

**Option A — Docker** (if installed):

```powershell
cd D:\xampp\htdocs\lawrato\backend
docker compose up -d
```

**Option B — Local PostgreSQL**

Create database `lawyerspot` and user, then set `DATABASE_URL` in `backend/.env`.

## 2. Python API

```powershell
cd D:\xampp\htdocs\lawrato\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python scripts\seed_from_json.py
uvicorn app.main:app --reload --port 8000
```

## 3. Next.js frontend

```powershell
cd D:\xampp\htdocs\lawrato\platform
copy .env.local.example .env.local
npm run dev
```

Set in `.env.local`:

```env
BACKEND_URL=http://127.0.0.1:8000
ADMIN_SESSION_SECRET=lawyerspot-dev-secret-change-in-production
```

Use the **same** `ADMIN_SESSION_SECRET` in `backend/.env`.

## Behaviour

- Public pages load CMS from `GET http://127.0.0.1:8000/api/v1/cms`
- Admin saves go through Next.js `/api/admin/cms` → Python `PUT /api/v1/admin/cms`
- If the API is down, Next.js falls back to `platform/data/cms.json`

## API docs

With uvicorn running: http://127.0.0.1:8000/docs
