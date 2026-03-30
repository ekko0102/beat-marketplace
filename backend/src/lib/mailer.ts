import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || 'BeatMarket <noreply@beatmarket.tw>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://beat-marketplace-iota.vercel.app';

export async function sendPurchaseConfirmation(opts: {
  buyerEmail: string;
  buyerName: string;
  items: { beatTitle: string; licenseType: string; downloadToken: string }[];
}) {
  if (!process.env.SMTP_USER) return; // skip if not configured

  const itemRows = opts.items.map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;">
        <strong style="color:#fff">${i.beatTitle}</strong><br/>
        <span style="color:#a78bfa;font-size:12px;">${i.licenseType} License</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a2e;text-align:right">
        <a href="${SITE}/download/${i.downloadToken}"
           style="background:#7c3aed;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold">
          下載檔案
        </a>
      </td>
    </tr>`).join('');

  await transporter.sendMail({
    from: FROM,
    to: opts.buyerEmail,
    subject: '🎵 BeatMarket — 購買成功，你的下載連結',
    html: `
      <div style="background:#080810;color:#f0f0ff;padding:40px;font-family:sans-serif;max-width:560px;margin:0 auto;border-radius:12px">
        <h1 style="color:#a78bfa;margin-bottom:8px">購買成功！</h1>
        <p style="color:#8888aa;margin-bottom:24px">嗨 ${opts.buyerName}，感謝你的購買。以下是你的下載連結：</p>
        <table style="width:100%;border-collapse:collapse">${itemRows}</table>
        <p style="color:#555;font-size:12px;margin-top:24px">下載連結有效期限為 7 天，每個連結可下載 3 次。</p>
        <p style="color:#555;font-size:12px">如有問題請回覆此信件。</p>
      </div>`,
  });
}

export async function sendSaleNotification(opts: {
  producerEmail: string;
  producerName: string;
  buyerName: string;
  beatTitle: string;
  licenseType: string;
  amount: number;
}) {
  if (!process.env.SMTP_USER) return;

  await transporter.sendMail({
    from: FROM,
    to: opts.producerEmail,
    subject: `💰 BeatMarket — 你的伴奏「${opts.beatTitle}」剛被購買了！`,
    html: `
      <div style="background:#080810;color:#f0f0ff;padding:40px;font-family:sans-serif;max-width:560px;margin:0 auto;border-radius:12px">
        <h1 style="color:#34d399;margin-bottom:8px">有人購買了你的伴奏！</h1>
        <p style="color:#8888aa;margin-bottom:24px">嗨 ${opts.producerName}，恭喜！</p>
        <div style="background:#13131e;padding:16px;border-radius:8px;margin-bottom:16px">
          <p><strong>伴奏：</strong> ${opts.beatTitle}</p>
          <p><strong>授權：</strong> ${opts.licenseType} License</p>
          <p><strong>買家：</strong> ${opts.buyerName}</p>
          <p><strong>金額：</strong> NT$${opts.amount.toLocaleString()}</p>
        </div>
        <p style="color:#555;font-size:12px">款項將依平台條款結算。</p>
      </div>`,
  });
}
