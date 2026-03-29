import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { uploadBeat, uploadCover } from '../middleware/upload';
import multer from 'multer';
import path from 'path';

const router = Router();

// GET /api/beats
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      genre, mood, bpm_min, bpm_max, key,
      price_min, price_max, license_type,
      producer_id, q,
      sort = 'newest',
      page = '1', limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = ["b.is_active = true", "b.type = 'beat'"];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (genre) { conditions.push(`b.genre = $${paramIdx++}`); params.push(genre); }
    if (mood) { conditions.push(`b.mood = $${paramIdx++}`); params.push(mood); }
    if (bpm_min) { conditions.push(`b.bpm >= $${paramIdx++}`); params.push(parseInt(bpm_min)); }
    if (bpm_max) { conditions.push(`b.bpm <= $${paramIdx++}`); params.push(parseInt(bpm_max)); }
    if (key) { conditions.push(`b.key = $${paramIdx++}`); params.push(key); }
    if (producer_id) { conditions.push(`b.producer_id = $${paramIdx++}`); params.push(producer_id); }
    if (q) {
      conditions.push(`(b.title ILIKE $${paramIdx} OR $${paramIdx} = ANY(b.tags))`);
      params.push(`%${q}%`);
      paramIdx++;
    }
    if (license_type) {
      conditions.push(`EXISTS (SELECT 1 FROM licenses l2 WHERE l2.beat_id = b.id AND l2.type = $${paramIdx++} AND l2.is_available = true)`);
      params.push(license_type);
    }
    if (price_min || price_max) {
      if (price_min) { conditions.push(`(SELECT MIN(l2.price) FROM licenses l2 WHERE l2.beat_id = b.id) >= $${paramIdx++}`); params.push(parseInt(price_min)); }
      if (price_max) { conditions.push(`(SELECT MIN(l2.price) FROM licenses l2 WHERE l2.beat_id = b.id) <= $${paramIdx++}`); params.push(parseInt(price_max)); }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap: Record<string, string> = {
      newest: 'b.created_at DESC',
      plays: 'b.play_count DESC',
      price_asc: 'min_price ASC NULLS LAST',
      price_desc: 'min_price DESC NULLS LAST',
    };
    const orderBy = orderMap[sort] || 'b.created_at DESC';

    const dataQuery = `
      SELECT
        b.id, b.title, b.cover_url, b.preview_url,
        b.genre, b.mood, b.bpm, b.key, b.tags,
        b.play_count, b.is_sold_out, b.created_at,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS producer,
        json_agg(
          json_build_object('id', l.id, 'type', l.type, 'price', l.price, 'is_available', l.is_available)
          ORDER BY l.price ASC
        ) FILTER (WHERE l.id IS NOT NULL) AS licenses,
        MIN(l.price) AS min_price
      FROM beats b
      JOIN producers p ON p.id = b.producer_id
      LEFT JOIN licenses l ON l.beat_id = b.id AND l.is_available = true
      ${whereClause}
      GROUP BY b.id, p.id
      ORDER BY ${orderBy}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT b.id) AS total
      FROM beats b
      LEFT JOIN licenses l ON l.beat_id = b.id
      ${whereClause}
    `;

    params.push(limitNum, offset);

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, -2)),
    ]);

    return res.json({
      beats: dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// GET /api/beats/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT
        b.*,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url,
                          'genres', p.genres, 'bio', p.bio) AS producer,
        json_agg(
          json_build_object('id', l.id, 'type', l.type, 'price', l.price,
                            'description', l.description, 'file_formats', l.file_formats,
                            'distribution_limit', l.distribution_limit, 'is_available', l.is_available)
          ORDER BY l.price ASC
        ) FILTER (WHERE l.id IS NOT NULL) AS licenses
      FROM beats b
      JOIN producers p ON p.id = b.producer_id
      LEFT JOIN licenses l ON l.beat_id = b.id
      WHERE b.id = $1 AND b.is_active = true
      GROUP BY b.id, p.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此伴奏' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// POST /api/beats/:id/play
router.post('/:id/play', async (req: Request, res: Response) => {
  await query('UPDATE beats SET play_count = play_count + 1 WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

// POST /api/beats (auth required) - upload beat
const beatUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      const base = process.env.UPLOADS_PATH || 'D:/BeatMarketplace/uploads';
      const dir = file.fieldname === 'cover' ? path.join(base, 'covers') : path.join(base, 'beats/preview');
      const fs = require('fs');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const { v4: uuidv4 } = require('uuid');
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post('/', requireAuth, beatUpload.fields([
  { name: 'preview', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const previewFile = files?.['preview']?.[0];
    const coverFile = files?.['cover']?.[0];

    if (!previewFile) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: '請上傳試聽音訊' });
    }

    const { title, description, genre, mood, bpm, key, tags, type, licenses } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: '請填寫標題和類型' });
    }

    const previewUrl = `/uploads/beats/preview/${previewFile.filename}`;
    const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;
    const tagsArray = tags ? JSON.parse(tags) : [];

    const beatResult = await query(
      `INSERT INTO beats (producer_id, title, description, cover_url, preview_url, type, genre, mood, bpm, key, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.producerId, title, description, coverUrl, previewUrl, type, genre, mood,
       bpm ? parseInt(bpm) : null, key, tagsArray]
    );

    const beat = beatResult.rows[0];

    // Insert licenses if type is 'beat'
    if (type === 'beat' && licenses) {
      const licensesData = JSON.parse(licenses);
      for (const lic of licensesData) {
        await query(
          `INSERT INTO licenses (beat_id, type, price, description, file_formats, distribution_limit)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [beat.id, lic.type, lic.price, lic.description, lic.file_formats || ['MP3'], lic.distribution_limit]
        );
      }
    }

    return res.status(201).json(beat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// DELETE /api/beats/:id (auth required)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const beat = await query('SELECT producer_id FROM beats WHERE id = $1', [req.params.id]);
  if (beat.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
  if (beat.rows[0].producer_id !== req.producerId) return res.status(403).json({ error: 'FORBIDDEN' });

  await query('UPDATE beats SET is_active = false WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

export default router;
