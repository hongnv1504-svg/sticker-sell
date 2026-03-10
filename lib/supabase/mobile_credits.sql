-- mobile_credits.sql
-- Run this in Supabase SQL Editor if not already done in Step 1 migration

-- 1. User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Credit transactions (for idempotency)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  credits_added INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on credit_transactions"
  ON credit_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. RPC function to atomically add credits
CREATE OR REPLACE FUNCTION add_user_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits, updated_at)
  VALUES (p_user_id, p_credits, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits = user_credits.credits + p_credits,
    updated_at = now();
END;
$$;
