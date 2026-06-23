import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';

export const sectionsRouter = Router();

function isMissingTable(e: unknown): boolean {
  return (e as { code?: string }).code === '42P01';
}

/* ─── Public ────────────────────────────────────────── */

sectionsRouter.get('/sections', async (_req, res) => {
  try {
    const type = _req.query.type as string;
    if (!type || !['ipc', 'bns'].includes(type)) {
      res.status(400).json({ detail: 'Query param ?type=ipc|bns is required' });
      return;
    }
    const result = await query(
      `SELECT id, type, section_number, title, slug, body, punishment,
              category, status, display_order, created_at
       FROM sections
       WHERE type = $1 AND status = 'active'
       ORDER BY display_order ASC, id ASC`,
      [type],
    );
    res.json(result.rows.map(rowToJson));
  } catch (e) {
    if (isMissingTable(e)) { res.json([]); return; }
    console.error(e);
    res.status(500).json({ detail: 'Failed to load sections' });
  }
});

sectionsRouter.get('/sections/:slug', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, type, section_number, title, slug, body, punishment,
              category, status, display_order, created_at
       FROM sections
       WHERE slug = $1 AND status = 'active'`,
      [req.params.slug],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Section not found' });
      return;
    }
    res.json(rowToJson(result.rows[0]));
  } catch (e) {
    if (isMissingTable(e)) { res.status(404).json({ detail: 'Section not found' }); return; }
    console.error(e);
    res.status(500).json({ detail: 'Failed to load section' });
  }
});

/* ─── Admin ──────────────────────────────────────────── */

sectionsRouter.get('/admin/sections', requireAdmin, async (req, res) => {
  try {
    const type = req.query.type as string;
    if (!type || !['ipc', 'bns'].includes(type)) {
      res.status(400).json({ detail: 'Query param ?type=ipc|bns is required' });
      return;
    }
    const result = await query(
      `SELECT id, type, section_number, title, slug, body, punishment,
              category, status, display_order, created_at, updated_at
       FROM sections
       WHERE type = $1
       ORDER BY display_order ASC, id ASC`,
      [type],
    );
    res.json(result.rows.map(rowToJson));
  } catch (e) {
    if (isMissingTable(e)) { res.json([]); return; }
    console.error(e);
    res.status(500).json({ detail: 'Failed to load sections' });
  }
});

sectionsRouter.get('/admin/sections/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, type, section_number, title, slug, body, punishment,
              category, status, display_order, created_at, updated_at
       FROM sections WHERE id = $1`,
      [Number(req.params.id)],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Section not found' });
      return;
    }
    res.json(rowToJson(result.rows[0]));
  } catch (e) {
    if (isMissingTable(e)) { res.status(404).json({ detail: 'Section not found' }); return; }
    console.error(e);
    res.status(500).json({ detail: 'Failed to load section' });
  }
});

sectionsRouter.post('/admin/sections', requireAdmin, async (req, res) => {
  try {
    const { type, section_number, title, slug, body, punishment, category, status, display_order } = req.body as {
      type: string;
      section_number?: string;
      title: string;
      slug?: string;
      body?: string;
      punishment?: string;
      category?: string;
      status?: string;
      display_order?: number;
    };

    if (!type || !['ipc', 'bns'].includes(type)) {
      res.status(400).json({ detail: 'Field "type" must be "ipc" or "bns"' });
      return;
    }
    if (!title) {
      res.status(400).json({ detail: 'Field "title" is required' });
      return;
    }

    const finalSlug = slug ?? slugify(title, type);

    const result = await query(
      `INSERT INTO sections (type, section_number, title, slug, body, punishment, category, status, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, type, section_number, title, slug, body, punishment,
                 category, status, display_order, created_at, updated_at`,
      [
        type,
        section_number ?? '',
        title,
        finalSlug,
        body ?? '',
        punishment ?? '',
        category ?? '',
        status ?? 'active',
        display_order ?? 0,
      ],
    );
    res.status(201).json(rowToJson(result.rows[0]));
  } catch (e: unknown) {
    const err = e as { code?: string; constraint?: string; detail?: string };
    if (err.code === '23505') {
      res.status(409).json({ detail: 'A section with this slug already exists' });
      return;
    }
    if (isMissingTable(e)) {
      res.status(500).json({ detail: 'Sections table not yet created. Run: npm run db:migrate:sections' });
      return;
    }
    console.error(e);
    res.status(500).json({ detail: 'Failed to create section' });
  }
});

sectionsRouter.put('/admin/sections/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { section_number, title, slug, body, punishment, category, status, display_order } = req.body as {
      section_number?: string;
      title?: string;
      slug?: string;
      body?: string;
      punishment?: string;
      category?: string;
      status?: string;
      display_order?: number;
    };

    const existing = await query('SELECT slug FROM sections WHERE id = $1', [Number(req.params.id)]);
    if (existing.rows.length === 0) {
      res.status(404).json({ detail: 'Section not found' });
      return;
    }

    const result = await query(
      `UPDATE sections SET
        section_number = COALESCE($2, section_number),
        title = COALESCE($3, title),
        slug = COALESCE($4, slug),
        body = COALESCE($5, body),
        punishment = COALESCE($6, punishment),
        category = COALESCE($7, category),
        status = COALESCE($8, status),
        display_order = COALESCE($9, display_order),
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, type, section_number, title, slug, body, punishment,
                 category, status, display_order, created_at, updated_at`,
      [
        Number(req.params.id),
        section_number ?? null,
        title ?? null,
        slug ?? null,
        body ?? null,
        punishment ?? null,
        category ?? null,
        status ?? null,
        display_order ?? null,
      ],
    );
    res.json(rowToJson(result.rows[0]));
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === '23505') {
      res.status(409).json({ detail: 'A section with this slug already exists' });
      return;
    }
    if (isMissingTable(e)) {
      res.status(500).json({ detail: 'Sections table not yet created. Run: npm run db:migrate:sections' });
      return;
    }
    console.error(e);
    res.status(500).json({ detail: 'Failed to update section' });
  }
});

sectionsRouter.delete('/admin/sections/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `UPDATE sections SET status = 'inactive', updated_at = NOW()
       WHERE id = $1 AND status = 'active'
       RETURNING id, type, section_number, title, slug`,
      [Number(req.params.id)],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ detail: 'Section not found or already inactive' });
      return;
    }
    res.json({ success: true, deleted: rowToJson(result.rows[0]) });
  } catch (e) {
    if (isMissingTable(e)) {
      res.status(500).json({ detail: 'Sections table not yet created. Run: npm run db:migrate:sections' });
      return;
    }
    console.error(e);
    res.status(500).json({ detail: 'Failed to delete section' });
  }
});

/* ─── Helpers ─────────────────────────────────────────── */

function rowToJson(row: Record<string, unknown>) {
  return {
    id: row.id as number,
    type: row.type as string,
    sectionNumber: row.section_number as string,
    title: row.title as string,
    slug: row.slug as string,
    body: (row.body as string) ?? '',
    punishment: (row.punishment as string) ?? '',
    category: (row.category as string) ?? '',
    status: (row.status as string) ?? 'active',
    displayOrder: (row.display_order as number) ?? 0,
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}

function slugify(title: string, prefix: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base.startsWith(prefix) ? base : `${prefix}-${base}`.slice(0, 80);
}
