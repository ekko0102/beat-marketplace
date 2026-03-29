import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/contacts
router.post('/', async (req: Request, res: Response) => {
  const { producer_id, sender_name, sender_email, subject, message, type, beat_id } = req.body;

  if (!producer_id || !sender_name || !sender_email || !message) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '請填寫必填欄位' });
  }

  try {
    const result = await query(
      `INSERT INTO contacts (producer_id, sender_name, sender_email, subject, message, type, beat_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [producer_id, sender_name, sender_email, subject, message, type || 'general', beat_id || null]
    );

    return res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// GET /api/contacts (auth required - producer views their messages)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT c.*, b.title AS beat_title
       FROM contacts c
       LEFT JOIN beats b ON b.id = c.beat_id
       WHERE c.producer_id = $1
       ORDER BY c.created_at DESC`,
      [req.producerId]
    );
    return res.json({ contacts: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// PATCH /api/contacts/:id/read (auth required)
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  const contact = await query('SELECT producer_id FROM contacts WHERE id = $1', [req.params.id]);
  if (contact.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
  if (contact.rows[0].producer_id !== req.producerId) return res.status(403).json({ error: 'FORBIDDEN' });

  await query('UPDATE contacts SET is_read = true WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

export default router;
