import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import producerRoutes from './routes/producers';
import beatRoutes from './routes/beats';
import contactRoutes from './routes/contacts';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './db/connection';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust Railway/Vercel reverse proxy
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'TOO_MANY_REQUESTS', message: '請求過於頻繁，請稍後再試' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/contacts', contactRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

async function initDB() {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await pool.query(`CREATE TABLE IF NOT EXISTS producers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      bio TEXT,
      avatar_url VARCHAR(500),
      banner_url VARCHAR(500),
      genres TEXT[] DEFAULT '{}',
      mood_tags TEXT[] DEFAULT '{}',
      credits JSONB DEFAULT '[]',
      social_links JSONB DEFAULT '{}',
      contact_email VARCHAR(255),
      years_experience INTEGER,
      equipment TEXT[] DEFAULT '{}',
      custom_price_min INTEGER,
      custom_price_max INTEGER,
      delivery_days INTEGER,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS beats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      cover_url VARCHAR(500),
      preview_url VARCHAR(500) NOT NULL,
      full_audio_url VARCHAR(500),
      type VARCHAR(20) NOT NULL CHECK (type IN ('beat', 'showcase')),
      genre VARCHAR(50),
      mood VARCHAR(50),
      bpm INTEGER,
      key VARCHAR(10),
      tags TEXT[] DEFAULT '{}',
      play_count INTEGER DEFAULT 0,
      is_sold_out BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS licenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium', 'exclusive')),
      price INTEGER NOT NULL,
      description TEXT,
      file_formats TEXT[] DEFAULT '{"MP3"}',
      distribution_limit INTEGER,
      is_available BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      buyer_email VARCHAR(255) NOT NULL,
      buyer_name VARCHAR(100),
      total_amount INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      payment_id VARCHAR(255),
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      beat_id UUID NOT NULL REFERENCES beats(id),
      license_id UUID NOT NULL REFERENCES licenses(id),
      price INTEGER NOT NULL,
      download_token VARCHAR(255) UNIQUE,
      download_count INTEGER DEFAULT 0,
      download_expires TIMESTAMPTZ
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
      sender_name VARCHAR(100) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(200),
      message TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'general',
      beat_id UUID REFERENCES beats(id),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }
}

app.listen(PORT, async () => {
  await initDB();
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
