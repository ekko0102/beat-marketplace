import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '請填寫所有欄位' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '密碼至少需要 8 個字元' });
  }

  try {
    const existing = await query('SELECT id FROM producers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'CONFLICT', message: 'Email 已被註冊' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO producers (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const producer = result.rows[0];
    const token = jwt.sign({ id: producer.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(201).json({ token, producer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '請填寫 Email 和密碼' });
  }

  try {
    const result = await query(
      'SELECT id, name, email, password_hash, avatar_url FROM producers WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Email 或密碼錯誤' });
    }

    const producer = result.rows[0];
    const valid = await bcrypt.compare(password, producer.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Email 或密碼錯誤' });
    }

    const token = jwt.sign({ id: producer.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const { password_hash: _, ...safeProducer } = producer;
    return res.json({ token, producer: safeProducer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

export default router;
