import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { pool, query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { normalizeEmail, sanitizeText, safeIdPart } from '../security/validate.js';
import { slugifyName } from '../lawyer-slug.js';
import { hashPassword } from '../platform-auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const pendingLawyersRouter = Router();

pendingLawyersRouter.use(requireAdmin);

const REQUIRED_COLUMNS = ['name'];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function findColumn(mapped: Record<string, string | null>, ...candidates: string[]): string | null {
  for (const c of candidates) {
    if (mapped[c] && mapped[c]!.length > 0) return mapped[c];
  }
  return null;
}

function mapRow(raw: Record<string, string | number | null>) {
  const mapped: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(raw)) {
    const nk = normalizeHeader(k);
    mapped[nk] = v != null ? String(v).trim() : null;
  }
  return {
    enrollmentNo: findColumn(mapped, 'enrollment_number', 'enrollment_no', 'enrollmentnumber', 'enrollment', 'roll_no', 'rollno', 'roll_no_'),
    name: findColumn(mapped, 'name', 'advocate_name', 'lawyer_name', 'full_name'),
    fatherName: findColumn(mapped, 'father_name', 'fathername', 'father_s_name'),
    mobile: findColumn(mapped, 'contact', 'mobile', 'phone', 'contact_no', 'mobile_no', 'mob_no', 'contact_number'),
    email: findColumn(mapped, 'email', 'email_id', 'e_mail'),
    gender: findColumn(mapped, 'gender', 'sex'),
    district: findColumn(mapped, 'practice_place', 'district', 'dist', 'city', 'place'),
    state: findColumn(mapped, 'state', 'state_name', 'state_'),
    barCouncil: findColumn(mapped, 'bar_council', 'barcouncil', 'bar_council_name', 'state_bar_council', 'bar'),
    practiceAreas: findColumn(mapped, 'practice_areas', 'practicearea', 'specialization', 'area_of_practice', 'fields_of_practice'),
    slNo: findColumn(mapped, 'sl_no', 'sl_no_', 'slno', 'serial_no', 's_no'),
    dateOfEnrolment: findColumn(mapped, 'date_of_enrolment', 'date_of_enrollment', 'enrolment_date', 'enrollment_date'),
  };
}

function validateRow(row: ReturnType<typeof mapRow>): string | null {
  if (!row.name || row.name.length < 2) return 'Invalid name';
  return null;
}

pendingLawyersRouter.get('/stats', async (_req, res) => {
  try {
    const r = await query(
      `SELECT status, count(*)::int as count FROM lawyer_pending GROUP BY status`
    );
    const stats: Record<string, number> = { pending: 0, verified: 0, rejected: 0 };
    for (const row of r.rows) stats[row.status as string] = row.count;
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load stats' });
  }
});

pendingLawyersRouter.get('/districts', async (_req, res) => {
  try {
    const r = await query(
      `SELECT DISTINCT district FROM lawyer_pending WHERE district IS NOT NULL AND district != '' ORDER BY district`
    );
    res.json(r.rows.map((r) => r.district));
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load districts' });
  }
});

pendingLawyersRouter.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const district = (req.query.district as string) || '';
    const batchId = (req.query.batchId as string) || '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR enrollment_no ILIKE $${idx} OR email ILIKE $${idx} OR mobile ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (district) {
      conditions.push(`district ILIKE $${idx}`);
      params.push(`%${district}%`);
      idx++;
    }
    if (batchId) {
      conditions.push(`import_batch_id = $${idx}`);
      params.push(batchId);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT count(*)::int as total FROM lawyer_pending ${where}`, params);
    const total = countResult.rows[0].total;

    const rows = await query(
      `SELECT id, enrollment_no, name, father_name, mobile, email, gender, district, state, bar_council, practice_areas, status, rejection_reason, verified_by, verified_at, rejected_by, rejected_at, import_batch_id, created_at, updated_at
       FROM lawyer_pending ${where}
       ORDER BY created_at DESC, sort_order ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({ rows: rows.rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load pending lawyers' });
  }
});

pendingLawyersRouter.get('/:id', async (req, res) => {
  try {
    const r = await query('SELECT * FROM lawyer_pending WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ detail: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load record' });
  }
});

pendingLawyersRouter.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return res.status(400).json({ detail: 'Only .xlsx, .xls, and .csv files are accepted' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ detail: 'Excel file is empty' });

    const rows = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(workbook.Sheets[sheetName]);
    if (rows.length === 0) return res.status(400).json({ detail: 'No data rows found' });

    const batchId = `batch-${Date.now()}-${randomUUID().slice(0, 8)}`;
    let imported = 0;
    let skipped = 0;
    let invalid = 0;
    let duplicates = 0;
    const errors: string[] = [];

    const existingEmails = new Set<string>();
    const existingMobiles = new Set<string>();
    const existingEnrollments = new Set<string>();

    const emailRes = await query("SELECT email FROM lawyer_pending WHERE email IS NOT NULL AND email != ''");
    for (const r of emailRes.rows) existingEmails.add((r.email as string).toLowerCase());
    const mobileRes = await query("SELECT mobile FROM lawyer_pending WHERE mobile IS NOT NULL AND mobile != ''");
    for (const r of mobileRes.rows) existingMobiles.add((r.mobile as string).toLowerCase());
    const enrollRes = await query("SELECT enrollment_no FROM lawyer_pending WHERE enrollment_no IS NOT NULL AND enrollment_no != ''");
    for (const r of enrollRes.rows) existingEnrollments.add((r.enrollment_no as string).toLowerCase());

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const mapped = mapRow(raw as Record<string, string | number | null>);

      if (!mapped.name || mapped.name.length < 2) {
        invalid++;
        continue;
      }

      if (mapped.email && existingEmails.has(mapped.email.toLowerCase())) {
        duplicates++;
        continue;
      }
      if (mapped.mobile && existingMobiles.has(mapped.mobile.toLowerCase())) {
        duplicates++;
        continue;
      }
      if (mapped.enrollmentNo && existingEnrollments.has(mapped.enrollmentNo.toLowerCase())) {
        duplicates++;
        continue;
      }

      if (mapped.email) existingEmails.add(mapped.email.toLowerCase());
      if (mapped.mobile) existingMobiles.add(mapped.mobile.toLowerCase());
      if (mapped.enrollmentNo) existingEnrollments.add(mapped.enrollmentNo.toLowerCase());

      try {
        await query(
          `INSERT INTO lawyer_pending (enrollment_no, name, father_name, mobile, email, gender, district, state, bar_council, practice_areas, import_batch_id, raw_data, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            mapped.enrollmentNo,
            sanitizeText(mapped.name, 255),
            mapped.fatherName ? sanitizeText(mapped.fatherName, 255) : null,
            mapped.mobile ? sanitizeText(mapped.mobile, 32) : null,
            mapped.email ? normalizeEmail(mapped.email) : null,
            mapped.gender ? sanitizeText(mapped.gender, 16) : null,
            mapped.district ? sanitizeText(mapped.district, 128) : null,
            mapped.state ? sanitizeText(mapped.state, 128) : null,
            mapped.barCouncil ? sanitizeText(mapped.barCouncil, 255) : null,
            mapped.practiceAreas ? sanitizeText(mapped.practiceAreas, 1000) : null,
            batchId,
            JSON.stringify(raw),
            i,
          ]
        );
        imported++;
      } catch {
        invalid++;
      }
    }

    res.json({ imported, duplicates, invalid, skipped, batchId, totalRows: rows.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Import failed' });
  }
});

pendingLawyersRouter.post('/:id/verify', async (req, res) => {
  try {
    const r = await query('SELECT * FROM lawyer_pending WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ detail: 'Not found' });

    const pending = r.rows[0];
    if (pending.status === 'verified') return res.status(400).json({ detail: 'Already verified' });

    const lawyerId = `lawyer-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const slug = slugifyName(pending.name as string);

    const practiceList = pending.practice_areas
      ? (pending.practice_areas as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO lawyers (
          id, slug, name, image, rating, reviews, experience, fee, currency, location, address,
          practice, city_slug, email, email_verified, phone, phone_verified, firm, bio, online, verified,
          specialization, languages, education, timeline, practice_groups, courts, awards, client_reviews,
          profile_faq, subscription_plan_id, subscription_expires_at, featured, top_rated, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)`,
        [
          lawyerId,
          slug,
          pending.name,
          '/uploads/lawyers/default.jpg',
          0,
          0,
          0,
          null,
          null,
          [pending.district, pending.state].filter(Boolean).join(', ') || 'India',
          null,
          practiceList[0] || 'general',
          null,
          pending.email ?? null,
          false,
          pending.mobile ?? null,
          false,
          null,
          null,
          true,
          true,
          JSON.stringify(practiceList),
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          'basic',
          null,
          false,
          false,
          new Date(),
        ]
      );

      const tempPassword = `Law${Date.now().toString(36)}`;
      const passwordHash = await hashPassword(tempPassword);
      const userId = `user-${Date.now()}-${randomUUID().slice(0, 8)}`;

      await client.query(
        `INSERT INTO platform_users (id, email, password_hash, name, role, lawyer_id, phone, status)
         VALUES ($1, $2, $3, $4, 'lawyer', $5, $6, 'active')`,
        [userId, pending.email || `${lawyerId}@lawyerspot.com`, passwordHash, pending.name, lawyerId, pending.mobile ?? null]
      );

      await client.query(
        `UPDATE lawyer_pending SET status = 'verified', verified_by = $1, verified_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [req.cookies?.lawyerspot_admin_session ? 'admin' : 'admin', req.params.id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        lawyerId,
        userId,
        tempPassword,
        message: 'Lawyer verified and added to main database',
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Verification failed' });
  }
});

pendingLawyersRouter.post('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body as { reason?: string };
    if (!reason || reason.trim().length < 2) {
      return res.status(400).json({ detail: 'Rejection reason is required' });
    }

    const r = await query('SELECT status FROM lawyer_pending WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ detail: 'Not found' });
    if (r.rows[0].status === 'rejected') return res.status(400).json({ detail: 'Already rejected' });

    await query(
      `UPDATE lawyer_pending SET status = 'rejected', rejection_reason = $1, rejected_by = $2, rejected_at = NOW(), updated_at = NOW() WHERE id = $3`,
      [sanitizeText(reason, 1000), 'admin', req.params.id]
    );

    res.json({ success: true, message: 'Lawyer rejected' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Rejection failed' });
  }
});

pendingLawyersRouter.delete('/:id', async (req, res) => {
  try {
    const r = await query('DELETE FROM lawyer_pending WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ detail: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Delete failed' });
  }
});

pendingLawyersRouter.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body as { ids?: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ detail: 'No IDs provided' });
    }
    const r = await query('DELETE FROM lawyer_pending WHERE id = ANY($1)', [ids]);
    res.json({ success: true, deleted: r.rowCount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Bulk delete failed' });
  }
});
