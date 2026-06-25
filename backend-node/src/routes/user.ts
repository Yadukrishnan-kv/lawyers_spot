import { Router } from 'express';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireUser, findUserById } from '../platform-auth.js';
import { loadCms } from '../cms.js';
import { query } from '../db.js';
import { sanitizeText } from '../security/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!existsSync(UPLOADS_DIR)) {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export const userRouter = Router();

userRouter.get('/profile', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ detail: 'User not found' });
      return;
    }
    const r = await query<{
      phone: string | null;
      profile_image: string | null;
      address: string | null;
    }>('SELECT phone, profile_image, address FROM platform_users WHERE id = $1', [userId]);
    const row = r.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: row?.phone ?? null,
      profileImage: row?.profile_image ?? null,
      address: row?.address ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load profile' });
  }
});

userRouter.patch('/profile', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const { name, phone, address, profileImage } = req.body as {
      name?: string;
      phone?: string;
      address?: string;
      profileImage?: string;
    };
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (typeof name === 'string' && name.trim()) {
      updates.push(`name = $${idx++}`);
      params.push(sanitizeText(name, 120));
    }
    if (typeof phone === 'string') {
      updates.push(`phone = $${idx++}`);
      params.push(sanitizeText(phone, 32) || null);
    }
    if (typeof address === 'string') {
      updates.push(`address = $${idx++}`);
      params.push(sanitizeText(address, 500) || null);
    }
    if (typeof profileImage === 'string') {
      updates.push(`profile_image = $${idx++}`);
      params.push(profileImage || null);
    }

    if (updates.length === 0) {
      res.status(400).json({ detail: 'No fields to update' });
      return;
    }

    params.push(userId);
    await query(
      `UPDATE platform_users SET ${updates.join(', ')} WHERE id = $${idx}`,
      params,
    );

    const user = await findUserById(userId);
    const r = await query<{
      phone: string | null;
      profile_image: string | null;
      address: string | null;
    }>('SELECT phone, profile_image, address FROM platform_users WHERE id = $1', [userId]);
    const row = r.rows[0];
    res.json({
      success: true,
      profile: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        phone: row?.phone ?? null,
        profileImage: row?.profile_image ?? null,
        address: row?.address ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to update profile' });
  }
});

userRouter.get('/bookings', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{
      id: string;
      lawyer_id: string;
      lawyer_name: string;
      client_name: string;
      client_email: string;
      date: string;
      time: string;
      type: string;
      status: string;
    }>(
      `SELECT id, lawyer_id, lawyer_name, client_name, client_email, date, time, type, status
       FROM bookings WHERE user_id = $1 ORDER BY date DESC, time DESC`,
      [userId],
    );
    const cms = await loadCms();
    const lawyerMap = new Map(cms.lawyers.map((l) => [l.id, l]));

    const bookings = r.rows.map((b) => ({
      id: b.id,
      lawyerId: b.lawyer_id,
      lawyerName: b.lawyer_name,
      lawyerImage: (lawyerMap.get(b.lawyer_id) as { image?: string } | undefined)?.image ?? '',
      clientName: b.client_name,
      clientEmail: b.client_email,
      date: b.date,
      time: b.time,
      type: b.type,
      status: b.status,
    }));

    res.json({ bookings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load bookings' });
  }
});

userRouter.post('/saved-lawyers', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const { lawyerId } = req.body as { lawyerId?: string };
    if (!lawyerId) {
      res.status(400).json({ detail: 'lawyerId required' });
      return;
    }
    const existing = await query(
      'SELECT id FROM saved_lawyers WHERE user_id = $1 AND lawyer_id = $2',
      [userId, lawyerId],
    );
    if (existing.rows.length > 0) {
      res.json({ success: true, saved: true });
      return;
    }
    await query(
      'INSERT INTO saved_lawyers (user_id, lawyer_id) VALUES ($1, $2)',
      [userId, lawyerId],
    );
    res.json({ success: true, saved: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to save lawyer' });
  }
});

userRouter.delete('/saved-lawyers/:lawyerId', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const { lawyerId } = req.params;
    if (!lawyerId) {
      res.status(400).json({ detail: 'lawyerId required' });
      return;
    }
    await query(
      'DELETE FROM saved_lawyers WHERE user_id = $1 AND lawyer_id = $2',
      [userId, lawyerId],
    );
    res.json({ success: true, saved: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to remove saved lawyer' });
  }
});

userRouter.get('/saved-lawyers', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{ lawyer_id: string; created_at: string }>(
      'SELECT lawyer_id, created_at FROM saved_lawyers WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    const cms = await loadCms();
    const lawyerMap = new Map(cms.lawyers.map((l) => [l.id, l]));
    const saved = r.rows
      .map((row) => {
        const lawyer = lawyerMap.get(row.lawyer_id) as Record<string, unknown> | undefined;
        if (!lawyer) return null;
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
          practice: lawyer.practice,
          citySlug: lawyer.citySlug,
          specialization: lawyer.specialization,
          online: lawyer.online,
          verified: lawyer.verified,
          savedAt: row.created_at,
        };
      })
      .filter(Boolean);
    res.json({ savedLawyers: saved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load saved lawyers' });
  }
});

userRouter.get('/saved-lawyers/ids', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{ lawyer_id: string }>(
      'SELECT lawyer_id FROM saved_lawyers WHERE user_id = $1',
      [userId],
    );
    res.json({ ids: r.rows.map((row) => row.lawyer_id) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load saved IDs' });
  }
});

userRouter.get('/notifications', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{
      id: number;
      title: string;
      message: string;
      type: string;
      read: boolean;
      created_at: string;
    }>(
      'SELECT id, title, message, type, read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
      [userId],
    );
    res.json({
      notifications: r.rows.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: row.read,
        createdAt: row.created_at,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load notifications' });
  }
});

userRouter.patch('/notifications/:id/read', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ detail: 'Invalid notification ID' });
      return;
    }
    await query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to mark notification as read' });
  }
});

userRouter.patch('/notifications/read-all', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    await query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [userId],
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to mark all as read' });
  }
});

userRouter.get('/conversations', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{
      id: number;
      lawyer_id: string;
      last_message: string | null;
      last_message_at: string | null;
      created_at: string;
    }>(
      `SELECT id, lawyer_id, last_message, last_message_at, created_at
       FROM conversations WHERE user_id = $1 ORDER BY COALESCE(last_message_at, created_at) DESC`,
      [userId],
    );
    const cms = await loadCms();
    const lawyerMap = new Map(cms.lawyers.map((l) => [l.id, l]));
    const conversations = r.rows.map((row) => {
      const lawyer = lawyerMap.get(row.lawyer_id) as Record<string, unknown> | undefined;
      return {
        id: row.id,
        lawyerId: row.lawyer_id,
        lawyerName: (lawyer?.name as string) ?? 'Unknown',
        lawyerImage: (lawyer?.image as string) ?? '',
        lawyerPractice: (lawyer?.practice as string) ?? '',
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at ?? row.created_at,
      };
    });
    res.json({ conversations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load conversations' });
  }
});

userRouter.get('/conversations/:id/messages', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const convId = Number(req.params.id);
    if (!convId) {
      res.status(400).json({ detail: 'Invalid conversation ID' });
      return;
    }
    const conv = await query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [convId, userId],
    );
    if (conv.rows.length === 0) {
      res.status(404).json({ detail: 'Conversation not found' });
      return;
    }
    const r = await query<{
      id: number;
      sender_id: string;
      sender_type: string;
      text: string;
      created_at: string;
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
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load messages' });
  }
});

userRouter.post('/conversations/:id/messages', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const convId = Number(req.params.id);
    const { text } = req.body as { text?: string };
    if (!convId) {
      res.status(400).json({ detail: 'Invalid conversation ID' });
      return;
    }
    if (!text || !text.trim()) {
      res.status(400).json({ detail: 'Message text required' });
      return;
    }
    const conv = await query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [convId, userId],
    );
    if (conv.rows.length === 0) {
      res.status(404).json({ detail: 'Conversation not found' });
      return;
    }
    const msg = await query<{ id: number; created_at: string }>(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, text)
       VALUES ($1, $2, 'user', $3) RETURNING id, created_at`,
      [convId, userId, text.trim()],
    );
    await query(
      'UPDATE conversations SET last_message = $1, last_message_at = NOW() WHERE id = $2',
      [text.trim(), convId],
    );
    res.json({
      success: true,
      message: {
        id: msg.rows[0].id,
        senderId: userId,
        senderType: 'user',
        text: text.trim(),
        createdAt: msg.rows[0].created_at,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to send message' });
  }
});

userRouter.post('/conversations', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const { lawyerId, initialMessage } = req.body as { lawyerId?: string; initialMessage?: string };
    if (!lawyerId) {
      res.status(400).json({ detail: 'lawyerId required' });
      return;
    }
    const existing = await query(
      'SELECT id FROM conversations WHERE user_id = $1 AND lawyer_id = $2',
      [userId, lawyerId],
    );
    if (existing.rows.length > 0) {
      res.json({ conversationId: existing.rows[0].id, existing: true });
      return;
    }
    const conv = await query<{ id: number }>(
      `INSERT INTO conversations (user_id, lawyer_id, last_message, last_message_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [userId, lawyerId, initialMessage?.trim() ?? null],
    );
    if (initialMessage?.trim()) {
      await query(
        `INSERT INTO messages (conversation_id, sender_id, sender_type, text)
         VALUES ($1, $2, 'user', $3)`,
        [conv.rows[0].id, userId, initialMessage.trim()],
      );
    }
    res.json({ conversationId: conv.rows[0].id, existing: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to create conversation' });
  }
});

userRouter.get('/documents', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const r = await query<{
      id: number;
      file_url: string;
      file_name: string;
      file_size: number | null;
      mime_type: string | null;
      created_at: string;
    }>(
      'SELECT id, file_url, file_name, file_size, mime_type, created_at FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    res.json({
      documents: r.rows.map((row) => ({
        id: row.id,
        fileUrl: row.file_url,
        fileName: row.file_name,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        createdAt: row.created_at,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to load documents' });
  }
});

userRouter.post('/documents', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const { fileName, fileData, mimeType } = req.body as {
      fileName?: string;
      fileData?: string;
      mimeType?: string;
    };
    if (!fileName || !fileData) {
      res.status(400).json({ detail: 'fileName and fileData required' });
      return;
    }
    const buf = Buffer.from(fileData, 'base64');
    const ext = path.extname(fileName).toLowerCase() || '.bin';
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, storedName);
    await writeFile(filePath, buf);

    const doc = await query<{ id: number; created_at: string }>(
      `INSERT INTO user_documents (user_id, file_url, file_name, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [userId, `/uploads/${storedName}`, fileName, buf.length, mimeType ?? 'application/octet-stream'],
    );
    res.json({
      success: true,
      document: {
        id: doc.rows[0].id,
        fileUrl: `/uploads/${storedName}`,
        fileName,
        fileSize: buf.length,
        mimeType: mimeType ?? 'application/octet-stream',
        createdAt: doc.rows[0].created_at,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to upload document' });
  }
});

userRouter.delete('/documents/:id', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ detail: 'Invalid document ID' });
      return;
    }
    const doc = await query<{ file_url: string }>(
      'SELECT file_url FROM user_documents WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (doc.rows.length === 0) {
      res.status(404).json({ detail: 'Document not found' });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, path.basename(doc.rows[0].file_url));
    await unlink(filePath).catch(() => {});
    await query('DELETE FROM user_documents WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to delete document' });
  }
});

userRouter.get('/documents/:id/download', requireUser(), async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: string } }).user;
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).json({ detail: 'Invalid document ID' });
      return;
    }
    const doc = await query<{ file_url: string; file_name: string; mime_type: string | null }>(
      'SELECT file_url, file_name, mime_type FROM user_documents WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (doc.rows.length === 0) {
      res.status(404).json({ detail: 'Document not found' });
      return;
    }
    const row = doc.rows[0];
    const filePath = path.join(UPLOADS_DIR, path.basename(row.file_url));
    if (!existsSync(filePath)) {
      res.status(404).json({ detail: 'File not found on disk' });
      return;
    }
    res.setHeader('Content-Type', row.mime_type ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${row.file_name}"`);
    res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    res.status(500).json({ detail: 'Failed to download document' });
  }
});
