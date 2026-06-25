import { Router, type Request } from 'express';
import { loadCms, saveCms } from '../cms.js';
import {
  findUserById,
  hashPassword,
  requireUser,
  verifyPassword,
} from '../platform-auth.js';
import { query } from '../db.js';
import { normalizeEmail, sanitizeText, validatePassword } from '../security/validate.js';
import { applyPlanFlagsToLawyer } from '../subscription-features.js';
import type { SubscriptionPlan } from '../types.js';
import { lawyerContentRouter } from './lawyer-content.js';

export const lawyerRouter = Router();
lawyerRouter.use(lawyerContentRouter);

type AuthedRequest = Request & { user: { userId: string; role: string } };

async function resolveLawyerAccount(userId: string) {
  const user = await findUserById(userId);
  if (!user || user.role !== 'lawyer' || !user.lawyer_id) return null;

  const cms = await loadCms();
  const lawyer = cms.lawyers.find((l) => l.id === user.lawyer_id);
  if (!lawyer) return null;

  return { user, lawyer, cms };
}

function lawyerToJson(lawyer: Record<string, unknown>) {
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
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer profile not found' });
      return;
    }
    res.json({ lawyer: lawyerToJson(account.lawyer as Record<string, unknown>), user: {
      id: account.user.id,
      name: account.user.name,
      email: account.user.email,
    }});
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load profile' });
  }
});

lawyerRouter.patch('/profile', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer profile not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const lawyer = { ...account.lawyer } as Record<string, unknown>;
    const userPatch: { name?: string; phone?: string | null } = {};

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
    if (typeof body.bio === 'string') lawyer.bio = sanitizeText(body.bio, 4000);
    if (typeof body.firm === 'string') lawyer.firm = sanitizeText(body.firm, 255);
    if (typeof body.address === 'string') lawyer.address = sanitizeText(body.address, 512);
    if (typeof body.fee === 'number' && body.fee >= 0) lawyer.fee = Math.round(body.fee);
    if (typeof body.online === 'boolean') lawyer.online = body.online;
    if (typeof body.practice === 'string') lawyer.practice = sanitizeText(body.practice, 64);
    if (typeof body.citySlug === 'string') {
      const citySlug = sanitizeText(body.citySlug, 64);
      const city = account.cms.cities.find((c) => c.slug === citySlug);
      lawyer.citySlug = citySlug;
      if (city) lawyer.location = city.name;
    }
    if (Array.isArray(body.languages)) {
      lawyer.languages = body.languages
        .filter((v): v is string => typeof v === 'string')
        .map((v) => sanitizeText(v, 32))
        .filter(Boolean)
        .slice(0, 12);
    }
    if (Array.isArray(body.specialization)) {
      lawyer.specialization = body.specialization
        .filter((v): v is string => typeof v === 'string')
        .map((v) => sanitizeText(v, 64))
        .filter(Boolean)
        .slice(0, 12);
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
      await query(
        `UPDATE platform_users SET name = COALESCE($2, name), phone = COALESCE($3, phone) WHERE id = $1`,
        [userId, userPatch.name ?? null, userPatch.phone ?? null],
      );
    }

    res.json({ success: true, lawyer: lawyerToJson(lawyer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to update profile' });
  }
});

lawyerRouter.post('/change-password', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    const pwd = newPassword ? validatePassword(newPassword) : null;
    if (!currentPassword || !pwd) {
      res.status(400).json({ detail: 'Valid current and new password required (min 6 characters)' });
      return;
    }

    const row = await query<{ password_hash: string }>(
      'SELECT password_hash FROM platform_users WHERE id = $1',
      [userId],
    );
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to change password' });
  }
});

function subscriptionStatus(expiresAt: string | null | undefined): 'active' | 'expiring_soon' | 'expired' {
  if (!expiresAt) return 'active';
  const exp = new Date(expiresAt).getTime();
  const now = Date.now();
  if (exp < now) return 'expired';
  if (exp - now < 7 * 24 * 60 * 60 * 1000) return 'expiring_soon';
  return 'active';
}

lawyerRouter.get('/subscription', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer profile not found' });
      return;
    }

    const lawyer = account.lawyer as Record<string, unknown>;
    const planId = (lawyer.subscriptionPlanId as string) ?? 'basic';
    const plan = account.cms.subscriptionPlans?.find((p) => p.id === planId) as SubscriptionPlan | undefined;
    const expiresAt = (lawyer.subscriptionExpiresAt as string | null) ?? null;

    res.json({
      planId,
      plan: plan ?? null,
      expiresAt,
      status: subscriptionStatus(expiresAt),
      availablePlans: (account.cms.subscriptionPlans ?? []).filter((p) => p.active),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load subscription' });
  }
});

lawyerRouter.post('/subscription/renew', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer profile not found' });
      return;
    }

    const { planId } = req.body as { planId?: string };
    const plans = account.cms.subscriptionPlans ?? [];
    const lawyer = { ...account.lawyer } as Record<string, unknown>;
    const currentPlanId = (lawyer.subscriptionPlanId as string) ?? 'basic';
    const targetPlanId = planId && plans.some((p) => p.id === planId) ? planId : currentPlanId;
    const targetPlan = plans.find((p) => p.id === targetPlanId);

    const currentExpires = lawyer.subscriptionExpiresAt
      ? new Date(lawyer.subscriptionExpiresAt as string).getTime()
      : 0;
    const base = Math.max(Date.now(), currentExpires);
    const nextExpires = new Date(base + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = applyPlanFlagsToLawyer(
      { ...lawyer, subscriptionPlanId: targetPlanId, subscriptionExpiresAt: nextExpires },
      targetPlan?.features,
    );

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
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to renew subscription' });
  }
});

/* ─── Lawyer Messaging Routes ─── */

lawyerRouter.get('/conversations', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) { res.status(403).json({ detail: 'Lawyer account not found' }); return; }
    const lawyerId = account.lawyer.id;

    const r = await query<{
      id: number; user_id: string; last_message: string | null;
      last_message_at: string | null; created_at: string;
    }>(
      `SELECT id, user_id, last_message, last_message_at, created_at
       FROM conversations WHERE lawyer_id = $1
       ORDER BY COALESCE(last_message_at, created_at) DESC`,
      [lawyerId],
    );

    const userIds = [...new Set(r.rows.map((row) => row.user_id))];
    const usersRes = await query<{ id: string; name: string; email: string }>(
      'SELECT id, name, email FROM platform_users WHERE id = ANY($1)',
      [userIds],
    );
    const userMap = new Map(usersRes.rows.map((u) => [u.id, u]));

    const conversations = r.rows.map((row) => {
      const u = userMap.get(row.user_id);
      return {
        id: row.id,
        userId: row.user_id,
        userName: u?.name ?? 'Unknown User',
        userEmail: u?.email ?? '',
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at ?? row.created_at,
        unreadCount: 0,
      };
    });
    res.json({ conversations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load conversations' });
  }
});

lawyerRouter.get('/conversations/:id/messages', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) { res.status(403).json({ detail: 'Lawyer account not found' }); return; }
    const lawyerId = account.lawyer.id;
    const convId = Number(req.params.id);
    if (!convId) { res.status(400).json({ detail: 'Invalid conversation ID' }); return; }

    const conv = await query(
      'SELECT id FROM conversations WHERE id = $1 AND lawyer_id = $2',
      [convId, lawyerId],
    );
    if (conv.rows.length === 0) { res.status(404).json({ detail: 'Conversation not found' }); return; }

    const r = await query<{
      id: number; sender_id: string; sender_type: string;
      text: string; created_at: string;
    }>(
      'SELECT id, sender_id, sender_type, text, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [convId],
    );
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load messages' });
  }
});

lawyerRouter.post('/conversations/:id/messages', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) { res.status(403).json({ detail: 'Lawyer account not found' }); return; }
    const lawyerId = account.lawyer.id;
    const convId = Number(req.params.id);
    const { text } = req.body as { text?: string };
    if (!convId) { res.status(400).json({ detail: 'Invalid conversation ID' }); return; }
    if (!text || !text.trim()) { res.status(400).json({ detail: 'Message text required' }); return; }

    const conv = await query(
      'SELECT id, user_id FROM conversations WHERE id = $1 AND lawyer_id = $2',
      [convId, lawyerId],
    );
    if (conv.rows.length === 0) { res.status(404).json({ detail: 'Conversation not found' }); return; }
    const convUserId = conv.rows[0].user_id;

    const msg = await query<{ id: number; created_at: string }>(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, text)
       VALUES ($1, $2, 'lawyer', $3) RETURNING id, created_at`,
      [convId, userId, text.trim()],
    );
    await query(
      'UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2',
      [text.trim(), convId],
    );
    try { await query('UPDATE conversations SET user_unread_count = user_unread_count + 1 WHERE id = $1', [convId]); } catch {}

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
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to send message' });
  }
});

lawyerRouter.post('/conversations/:id/read', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) { res.status(403).json({ detail: 'Lawyer account not found' }); return; }
    const lawyerId = account.lawyer.id;
    const convId = Number(req.params.id);
    if (!convId) { res.status(400).json({ detail: 'Invalid conversation ID' }); return; }

    const conv = await query(
      'SELECT id FROM conversations WHERE id = $1 AND lawyer_id = $2',
      [convId, lawyerId],
    );
    if (conv.rows.length === 0) { res.status(404).json({ detail: 'Conversation not found' }); return; }

    try { await query(`UPDATE messages SET is_read = TRUE, is_read_at = NOW() WHERE conversation_id = $1 AND sender_type = 'user' AND is_read = FALSE`, [convId]); } catch {}
    try { await query('UPDATE conversations SET user_unread_count = 0 WHERE id = $1', [convId]); } catch {}
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to mark messages as read' });
  }
});
