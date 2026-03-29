# 資料庫設計文件

**資料庫：** PostgreSQL
**版本：** v1.0

---

## ER Diagram（文字版）

```
producers ──< beats ──< order_items >── orders
producers ──< contacts
beats ──< licenses
```

---

## 資料表定義

### producers（製作人）

```sql
CREATE TABLE producers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  bio               TEXT,
  avatar_url        VARCHAR(500),
  banner_url        VARCHAR(500),
  genres            TEXT[],                  -- 擅長曲風，陣列
  mood_tags         TEXT[],                  -- 擅長情緒標籤
  credits           JSONB,                   -- [{"artist": "周杰倫", "song": "稻香", "year": 2020}]
  social_links      JSONB,                   -- {"instagram": "...", "youtube": "...", "soundcloud": "..."}
  contact_email     VARCHAR(255),            -- 公開聯絡信箱（可與帳號不同）
  years_experience  INTEGER,
  equipment         TEXT[],                  -- ["FL Studio", "Serum", "Focusrite 2i2"]
  custom_price_min  INTEGER,                 -- 客製化編曲最低報價（NTD）
  custom_price_max  INTEGER,
  delivery_days     INTEGER,                 -- 承諾交件天數
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

### beats（伴奏 / 作品）

```sql
CREATE TABLE beats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id       UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  cover_url         VARCHAR(500),
  preview_url       VARCHAR(500) NOT NULL,   -- 試聽用（可加水印）
  full_audio_url    VARCHAR(500),            -- 購買後完整版
  type              VARCHAR(20) NOT NULL     -- 'beat'（販售）| 'showcase'（展示）
                    CHECK (type IN ('beat', 'showcase')),
  genre             VARCHAR(50),             -- 主曲風
  mood              VARCHAR(50),             -- 情緒
  bpm               INTEGER,
  key               VARCHAR(10),             -- 音調，如 'Am', 'C', 'F#m'
  tags              TEXT[],                  -- 自定義標籤
  play_count        INTEGER DEFAULT 0,
  is_sold_out       BOOLEAN DEFAULT false,   -- Exclusive 賣出後標記
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_beats_genre ON beats(genre);
CREATE INDEX idx_beats_mood ON beats(mood);
CREATE INDEX idx_beats_bpm ON beats(bpm);
CREATE INDEX idx_beats_producer ON beats(producer_id);
```

### licenses（授權方案）

```sql
CREATE TABLE licenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id           UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  type              VARCHAR(20) NOT NULL
                    CHECK (type IN ('basic', 'premium', 'exclusive')),
  price             INTEGER NOT NULL,        -- NTD
  description       TEXT,                   -- 授權說明
  file_format       TEXT[],                 -- ['MP3'] | ['MP3', 'WAV'] | ['MP3', 'WAV', 'Stems']
  distribution_limit INTEGER,               -- 發行量限制，null = 無限制
  is_available      BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### orders（訂單）

```sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_email       VARCHAR(255) NOT NULL,
  buyer_name        VARCHAR(100),
  total_amount      INTEGER NOT NULL,        -- NTD
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method    VARCHAR(50),             -- 'ecpay_credit', 'linepay', 'jkopay', 'stripe'
  payment_id        VARCHAR(255),            -- 金流交易 ID
  paid_at           TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### order_items（訂單明細）

```sql
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  beat_id           UUID NOT NULL REFERENCES beats(id),
  license_id        UUID NOT NULL REFERENCES licenses(id),
  price             INTEGER NOT NULL,        -- 下單當時的價格（快照）
  download_url      VARCHAR(500),            -- 付款後產生的下載連結
  download_token    VARCHAR(255) UNIQUE,     -- 安全下載 token
  download_count    INTEGER DEFAULT 0,
  download_expires  TIMESTAMP               -- 下載連結到期時間
);
```

### contacts（聯絡訊息）

```sql
CREATE TABLE contacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id       UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  sender_name       VARCHAR(100) NOT NULL,
  sender_email      VARCHAR(255) NOT NULL,
  subject           VARCHAR(200),
  message           TEXT NOT NULL,
  type              VARCHAR(20) DEFAULT 'general'
                    CHECK (type IN ('general', 'beat_custom', 'collab')),
  beat_id           UUID REFERENCES beats(id),  -- 如果是針對特定 beat
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

---

## 篩選器對應欄位

| 篩選項目 | DB 欄位 | 查詢方式 |
|----------|---------|---------|
| 曲風 | beats.genre | WHERE genre = $1 |
| 情緒 | beats.mood | WHERE mood = $1 |
| BPM | beats.bpm | WHERE bpm BETWEEN $1 AND $2 |
| 音調 | beats.key | WHERE key = $1 |
| 價格 | licenses.price | WHERE price BETWEEN $1 AND $2 |
| 授權類型 | licenses.type | JOIN licenses WHERE type = $1 |
| 製作人 | beats.producer_id | WHERE producer_id = $1 |
| 關鍵字 | title + tags | WHERE title ILIKE $1 OR $1 = ANY(tags) |
| 排序最新 | beats.created_at | ORDER BY created_at DESC |
| 排序播放數 | beats.play_count | ORDER BY play_count DESC |
| 排序價格 | licenses.price | ORDER BY min_price ASC |

---

## 初始資料（Seed Data）

### 曲風選項（Genre）
```
Trap, R&B, Pop, Hip-Hop, Lo-fi, Drill, Afrobeats,
C-Pop, K-Pop, EDM, House, Jazz, Soul, Reggaeton,
Phonk, Boom Bap, Cloud Rap, Emo Rap
```

### 情緒選項（Mood）
```
Dark, Chill, Aggressive, Happy, Romantic, Melancholic,
Motivational, Mysterious, Dreamy, Energetic, Sad, Epic
```

### 音調選項（Key）
```
C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B
Am, Bm, Cm, Dm, Em, Fm, Gm (小調)
```
