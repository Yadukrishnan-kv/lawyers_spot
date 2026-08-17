import { Router } from 'express';
import { config } from '../config.js';
import { clearSessionCookie, requireAdmin, setSessionCookie } from '../auth.js';
import { loadCms, saveCms } from '../cms.js';
import { query } from '../db.js';
import { safeCompareStrings } from '../security/safe-compare.js';
import { normalizeEmail, sanitizeText } from '../security/validate.js';
export const adminRouter = Router();
adminRouter.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const normalized = email ? normalizeEmail(email) : null;
    if (!normalized ||
        !password ||
        !safeCompareStrings(normalized, config.adminEmail) ||
        !safeCompareStrings(password, config.adminPassword)) {
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
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load CMS' });
    }
});
adminRouter.put('/cms', requireAdmin, async (req, res) => {
    try {
        const saved = await saveCms(req.body);
        res.json(saved);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to save CMS' });
    }
});
adminRouter.get('/articles/:slug/lawyers', requireAdmin, async (req, res) => {
    try {
        const rows = await query('SELECT lawyer_id FROM article_lawyers WHERE article_slug = $1', [req.params.slug]);
        res.json({ lawyerIds: rows.rows.map((r) => r.lawyer_id) });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load article lawyers' });
    }
});
// List all registered clients (role = 'client') with their booking counts.
adminRouter.get('/clients', requireAdmin, async (_req, res) => {
    try {
        const r = await query(`SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
              COUNT(b.id)::int AS bookings_count
         FROM platform_users u
         LEFT JOIN bookings b ON b.user_id = u.id
        WHERE u.role = 'client'
        GROUP BY u.id
        ORDER BY u.created_at DESC`);
        res.json({ clients: r.rows });
    }
    catch (e) {
        console.error('admin list clients failed', e);
        res.status(500).json({ detail: 'Failed to load clients' });
    }
});
const CLIENT_STATUSES = ['active', 'blocked', 'deleted'];
adminRouter.patch('/clients/:id', requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, status } = req.body;
        const updates = [];
        const params = [];
        let idx = 1;
        if (typeof name === 'string' && name.trim()) {
            updates.push(`name = $${idx++}`);
            params.push(sanitizeText(name, 120));
        }
        if (typeof email === 'string') {
            const normalized = normalizeEmail(email);
            if (!normalized) {
                res.status(400).json({ detail: 'Enter a valid email address.' });
                return;
            }
            const existing = await query('SELECT id FROM platform_users WHERE lower(email) = $1 AND id != $2', [normalized, req.params.id]);
            if (existing.rows.length > 0) {
                res.status(409).json({ detail: 'Another account already uses this email.' });
                return;
            }
            updates.push(`email = $${idx++}`);
            params.push(normalized);
        }
        if (typeof phone === 'string') {
            updates.push(`phone = $${idx++}`);
            params.push(sanitizeText(phone, 32) || null);
        }
        if (typeof status === 'string') {
            if (!CLIENT_STATUSES.includes(status)) {
                res.status(400).json({ detail: 'Invalid status.' });
                return;
            }
            updates.push(`status = $${idx++}`);
            params.push(status);
        }
        if (updates.length === 0) {
            res.status(400).json({ detail: 'No fields to update' });
            return;
        }
        params.push(req.params.id);
        const r = await query(`UPDATE platform_users SET ${updates.join(', ')}
        WHERE id = $${idx} AND role = 'client'
        RETURNING id, name, email, phone, status, created_at`, params);
        if (r.rowCount === 0) {
            res.status(404).json({ detail: 'Client not found' });
            return;
        }
        res.json({ success: true, client: r.rows[0] });
    }
    catch (e) {
        console.error('admin update client failed', e);
        res.status(500).json({ detail: 'Failed to update client' });
    }
});
adminRouter.delete('/clients/:id', requireAdmin, async (req, res) => {
    try {
        const r = await query(`UPDATE platform_users SET status = 'deleted' WHERE id = $1 AND role = 'client'`, [req.params.id]);
        if (r.rowCount === 0) {
            res.status(404).json({ detail: 'Client not found' });
            return;
        }
        res.json({ success: true });
    }
    catch (e) {
        console.error('admin delete client failed', e);
        res.status(500).json({ detail: 'Failed to delete client' });
    }
});
adminRouter.patch('/bookings/:id', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            res.status(400).json({ detail: 'Invalid status' });
            return;
        }
        const booking = await query('SELECT id FROM bookings WHERE id = $1', [req.params.id]);
        if (!booking.rows[0]) {
            res.status(404).json({ detail: 'Booking not found' });
            return;
        }
        await query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
        await query('UPDATE site_config SET updated_at = NOW() WHERE id = 1');
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to update booking' });
    }
});
adminRouter.put('/articles/:slug/lawyers', requireAdmin, async (req, res) => {
    try {
        const { lawyerIds } = req.body;
        if (!Array.isArray(lawyerIds)) {
            res.status(400).json({ detail: 'lawyerIds must be an array' });
            return;
        }
        const slug = req.params.slug;
        const articleCheck = await query('SELECT slug FROM articles WHERE slug = $1', [slug]);
        if (!articleCheck.rows[0]) {
            res.status(404).json({ detail: 'Article not found' });
            return;
        }
        const uniqueIds = [...new Set(lawyerIds.filter((id) => id && id.trim()))];
        await query('DELETE FROM article_lawyers WHERE article_slug = $1', [slug]);
        for (const lawyerId of uniqueIds) {
            await query('INSERT INTO article_lawyers (article_slug, lawyer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [slug, lawyerId]);
        }
        await query('UPDATE site_config SET updated_at = NOW() WHERE id = 1');
        res.json({ success: true, lawyerIds: uniqueIds });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to update article lawyers' });
    }
});
