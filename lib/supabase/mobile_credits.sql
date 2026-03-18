-- mobile_credits.sql
-- Run this in Supabase SQL Editor if not already done in Step 1 migration
-- NOTE: user_id is TEXT (RevenueCat anonymous ID), not UUID

-- 1. User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on user_credits"
  ON user_credits FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Credit transactions (for idempotency)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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
CREATE OR REPLACE FUNCTION add_user_credits(p_user_id TEXT, p_credits INTEGER)
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

-- 4. RPC function to atomically check and deduct 1 credit
CREATE OR REPLACE FUNCTION check_and_deduct_credit(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_credits IS NULL OR current_credits < 1 THEN
    RETURN FALSE;
  END IF;

  UPDATE user_credits
  SET credits = credits - 1, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;
