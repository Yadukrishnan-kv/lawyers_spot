import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { bookingsRouter } from './routes/bookings.js';
import { lawyerRouter } from './routes/lawyer.js';
import { publicRouter } from './routes/public.js';
import { sectionsRouter } from './routes/sections.js';
import { userRouter } from './routes/user.js';
import { pendingLawyersRouter } from './routes/admin-pending-lawyers.js';
import { lawyerPasswordResetRouter } from './routes/lawyer-password-reset.js';
import { clientPasswordResetRouter } from './routes/client-password-reset.js';
import { securityHeaders, requireJsonContentType } from './security/middleware.js';
import { query } from './db.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Cookie'],
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/api/v1', requireJsonContentType);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many requests. Try again later.' },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many booking attempts.' },
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many login attempts.' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', publicRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth/forgot-password', lawyerPasswordResetRouter);
app.use('/api/v1/auth/client-forgot-password', clientPasswordResetRouter);
app.use('/api/v1/bookings', bookingLimiter, bookingsRouter);
app.use('/api/v1/lawyer', lawyerRouter);
app.use('/api/v1/admin/auth/login', adminLoginLimiter);
app.use('/api/v1', sectionsRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/pending-lawyers', pendingLawyersRouter);

app.use((_req, res) => {
  res.status(404).json({ detail: 'Not found' });
});

// Run migration to add created_at column if it does not exist
try {
  await query('ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  console.log('Database migration successful: added created_at to lawyers if missing.');
} catch (e) {
  console.error('Database migration failed:', e);
}

// Ensure the lawyer password-reset table exists (forgot/create password flow).
try {
  await query(`
    CREATE TABLE IF NOT EXISTS lawyer_password_resets (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      lawyer_id VARCHAR(128),
      phone VARCHAR(20) NOT NULL,
      phone_key VARCHAR(10) NOT NULL,
      otp_sent_at TIMESTAMPTZ,
      otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
      token_hash VARCHAR(128),
      token_used BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_lawyer_password_resets_phone_key ON lawyer_password_resets(phone_key)',
  );
  await query(
    'CREATE INDEX IF NOT EXISTS idx_lawyer_password_resets_token ON lawyer_password_resets(token_hash)',
  );
  console.log('Database migration successful: lawyer_password_resets ready.');
} catch (e) {
  console.error('Database migration failed (lawyer_password_resets):', e);
}

// Ensure the client password-reset table exists (client forgot-password flow).
try {
  await query(`
    CREATE TABLE IF NOT EXISTS client_password_resets (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      channel VARCHAR(10) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      phone_key VARCHAR(10),
      otp_hash VARCHAR(128),
      otp_attempts INT NOT NULL DEFAULT 0,
      otp_sent_at TIMESTAMPTZ,
      otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
      token_hash VARCHAR(128),
      token_used BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_client_password_resets_user ON client_password_resets(user_id)',
  );
  await query(
    'CREATE INDEX IF NOT EXISTS idx_client_password_resets_token ON client_password_resets(token_hash)',
  );
  console.log('Database migration successful: client_password_resets ready.');
} catch (e) {
  console.error('Database migration failed (client_password_resets):', e);
}

app.listen(config.port, () => {
  console.log(`LawyerSpot API (Node.js) http://127.0.0.1:${config.port}`);
  console.log(`  Health: http://127.0.0.1:${config.port}/health`);
  console.log(`  CMS:    http://127.0.0.1:${config.port}/api/v1/cms`);
});
