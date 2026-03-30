import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Cloudflare R2 is S3-compatible
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'beatmarket';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // e.g. https://pub-xxx.r2.dev

export async function uploadToR2(
  buffer: Buffer,
  originalName: string,
  folder: string,
  mimeType: string,
): Promise<string> {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
  if (!url || !PUBLIC_URL || !url.startsWith(PUBLIC_URL)) return;
  const key = url.replace(`${PUBLIC_URL}/`, '');
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export const isR2Configured = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
