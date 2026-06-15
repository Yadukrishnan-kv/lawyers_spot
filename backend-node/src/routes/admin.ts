import { Router } from 'express';
import { config } from '../config.js';
import { clearSessionCookie, requireAdmin, setSessionCookie } from '../auth.js';
import { loadCms, saveCms } from '../cms.js';
import type { CmsData } from '../types.js';
import { safeCompareStrings } from '../security/safe-compare.js';
import { normalizeEmail } from '../security/validate.js';

export const adminRouter = Router();

adminRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalized = email ? normalizeEmail(email) : null;
  if (
    !normalized ||
    !password ||
    !safeCompareStrings(normalized, config.adminEmail) ||
    !safeCompareStrings(password, config.adminPassword)
  ) {
    res.status(401).json({ detail: 'Invalid email or password' });
    return;
  }
  setSessionCookie(res, normalized);
  res.json({ success: true });
});

adminRouter.post('/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

adminRouter.get('/cms', requireAdmin, async (_req, res) => {
  try {
    const data = await loadCms();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load CMS' });
  }
});

adminRouter.put('/cms', requireAdmin, async (req, res) => {
  try {
    const saved = await saveCms(req.body as CmsData);
    res.json(saved);
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to save CMS' });
  }
});
