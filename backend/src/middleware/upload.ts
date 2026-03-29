import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_PATH = process.env.UPLOADS_PATH || 'D:/BeatMarketplace/uploads';

const storage = (subdir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(UPLOADS_PATH, subdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

const audioFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp3'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只接受 MP3 或 WAV 音訊檔案'));
  }
};

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只接受圖片檔案'));
  }
};

export const uploadAvatar = multer({
  storage: storage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const uploadBanner = multer({
  storage: storage('banners'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadBeat = multer({
  storage: storage('beats/preview'),
  fileFilter: audioFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

export const uploadCover = multer({
  storage: storage('covers'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
