import { Router } from 'express';
import { loadCms, saveCms } from '../cms.js';
import { monthlyBookingLimit } from '../subscription-features.js';
import { normalizeEmail, sanitizeText } from '../security/validate.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const bookingsRouter = Router();

bookingsRouter.post('/', async (req, res) => {
  try {
    const body = req.body as {
      lawyerId?: string;
      lawyerName?: string;
      clientName?: string;
      clientEmail?: string;
      date?: string;
      time?: string;
      type?: string;
    };
    const clientEmail = body.clientEmail ? normalizeEmail(body.clientEmail) : null;
    const clientName = body.clientName ? sanitizeText(body.clientName, 120) : '';
    const lawyerId = body.lawyerId ? sanitizeText(body.lawyerId, 128) : '';
    const date = body.date ?? '';
    const time = body.time ? sanitizeText(body.time, 32) : '';

    if (!lawyerId || !clientName || !clientEmail || !DATE_RE.test(date) || !time) {
      res.status(400).json({ detail: 'Invalid booking fields' });
      return;
    }

    const cms = await loadCms();
    const lawyer = cms.lawyers.find((l) => l.id === lawyerId || l.slug === lawyerId);
    if (!lawyer) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const planId = (lawyer as { subscriptionPlanId?: string }).subscriptionPlanId ?? 'basic';
    const plan = cms.subscriptionPlans?.find((p) => p.id === planId);
    const limit = monthlyBookingLimit(plan?.features);
    if (limit !== null) {
      const now = new Date();
      const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
      const count = cms.bookings.filter(
        (b) =>
          b.lawyerId === lawyer.id &&
          b.date.startsWith(monthKey) &&
          b.status !== 'cancelled',
      ).length;
      if (count >= limit) {
        res.status(403).json({
          detail: `This lawyer has reached the monthly booking limit (${limit}) for their subscription plan.`,
        });
        return;
      }
    }

    const booking = {
      id: `b-${Date.now()}`,
      lawyerId: lawyer.id,
      lawyerName: sanitizeText(body.lawyerName ?? lawyer.name, 120),
      clientName,
      clientEmail,
      date,
      time,
      type: body.type ? sanitizeText(body.type, 64) : 'Video Call',
      status: 'pending' as const,
    };
    cms.bookings.push(booking);
    await saveCms(cms);
    res.json({ success: true, booking: { id: booking.id, status: booking.status } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Booking failed' });
  }
});
