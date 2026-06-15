import { Router } from 'express';
import { loadCms } from '../cms.js';
import { config } from '../config.js';
import { query } from '../db.js';
import { toPublicCms } from '../security/public-cms.js';

export const publicRouter = Router();

publicRouter.get('/qa/:slug/answers', async (req, res) => {
  try {
    const postRes = await query(
      'SELECT id, slug, title, excerpt, category, content FROM qa_posts WHERE slug = $1 AND status = $2',
      [req.params.slug, 'published'],
    );
    const post = postRes.rows[0];
    if (!post) {
      res.status(404).json({ detail: 'Question not found' });
      return;
    }

    const answersRes = await query(
      `SELECT id, lawyer_id, lawyer_name, body, created_at
       FROM qa_answers WHERE qa_post_id = $1 AND status = 'published'
       ORDER BY created_at ASC`,
      [post.id],
    );

    res.json({
      question: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        content: post.content,
      },
      answers: answersRes.rows.map((r) => ({
        id: r.id,
        lawyerId: r.lawyer_id,
        lawyerName: r.lawyer_name,
        body: r.body,
        createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load answers' });
  }
});

publicRouter.get('/cms', async (_req, res) => {
  try {
    const data = await loadCms();
    res.setHeader('Cache-Control', `public, max-age=${config.cmsCacheSeconds}, stale-while-revalidate=120`);
    res.json(toPublicCms(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load CMS' });
  }
});
