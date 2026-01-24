-- Add missing columns to existing user_accounts table
-- Run this in Supabase SQL Editor

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions for profiles
GRANT ALL ON profiles TO anon, authenticated;

-- Add currency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_accounts'
                   AND column_name = 'currency') THEN
        ALTER TABLE user_accounts ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
END $$;

-- Add start_balance column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_accounts'
                   AND column_name = 'start_balance') THEN
        ALTER TABLE user_accounts ADD COLUMN start_balance DECIMAL(15, 2) DEFAULT 10000.00;
    END IF;
END $$;

-- Add max_drawdown_limit column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_accounts'
                   AND column_name = 'max_drawdown_limit') THEN
        ALTER TABLE user_accounts ADD COLUMN max_drawdown_limit DECIMAL(15, 2) DEFAULT 1000.00;
    END IF;
END $$;

-- Add profit_target column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_accounts'
                   AND column_name = 'profit_target') THEN
        ALTER TABLE user_accounts ADD COLUMN profit_target DECIMAL(15, 2) DEFAULT 1000.00;
    END IF;
END $$;

-- Add min_trading_days column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_accounts'
                   AND column_name = 'min_trading_days') THEN
        ALTER TABLE user_accounts ADD COLUMN min_trading_days INTEGER DEFAULT 5;
    END IF;
END $$;

-- Ensure trading_states table exists and has correct structure
CREATE TABLE IF NOT EXISTS trading_states (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  equity DECIMAL(15, 2) DEFAULT 0.00,
  daily_pnl DECIMAL(15, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'inactive',
  last_trade_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for trading_states if not already enabled
ALTER TABLE trading_states ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own trading state" ON trading_states;
DROP POLICY IF EXISTS "Users can insert own trading state" ON trading_states;
DROP POLICY IF EXISTS "Users can update own trading state" ON trading_states;
DROP POLICY IF EXISTS "Service role can insert trading states" ON trading_states;
DROP POLICY IF EXISTS "Service role can update trading states" ON trading_states;

-- Policy: Users can view their own trading state
CREATE POLICY "Users can view own trading state" ON trading_states
  FOR SELECT USING (user_email = auth.jwt()->>'email');

-- Policy: Users can insert their own trading state (for client-side bootstrap)
CREATE POLICY "Users can insert own trading state" ON trading_states
  FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

-- Policy: Users can update their own trading state (for client-side bootstrap)
CREATE POLICY "Users can update own trading state" ON trading_states
  FOR UPDATE USING (user_email = auth.jwt()->>'email');

-- Policy: Service role can insert trading states (for Python backend)
CREATE POLICY "Service role can insert trading states" ON trading_states
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update trading states (for Python backend)
CREATE POLICY "Service role can update trading states" ON trading_states
  FOR UPDATE USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trading_states_user_email ON trading_states(user_email);

-- Enable Realtime for trading_states table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE trading_states;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Grant permissions for trading_states
GRANT ALL ON trading_states TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE trading_states_id_seq TO anon, authenticated;

-- Verify the updated user_accounts table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_accounts'
ORDER BY ordinal_position;