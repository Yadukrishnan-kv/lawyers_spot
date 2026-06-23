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
import { securityHeaders, requireJsonContentType } from './security/middleware.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use('/api/v1/bookings', bookingLimiter, bookingsRouter);
app.use('/api/v1/lawyer', lawyerRouter);
app.use('/api/v1/admin/auth/login', adminLoginLimiter);
app.use('/api/v1', sectionsRouter);
app.use('/api/v1/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ detail: 'Not found' });
});

app.listen(config.port, () => {
  console.log(`LawyerSpot API (Node.js) http://127.0.0.1:${config.port}`);
  console.log(`  Health: http://127.0.0.1:${config.port}/health`);
  console.log(`  CMS:    http://127.0.0.1:${config.port}/api/v1/cms`);
});
