-- Supabase Database Schema for Sovereign Funding
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (linked to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
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

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- 2. ORDERS TABLE (for IntaSend payments)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  tier_name TEXT,
  status TEXT DEFAULT 'pending',
  intasend_ref TEXT,
  checkout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON orders;
DROP POLICY IF EXISTS "Service role can update orders" ON orders;

-- Policy: Users can view their own orders (by email)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_email = auth.jwt()->>'email');

-- Policy: Service role can insert orders (for backend)
CREATE POLICY "Service role can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update orders (for backend)
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_intasend_ref ON orders(intasend_ref);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 3. TRADING STATES TABLE (for live trading data)
-- ============================================
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

-- Enable Row Level Security
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

-- Enable Realtime for this table (ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE trading_states;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Grant permissions
GRANT ALL ON trading_states TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE trading_states_id_seq TO anon, authenticated;

-- ============================================
-- 4. USER ACCOUNTS TABLE (for Deriv API credentials per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_accounts (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  deriv_api_token TEXT,  -- Encrypted in production
  deriv_account_id TEXT,
  broker_type TEXT DEFAULT 'deriv',
  broker_credentials JSONB, -- e.g. {"token": "abc", "account_id": "CR12345"}
  currency TEXT DEFAULT 'USD',
  locked_at TIMESTAMP WITH TIME ZONE,
  evaluation_started_at TIMESTAMP WITH TIME ZONE,
  start_balance DECIMAL(15, 2) DEFAULT 10000.00,
  account_tier TEXT DEFAULT 'standard',
  account_size DECIMAL(15, 2) DEFAULT 100000.00,
  daily_loss_limit DECIMAL(15, 2) DEFAULT 5000.00,
  max_drawdown_limit DECIMAL(15, 2) DEFAULT 10000.00,
  profit_target DECIMAL(15, 2) DEFAULT 10000.00,
  challenge_status TEXT DEFAULT 'active',  -- 'active', 'passed', 'breached'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own account" ON user_accounts;
DROP POLICY IF EXISTS "Users can update own account" ON user_accounts;
DROP POLICY IF EXISTS "Users can insert own account" ON user_accounts;
DROP POLICY IF EXISTS "Service role can manage accounts" ON user_accounts;

-- Policy: Users can view their own account
CREATE POLICY "Users can view own account" ON user_accounts
  FOR SELECT USING (user_email = auth.jwt()->>'email');

-- Policy: Users can update their own account (e.g., add Deriv token)
CREATE POLICY "Users can update own account" ON user_accounts
  FOR UPDATE USING (user_email = auth.jwt()->>'email');

-- Policy: Users can insert their own account (e.g., first-time token add)
CREATE POLICY "Users can insert own account" ON user_accounts
  FOR INSERT WITH CHECK (user_email = auth.jwt()->>'email');

-- Policy: Service role can do everything (for Python backend)
CREATE POLICY "Service role can manage accounts" ON user_accounts
  FOR ALL USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_active ON user_accounts(is_active);

-- Enable Realtime for this table (for live challenge status updates)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_accounts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Grant permissions
GRANT ALL ON user_accounts TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_accounts_id_seq TO anon, authenticated;

-- ============================================
-- 5. SITE CONTENT TABLE (for dynamic CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can view site content" ON site_content;

-- Policy: Service role can manage all content (for admin CMS)
CREATE POLICY "Service role can manage site content" ON site_content
  FOR ALL USING (true);

-- Policy: Authenticated users can view content (for frontend)
CREATE POLICY "Authenticated users can view site content" ON site_content
  FOR SELECT USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_category ON site_content(category);

-- Grant permissions
GRANT ALL ON site_content TO anon, authenticated;
