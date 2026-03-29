# API 規格文件

**Base URL：** `http://localhost:4000/api`
**認證方式：** Bearer Token (JWT)
**版本：** v1

---

## 認證

### POST /auth/register
製作人註冊

**Request Body:**
```json
{
  "name": "Leo",
  "email": "leo@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOi...",
  "producer": { "id": "uuid", "name": "Leo", "email": "..." }
}
```

---

### POST /auth/login
製作人登入

**Request Body:**
```json
{ "email": "leo@example.com", "password": "password123" }
```

**Response 200:**
```json
{ "token": "eyJhbGciOi...", "producer": { ... } }
```

---

## 製作人

### GET /producers
取得所有製作人列表

**Response 200:**
```json
{
  "producers": [
    {
      "id": "uuid",
      "name": "Leo",
      "avatar_url": "/uploads/avatars/...",
      "genres": ["Trap", "R&B"],
      "bio": "...",
      "beat_count": 12
    }
  ]
}
```

---

### GET /producers/:id
取得製作人詳細資料

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Leo",
  "bio": "...",
  "avatar_url": "...",
  "banner_url": "...",
  "genres": ["Trap", "R&B"],
  "credits": [
    { "artist": "某歌手", "song": "某首歌", "year": 2024 }
  ],
  "social_links": { "instagram": "https://..." },
  "equipment": ["FL Studio 21", "Serum"],
  "beats": [ ... ],
  "showcase": [ ... ]
}
```

---

### PUT /producers/:id（需認證）
更新製作人個人資料

---

### POST /producers/:id/avatar（需認證）
上傳大頭照，multipart/form-data

---

## 伴奏 / 作品

### GET /beats
取得伴奏列表（支援篩選）

**Query Parameters:**
```
genre=Trap
mood=Dark
bpm_min=80
bpm_max=120
key=Am
price_min=500
price_max=3000
license_type=basic
producer_id=uuid
q=keyword
sort=newest | plays | price_asc | price_desc
page=1
limit=20
```

**Response 200:**
```json
{
  "beats": [
    {
      "id": "uuid",
      "title": "Midnight Trap",
      "cover_url": "...",
      "preview_url": "...",
      "genre": "Trap",
      "mood": "Dark",
      "bpm": 140,
      "key": "Am",
      "play_count": 1234,
      "producer": { "id": "...", "name": "Leo", "avatar_url": "..." },
      "licenses": [
        { "type": "basic", "price": 500 },
        { "type": "premium", "price": 1500 },
        { "type": "exclusive", "price": 8000 }
      ],
      "is_sold_out": false
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### GET /beats/:id
取得單一伴奏詳細資料

---

### POST /beats（需認證）
上傳新伴奏，multipart/form-data

**Form Fields:**
```
title, description, genre, mood, bpm, key, tags, type
preview_file (音訊)
full_audio_file (音訊，選填)
cover_image (圖片)
licenses (JSON 陣列)
```

---

### PUT /beats/:id（需認證）
更新伴奏資料

---

### DELETE /beats/:id（需認證）
刪除伴奏

---

### POST /beats/:id/play
增加播放次數

---

## 購物車與訂單

### POST /orders
建立訂單

**Request Body:**
```json
{
  "buyer_email": "buyer@example.com",
  "buyer_name": "小明",
  "items": [
    { "beat_id": "uuid", "license_id": "uuid" }
  ],
  "payment_method": "ecpay_credit"
}
```

**Response 201:**
```json
{
  "order_id": "uuid",
  "total": 2000,
  "payment_url": "https://payment.ecpay.com.tw/..."
}
```

---

### GET /orders/:id
查詢訂單狀態

---

### POST /orders/ecpay/callback
綠界金流付款回調（由綠界伺服器呼叫）

---

### GET /orders/:id/download/:token
下載已購買的伴奏檔案

---

## 聯絡製作人

### POST /contacts
發送訊息給製作人

**Request Body:**
```json
{
  "producer_id": "uuid",
  "sender_name": "小明",
  "sender_email": "sender@example.com",
  "subject": "想詢問客製化編曲",
  "message": "...",
  "type": "beat_custom",
  "beat_id": "uuid（選填）"
}
```

---

### GET /contacts（需認證）
製作人查看收到的訊息

---

## 錯誤格式

```json
{
  "error": "UNAUTHORIZED",
  "message": "請先登入",
  "status": 401
}
```

| 錯誤碼 | 說明 |
|--------|------|
| 400 | 請求格式錯誤 |
| 401 | 未登入 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 409 | 資料衝突（如 Email 已存在）|
| 500 | 伺服器錯誤 |
