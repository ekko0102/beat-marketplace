import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { buildEcpayForm, verifyCheckMac } from '../lib/ecpay';
import { sendPurchaseConfirmation, sendSaleNotification } from '../lib/mailer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const BACKEND_URL  = process.env.BACKEND_URL  || 'https://beat-marketplace-production.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://beat-marketplace-iota.vercel.app';

// POST /api/orders/checkout
// Body: { buyerName, buyerEmail, items: [{beatId, licenseId}] }
router.post('/checkout', async (req: Request, res: Response) => {
  const { buyerName, buyerEmail, items } = req.body;

  if (!buyerName || !buyerEmail || !items?.length) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: '請填寫必要資訊' });
  }

  try {
    // Validate items and get prices
    const itemDetails = [];
    let totalAmount = 0;

    for (const item of items) {
      const result = await query(
        `SELECT b.id AS beat_id, b.title, b.preview_url, b.full_audio_url,
                l.id AS license_id, l.type AS license_type, l.price
         FROM beats b
         JOIN licenses l ON l.id = $2
         WHERE b.id = $1 AND b.is_active = true AND l.beat_id = b.id AND l.is_available = true`,
        [item.beatId, item.licenseId]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'ITEM_UNAVAILABLE', message: `伴奏或授權不存在` });
      }

      const row = result.rows[0];
      itemDetails.push(row);
      totalAmount += row.price;
    }

    // Create order
    const tradeNo = `BM${Date.now()}`.slice(0, 20);
    const orderResult = await query(
      `INSERT INTO orders (buyer_email, buyer_name, total_amount, status, payment_id)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id`,
      [buyerEmail, buyerName, totalAmount, tradeNo]
    );
    const orderId = orderResult.rows[0].id;

    // Create order items with download tokens
    for (const item of itemDetails) {
      const downloadToken = uuidv4();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await query(
        `INSERT INTO order_items (order_id, beat_id, license_id, price, download_token, download_expires)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.beat_id, item.license_id, item.price, downloadToken, expires]
      );
    }

    // Build ECPay form
    const itemName = itemDetails.map((i) => `${i.title}(${i.license_type})`).join('#');
    const { url, params } = buildEcpayForm({
      tradeNo,
      totalAmount,
      tradeDesc: 'BeatMarket伴奏授權購買',
      itemName: itemName.slice(0, 400),
      returnUrl:      `${BACKEND_URL}/api/orders/ecpay/notify`,
      orderResultUrl: `${FRONTEND_URL}/checkout/result`,
      buyerEmail,
    });

    return res.json({ paymentUrl: url, params, orderId, tradeNo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: '建立訂單失敗' });
  }
});

// POST /api/orders/ecpay/notify  (ECPay server-to-server callback)
router.post('/ecpay/notify', async (req: Request, res: Response) => {
  const params = req.body as Record<string, string>;

  if (!verifyCheckMac(params)) {
    console.warn('ECPay CheckMacValue mismatch');
    return res.send('0|ErrorMessage');
  }

  const { MerchantTradeNo, RtnCode, RtnMsg } = params;

  try {
    if (RtnCode === '1') {
      // Payment success
      await query(
        `UPDATE orders SET status = 'paid', paid_at = NOW(), payment_method = $1 WHERE payment_id = $2`,
        [params.PaymentType || 'ecpay', MerchantTradeNo]
      );

      // Fetch order + items for email
      const orderRes = await query(
        `SELECT o.id, o.buyer_email, o.buyer_name
         FROM orders o WHERE o.payment_id = $1`,
        [MerchantTradeNo]
      );

      if (orderRes.rows.length > 0) {
        const order = orderRes.rows[0];

        const itemsRes = await query(
          `SELECT oi.download_token, b.title AS beat_title, l.type AS license_type,
                  b.producer_id, p.email AS producer_email, p.name AS producer_name, oi.price
           FROM order_items oi
           JOIN beats b ON b.id = oi.beat_id
           JOIN licenses l ON l.id = oi.license_id
           JOIN producers p ON p.id = b.producer_id
           WHERE oi.order_id = $1`,
          [order.id]
        );

        // Send buyer email
        await sendPurchaseConfirmation({
          buyerEmail: order.buyer_email,
          buyerName: order.buyer_name,
          items: itemsRes.rows.map((i) => ({
            beatTitle: i.beat_title,
            licenseType: i.license_type,
            downloadToken: i.download_token,
          })),
        });

        // Send producer notifications
        const producerMap = new Map<string, typeof itemsRes.rows[0]>();
        itemsRes.rows.forEach((i) => producerMap.set(i.producer_id, i));

        for (const [, item] of producerMap) {
          await sendSaleNotification({
            producerEmail: item.producer_email,
            producerName: item.producer_name,
            buyerName: order.buyer_name,
            beatTitle: item.beat_title,
            licenseType: item.license_type,
            amount: item.price,
          }).catch(() => {}); // don't fail if email fails
        }
      }
    } else {
      await query(
        `UPDATE orders SET status = 'failed' WHERE payment_id = $1`,
        [MerchantTradeNo]
      );
    }

    return res.send('1|OK');
  } catch (err) {
    console.error('ECPay notify error:', err);
    return res.send('0|ServerError');
  }
});

// GET /api/orders/download/:token
router.get('/download/:token', async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await query(
    `SELECT oi.*, b.full_audio_url, b.preview_url, b.title,
            o.status, o.buyer_email
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN beats b ON b.id = oi.beat_id
     WHERE oi.download_token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'NOT_FOUND', message: '下載連結不存在' });
  }

  const item = result.rows[0];

  if (item.status !== 'paid') {
    return res.status(403).json({ error: 'UNPAID', message: '訂單尚未付款' });
  }
  if (item.download_count >= 3) {
    return res.status(403).json({ error: 'LIMIT_EXCEEDED', message: '已超過下載次數限制' });
  }
  if (new Date(item.download_expires) < new Date()) {
    return res.status(403).json({ error: 'EXPIRED', message: '下載連結已過期' });
  }

  await query(
    `UPDATE order_items SET download_count = download_count + 1 WHERE download_token = $1`,
    [token]
  );

  // If R2 URL, redirect directly
  const fileUrl = item.full_audio_url || item.preview_url;
  if (fileUrl?.startsWith('http')) {
    return res.redirect(fileUrl);
  }

  // Local: redirect to uploads
  const backendBase = process.env.BACKEND_URL || 'http://localhost:4000';
  return res.redirect(`${backendBase}${fileUrl}`);
});

// GET /api/orders/:tradeNo/status
router.get('/status/:tradeNo', async (req: Request, res: Response) => {
  const result = await query(
    `SELECT o.id, o.status, o.buyer_name, o.buyer_email, o.total_amount, o.paid_at,
            json_agg(json_build_object(
              'beatTitle', b.title,
              'licenseType', l.type,
              'price', oi.price,
              'downloadToken', oi.download_token,
              'downloadCount', oi.download_count,
              'downloadExpires', oi.download_expires
            )) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN beats b ON b.id = oi.beat_id
     JOIN licenses l ON l.id = oi.license_id
     WHERE o.payment_id = $1
     GROUP BY o.id`,
    [req.params.tradeNo]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  return res.json(result.rows[0]);
});

// GET /api/orders (auth - producer sees sales)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT o.id, o.buyer_name, o.buyer_email, o.total_amount, o.status, o.paid_at,
            b.title AS beat_title, l.type AS license_type, oi.price
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN beats b ON b.id = oi.beat_id
     JOIN licenses l ON l.id = oi.license_id
     WHERE b.producer_id = $1 AND o.status = 'paid'
     ORDER BY o.paid_at DESC
     LIMIT 100`,
    [req.producerId]
  );
  return res.json({ sales: result.rows });
});

export default router;
