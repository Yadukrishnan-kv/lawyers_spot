import { Router } from 'express';
import { loadCms, saveCms } from '../cms.js';
import { findUserById, hashPassword, requireUser, verifyPassword, } from '../platform-auth.js';
import { query } from '../db.js';
import { normalizeEmail, sanitizeText, validatePassword } from '../security/validate.js';
import { applyPlanFlagsToLawyer } from '../subscription-features.js';
import { lawyerContentRouter } from './lawyer-content.js';
import { lawyerVerifyRouter } from './lawyer-verify.js';
export const lawyerRouter = Router();
lawyerRouter.use(lawyerContentRouter);
lawyerRouter.use(lawyerVerifyRouter);
async function resolveLawyerAccount(userId) {
    const user = await findUserById(userId);
    if (!user || user.role !== 'lawyer' || !user.lawyer_id)
        return null;
    const cms = await loadCms();
    const lawyer = cms.lawyers.find((l) => l.id === user.lawyer_id);
    if (!lawyer)
        return null;
    return { user, lawyer, cms };
}
function lawyerToJson(lawyer) {
    return {
        id: lawyer.id,
        slug: lawyer.slug,
        name: lawyer.name,
        image: lawyer.image,
        rating: lawyer.rating,
        reviews: lawyer.reviews,
        experience: lawyer.experience,
        fee: lawyer.fee,
        currency: lawyer.currency,
        location: lawyer.location,
        address: lawyer.address,
        practice: lawyer.practice,
        citySlug: lawyer.citySlug,
        specialization: lawyer.specialization ?? [],
        online: lawyer.online,
        verified: lawyer.verified,
        email: lawyer.email,
        emailVerified: lawyer.emailVerified,
        phone: lawyer.phone,
        phoneVerified: lawyer.phoneVerified,
        languages: lawyer.languages,
        firm: lawyer.firm,
        bio: lawyer.bio,
        subscriptionPlanId: lawyer.subscriptionPlanId ?? 'basic',
        subscriptionExpiresAt: lawyer.subscriptionExpiresAt ?? null,
        topRated: lawyer.topRated,
    };
}
lawyerRouter.get('/profile', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        res.json({ lawyer: lawyerToJson(account.lawyer), user: {
                id: account.user.id,
                name: account.user.name,
                email: account.user.email,
            } });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load profile' });
    }
});
lawyerRouter.get('/dashboard-stats', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const rating = account.lawyer.rating ?? 0;
        const [bookingsRes, conversationsRes] = await Promise.all([
            query('SELECT COUNT(*)::text as count FROM bookings WHERE lawyer_id = $1', [lawyerId]),
            query('SELECT COUNT(*)::text as count FROM conversations WHERE lawyer_id = $1', [lawyerId]),
        ]);
        let unreadMessages = 0;
        try {
            const unreadRes = await query(`SELECT COUNT(*)::text as count FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE c.lawyer_id = $1 AND m.sender_type = 'user' AND m.is_read = FALSE`, [lawyerId]);
            unreadMessages = parseInt(unreadRes.rows[0]?.count ?? '0', 10);
        }
        catch { }
        res.json({
            newLeads: parseInt(conversationsRes.rows[0]?.count ?? '0', 10),
            appointments: parseInt(bookingsRes.rows[0]?.count ?? '0', 10),
            earnings: 0,
            rating,
            unreadMessages,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load dashboard stats' });
    }
});
lawyerRouter.get('/bookings', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const r = await query(`SELECT id, user_id, client_name, client_email, date, time, type, status 
       FROM bookings 
       WHERE lawyer_id = $1 
       ORDER BY date DESC, time DESC`, [lawyerId]);
        res.json({
            bookings: r.rows.map((b) => ({
                id: b.id,
                userId: b.user_id,
                clientName: b.client_name,
                clientEmail: b.client_email,
                date: b.date,
                time: b.time,
                type: b.type,
                status: b.status,
            })),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load bookings' });
    }
});
lawyerRouter.patch('/bookings/:id', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            res.status(400).json({ detail: 'Invalid status' });
            return;
        }
        const bookingId = req.params.id;
        const check = await query('SELECT lawyer_id, user_id, date, time FROM bookings WHERE id = $1', [bookingId]);
        const booking = check.rows[0];
        if (!booking) {
            res.status(404).json({ detail: 'Booking not found' });
            return;
        }
        if (booking.lawyer_id !== lawyerId) {
            res.status(403).json({ detail: 'Forbidden' });
            return;
        }
        await query('UPDATE bookings SET status = $1 WHERE id = $2', [status, bookingId]);
        if (booking.user_id) {
            const title = status === 'confirmed' ? 'Booking Confirmed' : 'Booking Cancelled';
            const msg = status === 'confirmed'
                ? `Your appointment on ${booking.date} at ${booking.time} has been confirmed by the advocate.`
                : `Your appointment on ${booking.date} at ${booking.time} has been cancelled.`;
            await query(`INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`, [booking.user_id, title, msg, status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled']);
        }
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to update booking status' });
    }
});
lawyerRouter.patch('/profile', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const body = req.body;
        const lawyer = { ...account.lawyer };
        const userPatch = {};
        if (typeof body.name === 'string') {
            const name = sanitizeText(body.name, 120);
            if (!name) {
                res.status(400).json({ detail: 'Invalid name' });
                return;
            }
            lawyer.name = name;
            userPatch.name = name;
        }
        if (typeof body.phone === 'string') {
            const phone = sanitizeText(body.phone, 20);
            lawyer.phone = phone;
            userPatch.phone = phone;
        }
        if (typeof body.email === 'string') {
            const email = normalizeEmail(body.email);
            if (!email) {
                res.status(400).json({ detail: 'Invalid email' });
                return;
            }
            lawyer.email = email;
            lawyer.emailVerified = false;
        }
        if (typeof body.bio === 'string')
            lawyer.bio = sanitizeText(body.bio, 4000);
        if (typeof body.firm === 'string')
            lawyer.firm = sanitizeText(body.firm, 255);
        if (typeof body.address === 'string')
            lawyer.address = sanitizeText(body.address, 512);
        if (typeof body.fee === 'number' && body.fee >= 0)
            lawyer.fee = Math.round(body.fee);
        if (typeof body.online === 'boolean')
            lawyer.online = body.online;
        if (typeof body.practice === 'string')
            lawyer.practice = sanitizeText(body.practice, 64);
        if (typeof body.citySlug === 'string') {
            const citySlug = sanitizeText(body.citySlug, 64);
            const city = account.cms.cities.find((c) => c.slug === citySlug);
            lawyer.citySlug = citySlug;
            if (city)
                lawyer.location = city.name;
        }
        if (Array.isArray(body.languages)) {
            lawyer.languages = body.languages
                .filter((v) => typeof v === 'string')
                .map((v) => sanitizeText(v, 32))
                .filter(Boolean)
                .slice(0, 12);
        }
        if (Array.isArray(body.specialization)) {
            lawyer.specialization = body.specialization
                .filter((v) => typeof v === 'string')
                .map((v) => sanitizeText(v, 64))
                .filter(Boolean)
                .slice(0, 12);
        }
        if (typeof body.image === 'string') {
            lawyer.image = sanitizeText(body.image, 512);
        }
        const cms = await loadCms();
        const idx = cms.lawyers.findIndex((l) => l.id === lawyer.id);
        if (idx < 0) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        cms.lawyers[idx] = lawyer;
        await saveCms(cms);
        if (userPatch.name || userPatch.phone !== undefined) {
            await query(`UPDATE platform_users SET name = COALESCE($2, name), phone = COALESCE($3, phone) WHERE id = $1`, [userId, userPatch.name ?? null, userPatch.phone ?? null]);
        }
        res.json({ success: true, lawyer: lawyerToJson(lawyer) });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to update profile' });
    }
});
lawyerRouter.post('/change-password', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;
        const pwd = newPassword ? validatePassword(newPassword) : null;
        if (!currentPassword || !pwd) {
            res.status(400).json({ detail: 'Valid current and new password required (min 6 characters)' });
            return;
        }
        const row = await query('SELECT password_hash FROM platform_users WHERE id = $1', [userId]);
        const user = row.rows[0];
        if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
            res.status(401).json({ detail: 'Current password is incorrect' });
            return;
        }
        await query('UPDATE platform_users SET password_hash = $2 WHERE id = $1', [
            userId,
            await hashPassword(pwd),
        ]);
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to change password' });
    }
});
function subscriptionStatus(expiresAt) {
    if (!expiresAt)
        return 'active';
    const exp = new Date(expiresAt).getTime();
    const now = Date.now();
    if (exp < now)
        return 'expired';
    if (exp - now < 7 * 24 * 60 * 60 * 1000)
        return 'expiring_soon';
    return 'active';
}
lawyerRouter.get('/subscription', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const lawyer = account.lawyer;
        const planId = lawyer.subscriptionPlanId ?? 'basic';
        const plan = account.cms.subscriptionPlans?.find((p) => p.id === planId);
        const expiresAt = lawyer.subscriptionExpiresAt ?? null;
        res.json({
            planId,
            plan: plan ?? null,
            expiresAt,
            status: subscriptionStatus(expiresAt),
            availablePlans: (account.cms.subscriptionPlans ?? []).filter((p) => p.active),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load subscription' });
    }
});
lawyerRouter.post('/subscription/renew', requireUser(['lawyer']), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        const { planId } = req.body;
        const plans = account.cms.subscriptionPlans ?? [];
        const lawyer = { ...account.lawyer };
        const currentPlanId = lawyer.subscriptionPlanId ?? 'basic';
        const targetPlanId = planId && plans.some((p) => p.id === planId) ? planId : currentPlanId;
        const targetPlan = plans.find((p) => p.id === targetPlanId);
        const currentExpires = lawyer.subscriptionExpiresAt
            ? new Date(lawyer.subscriptionExpiresAt).getTime()
            : 0;
        const base = Math.max(Date.now(), currentExpires);
        const nextExpires = new Date(base + 30 * 24 * 60 * 60 * 1000).toISOString();
        const updated = applyPlanFlagsToLawyer({ ...lawyer, subscriptionPlanId: targetPlanId, subscriptionExpiresAt: nextExpires }, targetPlan?.features);
        const cms = await loadCms();
        const idx = cms.lawyers.findIndex((l) => l.id === updated.id);
        if (idx < 0) {
            res.status(404).json({ detail: 'Lawyer profile not found' });
            return;
        }
        cms.lawyers[idx] = updated;
        await saveCms(cms);
        res.json({
            success: true,
            planId: targetPlanId,
            expiresAt: nextExpires,
            status: subscriptionStatus(nextExpires),
            message: 'Subscription renewed for 30 days. Payment integration can be connected in admin settings.',
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to renew subscription' });
    }
});
/* ─── Lawyer Messaging Routes ─── */
lawyerRouter.get('/conversations', requireUser(), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(403).json({ detail: 'Lawyer account not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const r = await query(`SELECT id, user_id, last_message, last_message_at, created_at
       FROM conversations WHERE lawyer_id = $1
       ORDER BY COALESCE(last_message_at, created_at) DESC`, [lawyerId]);
        const userIds = [...new Set(r.rows.map((row) => row.user_id))];
        const usersRes = await query('SELECT id, name, email FROM platform_users WHERE id = ANY($1)', [userIds]);
        const userMap = new Map(usersRes.rows.map((u) => [u.id, u]));
        const unreadRes = await query(`SELECT m.conversation_id AS conv_id, COUNT(*)::text AS count
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.lawyer_id = $1 AND m.sender_type = 'user' AND m.is_read = FALSE
       GROUP BY m.conversation_id`, [lawyerId]);
        const unreadMap = new Map();
        for (const row of unreadRes.rows) {
            unreadMap.set(Number(row.conv_id), parseInt(row.count, 10));
        }
        const conversations = r.rows.map((row) => {
            const u = userMap.get(row.user_id);
            return {
                id: row.id,
                userId: row.user_id,
                userName: u?.name ?? 'Unknown User',
                userEmail: u?.email ?? '',
                lastMessage: row.last_message,
                lastMessageAt: row.last_message_at ?? row.created_at,
                unreadCount: unreadMap.get(row.id) ?? 0,
            };
        });
        res.json({ conversations });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load conversations' });
    }
});
lawyerRouter.get('/conversations/:id/messages', requireUser(), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(403).json({ detail: 'Lawyer account not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const convId = Number(req.params.id);
        if (!convId) {
            res.status(400).json({ detail: 'Invalid conversation ID' });
            return;
        }
        const conv = await query('SELECT id FROM conversations WHERE id = $1 AND lawyer_id = $2', [convId, lawyerId]);
        if (conv.rows.length === 0) {
            res.status(404).json({ detail: 'Conversation not found' });
            return;
        }
        const r = await query('SELECT id, sender_id, sender_type, text, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [convId]);
        res.json({
            messages: r.rows.map((row) => ({
                id: row.id,
                senderId: row.sender_id,
                senderType: row.sender_type,
                text: row.text,
                createdAt: row.created_at,
                isRead: true,
            })),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to load messages' });
    }
});
lawyerRouter.post('/conversations/:id/messages', requireUser(), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(403).json({ detail: 'Lawyer account not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const convId = Number(req.params.id);
        const { text } = req.body;
        if (!convId) {
            res.status(400).json({ detail: 'Invalid conversation ID' });
            return;
        }
        if (!text || !text.trim()) {
            res.status(400).json({ detail: 'Message text required' });
            return;
        }
        const conv = await query('SELECT id, user_id FROM conversations WHERE id = $1 AND lawyer_id = $2', [convId, lawyerId]);
        if (conv.rows.length === 0) {
            res.status(404).json({ detail: 'Conversation not found' });
            return;
        }
        const convUserId = conv.rows[0].user_id;
        const msg = await query(`INSERT INTO messages (conversation_id, sender_id, sender_type, text)
       VALUES ($1, $2, 'lawyer', $3) RETURNING id, created_at`, [convId, userId, text.trim()]);
        await query('UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2', [text.trim(), convId]);
        try {
            await query('UPDATE conversations SET user_unread_count = user_unread_count + 1 WHERE id = $1', [convId]);
        }
        catch { }
        res.json({
            success: true,
            message: {
                id: msg.rows[0].id,
                senderId: userId,
                senderType: 'lawyer',
                text: text.trim(),
                createdAt: msg.rows[0].created_at,
                isRead: false,
            },
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to send message' });
    }
});
lawyerRouter.post('/conversations/:id/read', requireUser(), async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await resolveLawyerAccount(userId);
        if (!account) {
            res.status(403).json({ detail: 'Lawyer account not found' });
            return;
        }
        const lawyerId = account.lawyer.id;
        const convId = Number(req.params.id);
        if (!convId) {
            res.status(400).json({ detail: 'Invalid conversation ID' });
            return;
        }
        const conv = await query('SELECT id FROM conversations WHERE id = $1 AND lawyer_id = $2', [convId, lawyerId]);
        if (conv.rows.length === 0) {
            res.status(404).json({ detail: 'Conversation not found' });
            return;
        }
        try {
            await query(`UPDATE messages SET is_read = TRUE, is_read_at = NOW() WHERE conversation_id = $1 AND sender_type = 'user' AND is_read = FALSE`, [convId]);
        }
        catch { }
        try {
            await query('UPDATE conversations SET user_unread_count = 0 WHERE id = $1', [convId]);
        }
        catch { }
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to mark messages as read' });
    }
});
