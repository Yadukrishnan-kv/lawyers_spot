import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loadCms, saveCms } from '../cms.js';
import {
  clearUserCookie,
  findUserByEmail,
  findUserById,
  hashPassword,
  setUserCookie,
  verifyPassword,
  requireUser,
} from '../platform-auth.js';
import { query } from '../db.js';
import { normalizeEmail, sanitizeText, validatePassword } from '../security/validate.js';
import { slugifyName } from '../lawyer-slug.js';

export const authRouter = Router();

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many requests. Try again later.' },
});

authRouter.post('/signup', sensitiveLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    const normalized = email ? normalizeEmail(email) : null;
    const pwd = password ? validatePassword(password) : null;
    const cleanName = name ? sanitizeText(name, 120) : '';
    if (!cleanName || !normalized || !pwd) {
      res.status(400).json({ detail: 'Invalid name, email, or password (min 6 characters)' });
      return;
    }
    const existing = await findUserByEmail(normalized);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }
    const id = `user-${Date.now()}`;
    await query(
      `INSERT INTO platform_users (id, email, password_hash, name, role, status) VALUES ($1,$2,$3,$4,'client','active')`,
      [id, normalized, await hashPassword(pwd), cleanName],
    );
    setUserCookie(res, id, 'client');
    res.json({ success: true, role: 'client', userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Signup failed' });
  }
});

authRouter.post('/lawyer-signup', sensitiveLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, practice, barId, citySlug } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      practice?: string;
      barId?: string;
      citySlug?: string;
    };
    const normalized = email ? normalizeEmail(email) : null;
    const pwd = password ? validatePassword(password) : null;
    const cleanName = name ? sanitizeText(name, 120) : '';
    const cleanPractice = practice ? sanitizeText(practice, 64) : '';
    if (!cleanName || !normalized || !pwd || !cleanPractice) {
      res.status(400).json({ detail: 'Invalid or missing required fields' });
      return;
    }
    const existing = await findUserByEmail(normalized);
    if (existing) {
      res.status(409).json({ detail: 'Unable to create account with this email' });
      return;
    }

    const cms = await loadCms();
    const safeCity =
      citySlug && cms.cities.some((c) => c.slug === citySlug) ? citySlug : cms.cities[0]?.slug;
    const lawyerId = `lawyer-${Date.now()}`;
    const slug = slugifyName(cleanName);
    const city = cms.cities.find((c) => c.slug === safeCity);
    const newLawyer = {
      id: lawyerId,
      slug,
      name: cleanName,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 0,
      experience: 1,
      fee: 2000,
      currency: 'INR',
      location: city?.name ?? 'India',
      citySlug: safeCity,
      practice: cleanPractice,
      specialization: [cleanPractice],
      online: true,
      verified: false,
      email: normalized,
      emailVerified: false,
      phone: phone ? sanitizeText(phone, 20) : undefined,
      phoneVerified: false,
      bio: `Bar enrollment: ${barId ? sanitizeText(barId, 64) : 'pending'}. Profile created via lawyer signup.`,
    };
    cms.lawyers.push(newLawyer);
    await saveCms(cms);

    const userId = `lawyer-user-${Date.now()}`;
    await query(
      `INSERT INTO platform_users (id, email, password_hash, name, role, lawyer_id, phone, status) VALUES ($1,$2,$3,$4,'lawyer',$5,$6,'active')`,
      [userId, normalized, await hashPassword(pwd), cleanName, lawyerId, phone ? sanitizeText(phone, 20) : null],
    );
    setUserCookie(res, userId, 'lawyer');
    res.json({ success: true, role: 'lawyer', userId, lawyerId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Lawyer signup failed' });
  }
});

authRouter.post('/login', sensitiveLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body as { email?: string; password?: string; role?: string };
    const normalized = email ? normalizeEmail(email) : null;
    if (!normalized || !password) {
      res.status(400).json({ detail: 'Email and password required' });
      return;
    }
    const user = await findUserByEmail(normalized);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ detail: 'Invalid email or password' });
      return;
    }
    if (role && user.role !== role) {
      res.status(401).json({ detail: 'Invalid email or password' });
      return;
    }
    if (user.status !== 'active') {
      res.status(403).json({ detail: 'Account not active' });
      return;
    }
    setUserCookie(res, user.id, user.role);
    res.json({
      success: true,
      role: user.role,
      userId: user.id,
      lawyerId: user.lawyer_id,
      name: user.name,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Login failed' });
  }
});

authRouter.post('/logout', (_req, res) => {
  clearUserCookie(res);
  res.json({ success: true });
});

authRouter.get('/me', requireUser(), async (req, res) => {
  const { userId } = (req as typeof req & { user: { userId: string } }).user;
  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ detail: 'User not found' });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lawyerId: user.lawyer_id,
  });
});
