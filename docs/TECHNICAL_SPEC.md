# 技術規格書（Technical Specification）

**版本：** v1.0
**日期：** 2026-03-30

---

## 1. 系統架構概覽

```
使用者瀏覽器
    │
    ▼
[Next.js Frontend :3000]
    │  API 請求
    ▼
[Express Backend :4000]
    │
    ├──► [PostgreSQL :5432]
    ├──► [本地檔案系統 D:/BeatMarketplace/uploads/]
    ├──► [綠界 ECPay API]
    └──► [Stripe API（選配）]
```

---

## 2. 前端技術規格

### 框架與版本
- **Next.js** 14（App Router）
- **React** 18
- **TailwindCSS** 3.x
- **TypeScript** 5.x

### 主要套件
| 套件 | 用途 |
|------|------|
| howler.js | 音訊播放控制 |
| zustand | 購物車、播放器狀態管理 |
| react-hook-form | 表單處理 |
| zod | 表單驗證 |
| axios | HTTP 請求 |
| lucide-react | Icon 圖標 |
| framer-motion | 動畫效果 |
| @radix-ui | 無障礙 UI 元件 |

### 設計系統
```css
/* 配色 */
--bg-primary:    #0F0F0F;
--bg-secondary:  #1A1A1A;
--bg-card:       #242424;
--accent:        #7C3AED;  /* 主色：紫 */
--accent-hover:  #6D28D9;
--text-primary:  #FFFFFF;
--text-muted:    #A0A0A0;
--border:        #333333;
--success:       #10B981;
--error:         #EF4444;

/* 字體 */
--font-main:     'Inter', sans-serif;
--font-mono:     'JetBrains Mono', monospace;
```

### 頁面路由
```
/                       首頁
/beats                  伴奏市集
/beats/[id]             伴奏詳細頁
/producers              製作人列表
/producers/[id]         製作人個人頁
/cart                   購物車
/checkout               結帳
/checkout/success       付款成功
/admin                  後台（需登入）
/admin/beats            管理作品
/admin/orders           查看訂單
/admin/profile          編輯個人資料
/auth/login             登入
/auth/register          註冊
```

---

## 3. 後端技術規格

### 框架與版本
- **Node.js** 20 LTS
- **Express** 4.x
- **TypeScript** 5.x

### 主要套件
| 套件 | 用途 |
|------|------|
| pg / node-postgres | PostgreSQL 連線 |
| jsonwebtoken | JWT 認證 |
| bcrypt | 密碼加密 |
| multer | 檔案上傳處理 |
| fluent-ffmpeg | 音訊處理（截取試聽片段）|
| nodemailer | 發送 Email |
| cors | CORS 設定 |
| helmet | 安全 headers |
| express-rate-limit | API 限流 |
| uuid | 產生 UUID |

### 目錄結構
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── producers.ts
│   │   ├── beats.ts
│   │   ├── orders.ts
│   │   └── contacts.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── producerController.ts
│   │   ├── beatController.ts
│   │   ├── orderController.ts
│   │   └── contactController.ts
│   ├── models/
│   │   ├── Producer.ts
│   │   ├── Beat.ts
│   │   ├── Order.ts
│   │   └── Contact.ts
│   ├── middleware/
│   │   ├── auth.ts          # JWT 驗證中間件
│   │   ├── upload.ts        # Multer 設定
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── ecpayService.ts  # 綠界金流
│   │   ├── emailService.ts  # Email 通知
│   │   └── audioService.ts  # 音訊處理
│   ├── db/
│   │   ├── connection.ts
│   │   └── migrations/
│   └── app.ts
├── package.json
└── tsconfig.json
```

---

## 4. 資料庫規格

- **引擎：** PostgreSQL 16
- **連線方式：** node-postgres (pg)
- **Port：** 5432

### 索引策略
```sql
-- 搜尋常用欄位建立索引
CREATE INDEX idx_beats_genre ON beats(genre);
CREATE INDEX idx_beats_mood ON beats(mood);
CREATE INDEX idx_beats_bpm ON beats(bpm);
CREATE INDEX idx_beats_producer ON beats(producer_id);
CREATE INDEX idx_beats_type ON beats(type);
CREATE INDEX idx_beats_created ON beats(created_at DESC);
CREATE INDEX idx_beats_plays ON beats(play_count DESC);

-- 全文搜尋
CREATE INDEX idx_beats_search ON beats
  USING GIN(to_tsvector('english', title));
```

---

## 5. 檔案儲存規格

### 目錄結構
```
D:/BeatMarketplace/uploads/
├── beats/
│   ├── preview/      # 試聽用 MP3（128kbps）
│   └── full/         # 完整購買版 WAV
├── avatars/          # 製作人大頭照
├── banners/          # 製作人 Banner
└── covers/           # 作品封面圖
```

### 檔案限制
| 類型 | 格式 | 最大大小 |
|------|------|---------|
| 試聽音訊 | MP3 | 20 MB |
| 完整音訊 | WAV | 200 MB |
| 封面圖 | JPG/PNG/WEBP | 5 MB |
| 大頭照 | JPG/PNG | 2 MB |
| Banner | JPG/PNG | 5 MB |

### 音訊處理流程
```
上傳 WAV/MP3
    │
    ▼
ffmpeg 處理
    ├── 產生試聽版（前60秒 + 水印 beep）→ preview/
    └── 原始完整版 → full/
```

---

## 6. 金流整合規格

### 綠界 ECPay（主要）
- 使用 ECPay SDK for Node.js
- 支援：信用卡、Line Pay、街口支付、ATM
- 測試環境：`https://payment-stage.ecpay.com.tw`
- 正式環境：`https://payment.ecpay.com.tw`

### 流程
```
1. 前端送出訂單
2. 後端建立訂單 → 呼叫 ECPay API 取得付款 URL
3. 導向 ECPay 付款頁面
4. 用戶付款完成
5. ECPay 回調後端 /orders/ecpay/callback
6. 後端驗簽 → 更新訂單狀態 → 產生下載 token
7. 前端轉到成功頁面 → 顯示下載連結
```

---

## 7. 安全規格

| 項目 | 實作方式 |
|------|---------|
| 密碼儲存 | bcrypt，rounds=12 |
| JWT | 有效期 7 天，使用 RS256 |
| 上傳檔案 | 驗證 MIME type，禁止執行檔 |
| 下載連結 | 一次性 token，24小時過期 |
| API 限流 | 每 IP 每分鐘 60 次 |
| CORS | 只允許前端域名 |
| SQL Injection | 使用 parameterized queries |
| XSS | 輸入 sanitize + CSP headers |

---

## 8. 部署規格（開發環境）

### docker-compose.yml 服務
```
services:
  postgres     # 資料庫 :5432
  backend      # API :4000
  frontend     # Next.js :3000
```

### 環境變數（.env）
```
# 資料庫
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beatmarketplace
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret

# 綠界
ECPAY_MERCHANT_ID=
ECPAY_HASH_KEY=
ECPAY_HASH_IV=

# Stripe（選配）
STRIPE_SECRET_KEY=

# Email（購買通知）
SMTP_HOST=smtp.gmail.com
SMTP_USER=
SMTP_PASS=

# 檔案路徑
UPLOADS_PATH=D:/BeatMarketplace/uploads
```
