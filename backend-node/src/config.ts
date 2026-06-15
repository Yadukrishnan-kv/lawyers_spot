import 'dotenv/config';

export const config = {
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://lawyerspot:lawyerspot@localhost:5432/lawyerspot',
  port: Number(process.env.PORT ?? 4000),
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@lawyerspot.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? 'lawyerspot-dev-secret-change-in-production',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  cookieName: process.env.COOKIE_NAME ?? 'lawyerspot_admin_session',
  sessionDays: Number(process.env.SESSION_DAYS ?? 7),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  cmsCacheSeconds: Number(process.env.CMS_CACHE_SECONDS ?? 60),
};
