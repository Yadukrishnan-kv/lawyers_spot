# LawyerSpot — Full dynamic stack (React + Node.js + PostgreSQL)

## Architecture

```
Browser
    ↓
http://localhost:3000  →  Next.js / React (platform/)
    ↓
http://localhost:4000  →  Node.js Express API (backend-node/)
    ↓
PostgreSQL (lawyerspot database)
```

| Layer | Technology | Folder |
|-------|------------|--------|
| Frontend | React (Next.js 15) | `platform/` |
| Backend | Node.js (Express) | `backend-node/` |
| Database | PostgreSQL 16 | Docker or local install |

**CMS modules** (all stored in PostgreSQL, edited in admin):

- Site settings, homepage stats  
- Lawyers, practice areas, states, cities  
- Articles, Q&A, bookings, admin users  

---

## Part 1 — PostgreSQL

### Option A: Docker (recommended)

```powershell
cd D:\xampp\htdocs\lawyerspot\backend
docker compose up -d
```

### Option B: Local PostgreSQL

Create database and user (pgAdmin or psql):

```sql
CREATE USER lawyerspot WITH PASSWORD 'lawyerspot';
CREATE DATABASE lawyerspot OWNER lawyerspot;
GRANT ALL PRIVILEGES ON DATABASE lawyerspot TO lawyerspot;
```

---

## Part 2 — Node.js API

```powershell
cd D:\xampp\htdocs\lawyerspot\backend-node
copy .env.example .env
notepad .env
```

Ensure:

```env
DATABASE_URL=postgresql://lawyerspot:lawyerspot@localhost:5432/lawyerspot
PORT=4000
ADMIN_EMAIL=admin@lawyerspot.com
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=lawyerspot-dev-secret-change-in-production
CORS_ORIGINS=http://localhost:3000
```

Install and seed:

```powershell
npm install
npm run db:setup
```

Start API (**leave this terminal open**):

```powershell
npm run dev
```

Verify:

| URL | Expected |
|-----|----------|
| http://localhost:4000/health | `{"status":"ok"}` |
| http://localhost:4000/api/v1/cms | JSON with lawyers, cities, etc. |

---

## Part 3 — React frontend (Next.js)

```powershell
cd D:\xampp\htdocs\lawyerspot\platform
copy .env.local.example .env.local
notepad .env.local
```

```env
BACKEND_URL=http://127.0.0.1:4000
ADMIN_EMAIL=admin@lawyerspot.com
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=lawyerspot-dev-secret-change-in-production
```

`ADMIN_SESSION_SECRET` must match `backend-node/.env`.

```powershell
npm install
npm run dev
```

Open:

- **Website:** http://localhost:3000  
- **Admin:** http://localhost:3000/admin/login (`admin@lawyerspot.com` / `admin123`)

Edits in admin → saved to PostgreSQL via Node API → live on the public site.

---

## Daily workflow

**Terminal 1 — API**

```powershell
cd D:\xampp\htdocs\lawyerspot\backend-node
npm run dev
```

**Terminal 2 — Website**

```powershell
cd D:\xampp\htdocs\lawyerspot\platform
npm run dev
```

PostgreSQL (Docker) usually runs in the background.

---

## Troubleshooting

### Site shows old JSON data

Node API is not running, or `BACKEND_URL` is wrong. Start `backend-node` and restart `npm run dev` in `platform`.

### Admin save fails

1. API on port **4000**  
2. Same `ADMIN_SESSION_SECRET` in both `.env` files  
3. Restart API and frontend after env changes  

### `Site not configured. Run db:setup`

```powershell
cd backend-node
npm run db:setup
```

### Re-seed from JSON

```powershell
cd backend-node
npm run db:seed
```

---

## Legacy Python API

The folder `backend/` contains the previous FastAPI implementation. Use **`backend-node/`** for new development.
