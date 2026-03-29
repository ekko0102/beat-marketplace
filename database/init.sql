-- BeatMarketplace Database Schema
-- Version: 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- PRODUCERS
-- =====================
CREATE TABLE IF NOT EXISTS producers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  bio               TEXT,
  avatar_url        VARCHAR(500),
  banner_url        VARCHAR(500),
  genres            TEXT[] DEFAULT '{}',
  mood_tags         TEXT[] DEFAULT '{}',
  credits           JSONB DEFAULT '[]',
  social_links      JSONB DEFAULT '{}',
  contact_email     VARCHAR(255),
  years_experience  INTEGER,
  equipment         TEXT[] DEFAULT '{}',
  custom_price_min  INTEGER,
  custom_price_max  INTEGER,
  delivery_days     INTEGER,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- BEATS
-- =====================
CREATE TABLE IF NOT EXISTS beats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id       UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  cover_url         VARCHAR(500),
  preview_url       VARCHAR(500) NOT NULL,
  full_audio_url    VARCHAR(500),
  type              VARCHAR(20) NOT NULL CHECK (type IN ('beat', 'showcase')),
  genre             VARCHAR(50),
  mood              VARCHAR(50),
  bpm               INTEGER,
  key               VARCHAR(10),
  tags              TEXT[] DEFAULT '{}',
  play_count        INTEGER DEFAULT 0,
  is_sold_out       BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats(genre);
CREATE INDEX IF NOT EXISTS idx_beats_mood ON beats(mood);
CREATE INDEX IF NOT EXISTS idx_beats_bpm ON beats(bpm);
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_id);
CREATE INDEX IF NOT EXISTS idx_beats_type ON beats(type);
CREATE INDEX IF NOT EXISTS idx_beats_created ON beats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beats_plays ON beats(play_count DESC);

-- =====================
-- LICENSES
-- =====================
CREATE TABLE IF NOT EXISTS licenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id           UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  type              VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium', 'exclusive')),
  price             INTEGER NOT NULL,
  description       TEXT,
  file_formats      TEXT[] DEFAULT '{"MP3"}',
  distribution_limit INTEGER,
  is_available      BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ORDERS
-- =====================
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_email       VARCHAR(255) NOT NULL,
  buyer_name        VARCHAR(100),
  total_amount      INTEGER NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method    VARCHAR(50),
  payment_id        VARCHAR(255),
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ORDER ITEMS
-- =====================
CREATE TABLE IF NOT EXISTS order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  beat_id           UUID NOT NULL REFERENCES beats(id),
  license_id        UUID NOT NULL REFERENCES licenses(id),
  price             INTEGER NOT NULL,
  download_url      VARCHAR(500),
  download_token    VARCHAR(255) UNIQUE,
  download_count    INTEGER DEFAULT 0,
  download_expires  TIMESTAMPTZ
);

-- =====================
-- CONTACTS
-- =====================
CREATE TABLE IF NOT EXISTS contacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id       UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  sender_name       VARCHAR(100) NOT NULL,
  sender_email      VARCHAR(255) NOT NULL,
  subject           VARCHAR(200),
  message           TEXT NOT NULL,
  type              VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'beat_custom', 'collab')),
  beat_id           UUID REFERENCES beats(id),
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Auto-update updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER producers_updated_at BEFORE UPDATE ON producers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER beats_updated_at BEFORE UPDATE ON beats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
