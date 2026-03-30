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
import fs from 'fs';

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
    const sqlPath = path.join(__dirname, '../../database/init.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Database initialized');
    }
  } catch (err) {
    console.error('DB init error (may be ok if tables exist):', err);
  }
}

app.listen(PORT, async () => {
  await initDB();
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
