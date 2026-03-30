import { Router, Request, Response } from 'express';
import multer from 'multer';
import { query } from '../db/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { uploadToR2, isR2Configured } from '../lib/storage';
import path from 'path';

const router = Router();

// GET /api/producers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.name, p.bio, p.avatar_url, p.banner_url,
        p.genres, p.mood_tags, p.years_experience, p.created_at,
        COUNT(b.id) FILTER (WHERE b.is_active = true) AS beat_count
      FROM producers p
      LEFT JOIN beats b ON b.producer_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return res.json({ producers: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// GET /api/producers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producerResult = await query(
      `SELECT id, name, email, bio, avatar_url, banner_url, genres, mood_tags,
              credits, social_links, contact_email, years_experience, equipment,
              custom_price_min, custom_price_max, delivery_days, created_at
       FROM producers WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (producerResult.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: '找不到此製作人' });
    }

    const beatsResult = await query(
      `SELECT b.id, b.title, b.cover_url, b.preview_url, b.type,
              b.genre, b.mood, b.bpm, b.key, b.tags, b.play_count,
              b.is_sold_out, b.created_at,
              json_agg(json_build_object('id', l.id, 'type', l.type, 'price', l.price, 'is_available', l.is_available)
                ORDER BY l.price ASC) FILTER (WHERE l.id IS NOT NULL) AS licenses
       FROM beats b
       LEFT JOIN licenses l ON l.beat_id = b.id
       WHERE b.producer_id = $1 AND b.is_active = true
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [id]
    );

    const producer = producerResult.rows[0];
    const allBeats = beatsResult.rows;

    return res.json({
      ...producer,
      showcase: allBeats.filter((b) => b.type === 'showcase'),
      beats: allBeats.filter((b) => b.type === 'beat'),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

// PUT /api/producers/:id (auth required)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.producerId !== id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: '無權限修改此資料' });
  }

  const {
    name, bio, genres, mood_tags, credits, social_links,
    contact_email, years_experience, equipment,
    custom_price_min, custom_price_max, delivery_days,
  } = req.body;

  try {
    const result = await query(
      `UPDATE producers SET
        name = COALESCE($1, name),
        bio = COALESCE($2, bio),
        genres = COALESCE($3, genres),
        mood_tags = COALESCE($4, mood_tags),
        credits = COALESCE($5, credits),
        social_links = COALESCE($6, social_links),
        contact_email = COALESCE($7, contact_email),
        years_experience = COALESCE($8, years_experience),
        equipment = COALESCE($9, equipment),
        custom_price_min = COALESCE($10, custom_price_min),
        custom_price_max = COALESCE($11, custom_price_max),
        delivery_days = COALESCE($12, delivery_days)
       WHERE id = $13
       RETURNING id, name, bio, genres, mood_tags, credits, social_links,
                 contact_email, years_experience, equipment,
                 custom_price_min, custom_price_max, delivery_days, avatar_url, banner_url`,
      [name, bio, genres, mood_tags, credits ? JSON.stringify(credits) : null,
       social_links ? JSON.stringify(social_links) : null,
       contact_email, years_experience, equipment,
       custom_price_min, custom_price_max, delivery_days, id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '伺服器錯誤' });
  }
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('只接受圖片'));
};

const makeDiskStorage = (subdir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const fs = require('fs');
      const dir = path.join(process.env.UPLOADS_PATH || path.join(__dirname, '../../../uploads'), subdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const { v4: uuidv4 } = require('uuid');
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
  });

// POST /api/producers/:id/avatar (auth required)
const avatarUpload = multer({
  storage: isR2Configured() ? multer.memoryStorage() : makeDiskStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/:id/avatar', requireAuth, avatarUpload.single('avatar'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.producerId !== id) return res.status(403).json({ error: 'FORBIDDEN', message: '無權限' });
  if (!req.file) return res.status(400).json({ error: 'BAD_REQUEST', message: '請上傳圖片' });

  let avatarUrl: string;
  if (isR2Configured()) {
    avatarUrl = await uploadToR2(req.file.buffer, req.file.originalname, 'avatars', req.file.mimetype);
  } else {
    avatarUrl = `/uploads/avatars/${req.file.filename}`;
  }

  await query('UPDATE producers SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, id]);
  return res.json({ avatar_url: avatarUrl });
});

// POST /api/producers/:id/banner (auth required)
const bannerUpload = multer({
  storage: isR2Configured() ? multer.memoryStorage() : makeDiskStorage('banners'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/:id/banner', requireAuth, bannerUpload.single('banner'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.producerId !== id) return res.status(403).json({ error: 'FORBIDDEN', message: '無權限' });
  if (!req.file) return res.status(400).json({ error: 'BAD_REQUEST', message: '請上傳圖片' });

  let bannerUrl: string;
  if (isR2Configured()) {
    bannerUrl = await uploadToR2(req.file.buffer, req.file.originalname, 'banners', req.file.mimetype);
  } else {
    bannerUrl = `/uploads/banners/${req.file.filename}`;
  }

  await query('UPDATE producers SET banner_url = $1, updated_at = NOW() WHERE id = $2', [bannerUrl, id]);
  return res.json({ banner_url: bannerUrl });
});

export default router;
