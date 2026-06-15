# LawyerSpot Security

## Production checklist

1. Set strong `ADMIN_SESSION_SECRET` (32+ random bytes) in both `backend-node/.env` and `platform/.env.local`.
2. Change `ADMIN_PASSWORD` from the default; use a password manager.
3. Set `NODE_ENV=production` on the API and use HTTPS (reverse proxy).
4. Restrict `CORS_ORIGINS` to your real domain only.
5. Use a dedicated PostgreSQL user with least privilege (not superuser).
6. Keep `DATABASE_URL` out of git and client bundles.

## Implemented controls

- **API**: Rate limits on auth, admin login, and bookings; security headers; JSON body size cap (2MB); public CMS strips `adminUsers` and `bookings`.
- **Auth**: bcrypt (12 rounds), httpOnly + `SameSite=strict` cookies, `secure` in production, timing-safe admin password compare.
- **Input**: Email/password validation, text sanitization, booking field validation.
- **Frontend**: CSP and security headers via `next.config.ts`; CMS HTML sanitized before `dangerouslySetInnerHTML`; no internal CMS data in public React context.
- **SEO**: `robots.ts`, dynamic `sitemap.xml`, JSON-LD, canonical URLs, `lang="en-IN"`.
- **Database**: Indexes on lookup columns; `security_audit_log` table for future audit hooks.

## Reporting issues

Do not post vulnerabilities publicly. Contact the project maintainer privately.
