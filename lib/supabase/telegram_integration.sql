-- telegram_integration.sql

-- 1. Create telegram_sessions table
CREATE TABLE IF NOT EXISTS telegram_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '24 hours'
);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_token ON telegram_sessions(token);

-- Update RLS policies (allow service role only, or anon read if you prefer)
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can do all on telegram_sessions" 
  ON telegram_sessions FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 2. Add telegram_token to sticker_jobs
ALTER TABLE sticker_jobs ADD COLUMN IF NOT EXISTS telegram_token TEXT;
