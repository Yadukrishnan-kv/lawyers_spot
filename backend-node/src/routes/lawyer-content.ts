import { Router, type Request } from 'express';
import { loadCms } from '../cms.js';
import { estimateReadTime, slugifyTitle } from '../content-slug.js';
import { findUserById, requireUser } from '../platform-auth.js';
import { query } from '../db.js';
import { sanitizeText } from '../security/validate.js';

export const lawyerContentRouter = Router();

type AuthedRequest = Request & { user: { userId: string; role: string } };

async function resolveLawyerAccount(userId: string) {
  const user = await findUserById(userId);
  if (!user || user.role !== 'lawyer' || !user.lawyer_id) return null;
  const cms = await loadCms();
  const lawyer = cms.lawyers.find((l) => l.id === user.lawyer_id);
  if (!lawyer) return null;
  return { user, lawyer, cms };
}

function articleRowToJson(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    trending: Boolean(row.trending),
    status: row.status ?? 'published',
    content: row.content ?? undefined,
    lawyerId: row.lawyer_id ?? undefined,
  };
}

function answerRowToJson(row: Record<string, unknown>) {
  return {
    id: row.id,
    qaPostId: row.qa_post_id,
    lawyerId: row.lawyer_id,
    lawyerName: row.lawyer_name,
    body: row.body,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}

async function syncQaAnswerCount(qaPostId: string) {
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM qa_answers WHERE qa_post_id = $1 AND status = 'published'`,
    [qaPostId],
  );
  const count = Number(countRes.rows[0]?.count ?? 0);
  await query('UPDATE qa_posts SET answers = $2 WHERE id = $1', [qaPostId, count]);
  await query('UPDATE site_config SET updated_at = NOW() WHERE id = 1');
}

async function touchCmsTimestamp() {
  await query('UPDATE site_config SET updated_at = NOW() WHERE id = 1');
}

lawyerContentRouter.get('/articles', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }
    const rows = await query(
      `SELECT slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id
       FROM articles WHERE lawyer_id = $1 ORDER BY date DESC`,
      [account.user.lawyer_id],
    );
    res.json({ articles: rows.rows.map((r) => articleRowToJson(r as Record<string, unknown>)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load articles' });
  }
});

lawyerContentRouter.get('/articles/:slug', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }
    const row = await query(
      `SELECT slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id
       FROM articles WHERE slug = $1 AND lawyer_id = $2`,
      [req.params.slug, account.user.lawyer_id],
    );
    if (!row.rows[0]) {
      res.status(404).json({ detail: 'Article not found' });
      return;
    }
    res.json({ article: articleRowToJson(row.rows[0] as Record<string, unknown>) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load article' });
  }
});

lawyerContentRouter.post('/articles', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === 'string' ? sanitizeText(body.title, 512) : '';
    const excerpt = typeof body.excerpt === 'string' ? sanitizeText(body.excerpt, 2000) : '';
    const category = typeof body.category === 'string' ? sanitizeText(body.category, 128) : '';
    const content = typeof body.content === 'string' ? sanitizeText(body.content, 50000) : '';
    if (!title || !excerpt || !category) {
      res.status(400).json({ detail: 'Title, excerpt, and category are required' });
      return;
    }

    let slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? sanitizeText(body.slug, 255).replace(/[^a-z0-9-]/gi, '-').toLowerCase()
        : slugifyTitle(title);

    const existing = await query('SELECT slug FROM articles WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const status = body.status === 'draft' ? 'draft' : 'published';
    const image =
      typeof body.image === 'string' && body.image.trim()
        ? sanitizeText(body.image, 2000)
        : 'https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=800&h=450&fit=crop';
    const date = new Date().toISOString().slice(0, 10);
    const readTime = estimateReadTime(content || excerpt);
    const author = (account.lawyer as { name: string }).name;

    await query(
      `INSERT INTO articles (slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [slug, title, excerpt, category, author, date, readTime, image, false, status, content || null, account.user.lawyer_id],
    );
    await touchCmsTimestamp();

    res.status(201).json({
      success: true,
      article: { slug, title, excerpt, category, author, date, readTime, image, trending: false, status, content, lawyerId: account.user.lawyer_id },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to create article' });
  }
});

lawyerContentRouter.patch('/articles/:slug', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const current = await query(
      'SELECT slug FROM articles WHERE slug = $1 AND lawyer_id = $2',
      [req.params.slug, account.user.lawyer_id],
    );
    if (!current.rows[0]) {
      res.status(404).json({ detail: 'Article not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const fields: string[] = [];
    const values: unknown[] = [req.params.slug, account.user.lawyer_id];
    let i = 3;

    const setField = (col: string, val: unknown) => {
      fields.push(`${col} = $${i++}`);
      values.push(val);
    };

    if (typeof body.title === 'string') setField('title', sanitizeText(body.title, 512));
    if (typeof body.excerpt === 'string') setField('excerpt', sanitizeText(body.excerpt, 2000));
    if (typeof body.category === 'string') setField('category', sanitizeText(body.category, 128));
    if (typeof body.content === 'string') {
      const content = sanitizeText(body.content, 50000);
      setField('content', content);
      setField('read_time', estimateReadTime(content));
    }
    if (typeof body.image === 'string') setField('image', sanitizeText(body.image, 2000));
    if (body.status === 'draft' || body.status === 'published') setField('status', body.status);

    if (fields.length === 0) {
      res.status(400).json({ detail: 'No valid fields to update' });
      return;
    }

    await query(`UPDATE articles SET ${fields.join(', ')} WHERE slug = $1 AND lawyer_id = $2`, values);
    await touchCmsTimestamp();

    const updated = await query(
      `SELECT slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id
       FROM articles WHERE slug = $1`,
      [req.params.slug],
    );
    res.json({ success: true, article: articleRowToJson(updated.rows[0] as Record<string, unknown>) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to update article' });
  }
});

lawyerContentRouter.delete('/articles/:slug', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const del = await query('DELETE FROM articles WHERE slug = $1 AND lawyer_id = $2 RETURNING slug', [
      req.params.slug,
      account.user.lawyer_id,
    ]);
    if (!del.rows[0]) {
      res.status(404).json({ detail: 'Article not found' });
      return;
    }

    await touchCmsTimestamp();

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to delete article' });
  }
});

lawyerContentRouter.get('/qa/questions', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const rows = await query(
      `SELECT q.id, q.slug, q.title, q.excerpt, q.category, q.answers, q.views, q.status,
              (a.id IS NOT NULL) AS answered_by_me
       FROM qa_posts q
       LEFT JOIN qa_answers a ON a.qa_post_id = q.id AND a.lawyer_id = $1
       WHERE q.status = 'published'
       ORDER BY q.views DESC, q.title`,
      [account.user.lawyer_id],
    );

    res.json({
      questions: rows.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        category: r.category,
        answers: r.answers,
        views: r.views,
        status: r.status,
        answeredByMe: Boolean(r.answered_by_me),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load questions' });
  }
});

lawyerContentRouter.get('/qa/answers', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const rows = await query(
      `SELECT a.id, a.qa_post_id, a.lawyer_id, a.lawyer_name, a.body, a.status, a.created_at, a.updated_at,
              q.title AS question_title, q.slug AS question_slug, q.category AS question_category
       FROM qa_answers a
       JOIN qa_posts q ON q.id = a.qa_post_id
       WHERE a.lawyer_id = $1
       ORDER BY a.updated_at DESC`,
      [account.user.lawyer_id],
    );

    res.json({
      answers: rows.rows.map((r) => ({
        ...answerRowToJson(r as Record<string, unknown>),
        questionTitle: r.question_title,
        questionSlug: r.question_slug,
        questionCategory: r.question_category,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load answers' });
  }
});

lawyerContentRouter.get('/qa/questions/:id', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const qRow = await query(
      'SELECT id, slug, title, excerpt, category, answers, views, status, content FROM qa_posts WHERE id = $1',
      [req.params.id],
    );
    if (!qRow.rows[0]) {
      res.status(404).json({ detail: 'Question not found' });
      return;
    }

    const myAnswer = await query(
      'SELECT id, qa_post_id, lawyer_id, lawyer_name, body, status, created_at, updated_at FROM qa_answers WHERE qa_post_id = $1 AND lawyer_id = $2',
      [req.params.id, account.user.lawyer_id],
    );

    res.json({
      question: qRow.rows[0],
      myAnswer: myAnswer.rows[0] ? answerRowToJson(myAnswer.rows[0] as Record<string, unknown>) : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load question' });
  }
});

lawyerContentRouter.post('/qa/questions/:id/answers', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const qRow = await query('SELECT id FROM qa_posts WHERE id = $1 AND status = $2', [
      req.params.id,
      'published',
    ]);
    if (!qRow.rows[0]) {
      res.status(404).json({ detail: 'Question not found' });
      return;
    }

    const bodyText = typeof req.body?.body === 'string' ? sanitizeText(req.body.body, 10000) : '';
    if (!bodyText) {
      res.status(400).json({ detail: 'Answer body is required' });
      return;
    }

    const lawyerName = (account.lawyer as { name: string }).name;
    const existing = await query(
      'SELECT id FROM qa_answers WHERE qa_post_id = $1 AND lawyer_id = $2',
      [req.params.id, account.user.lawyer_id],
    );

    if (existing.rows[0]) {
      await query(
        `UPDATE qa_answers SET body = $3, lawyer_name = $4, status = 'published', updated_at = NOW()
         WHERE qa_post_id = $1 AND lawyer_id = $2`,
        [req.params.id, account.user.lawyer_id, bodyText, lawyerName],
      );
    } else {
      await query(
        `INSERT INTO qa_answers (id, qa_post_id, lawyer_id, lawyer_name, body, status)
         VALUES ($1,$2,$3,$4,$5,'published')`,
        [`ans-${Date.now()}`, req.params.id, account.user.lawyer_id, lawyerName, bodyText],
      );
    }

    await syncQaAnswerCount(req.params.id);

    const saved = await query(
      'SELECT id, qa_post_id, lawyer_id, lawyer_name, body, status, created_at, updated_at FROM qa_answers WHERE qa_post_id = $1 AND lawyer_id = $2',
      [req.params.id, account.user.lawyer_id],
    );

    res.json({
      success: true,
      answer: answerRowToJson(saved.rows[0] as Record<string, unknown>),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to save answer' });
  }
});

lawyerContentRouter.delete('/qa/answers/:id', requireUser(['lawyer']), async (req, res) => {
  try {
    const { userId } = (req as AuthedRequest).user;
    const account = await resolveLawyerAccount(userId);
    if (!account) {
      res.status(404).json({ detail: 'Lawyer not found' });
      return;
    }

    const del = await query(
      'DELETE FROM qa_answers WHERE id = $1 AND lawyer_id = $2 RETURNING qa_post_id',
      [req.params.id, account.user.lawyer_id],
    );
    if (!del.rows[0]) {
      res.status(404).json({ detail: 'Answer not found' });
      return;
    }

    await syncQaAnswerCount(del.rows[0].qa_post_id as string);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to delete answer' });
  }
});
