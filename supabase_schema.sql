-- Run this in your Supabase SQL Editor to create the tables

-- ============================================
-- USER_ACCOUNTS TABLE - Stores broker account & challenge params
-- ============================================
CREATE TABLE IF NOT EXISTS user_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    
    -- Broker Configuration
    broker_type TEXT DEFAULT 'deriv',             -- 'deriv', 'mt4', 'mt5', 'ctrader'
    broker_credentials JSONB,                     -- {token, server, login, etc.}
    deriv_api_token TEXT,                         -- Legacy/direct Deriv token
    deriv_account_id TEXT,                        -- Populated by engine after auth
    
    -- Challenge Parameters
    account_size NUMERIC(18, 2) DEFAULT 0,        -- Starting capital (e.g., 10000)
    max_drawdown_limit NUMERIC(18, 2) DEFAULT 0,  -- Max loss allowed (e.g., 1000 = 10%)
    profit_target NUMERIC(18, 2) DEFAULT 0,       -- Target profit (e.g., 800 = 8%)
    challenge_status TEXT DEFAULT 'active',       -- active, breached, passed
    
    -- Evaluation Timestamps (preserved by engine)
    evaluation_started_at TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_broker_type ON user_accounts(broker_type);
CREATE INDEX IF NOT EXISTS idx_user_accounts_is_active ON user_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_user_accounts_deriv_id ON user_accounts(deriv_account_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_challenge_status ON user_accounts(challenge_status);

-- ============================================
-- TRADING STATES TABLE - Live trading data per user
-- ============================================
CREATE TABLE IF NOT EXISTS trading_states (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    balance NUMERIC(18, 8) DEFAULT 0.0,
    equity NUMERIC(18, 8) DEFAULT 0.0,
    daily_pnl NUMERIC(18, 8) DEFAULT 0.0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'active',  -- active, breached, passed, error
    last_trade_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_states_user_email ON trading_states(user_email);
CREATE INDEX IF NOT EXISTS idx_trading_states_status ON trading_states(status);

-- ============================================
-- PROFIT TABLE - Trade history for P&L calculation
-- ============================================
CREATE TABLE IF NOT EXISTS profit_table (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    contract_id TEXT,
    profit NUMERIC(18, 8) NOT NULL,
    buy_price NUMERIC(18, 8),
    sell_price NUMERIC(18, 8),
    symbol TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profit_table_user_email ON profit_table(user_email);
CREATE INDEX IF NOT EXISTS idx_profit_table_created_at ON profit_table(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_table ENABLE ROW LEVEL SECURITY;

-- Service role can manage all accounts (for Python engine)
CREATE POLICY "Service role can manage accounts" ON user_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update trading states" ON trading_states
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage profit table" ON profit_table
    FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own data
CREATE POLICY "Users can read own account" ON user_accounts
    FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users can read own trading state" ON trading_states
    FOR SELECT USING (auth.email() = user_email);

-- ============================================
-- INSERT TEST USER WITH CHALLENGE PARAMETERS
-- ============================================
INSERT INTO user_accounts (
    user_email, 
    broker_type,
    deriv_api_token, 
    account_size, 
    max_drawdown_limit, 
    profit_target,
    is_active
) VALUES (
    'trader1@example.com', 
    'deriv',
    'eJKGvjEgqD6uCns', 
    10000.00,
    1000.00,
    800.00,
    true
) ON CONFLICT (user_email) DO UPDATE SET
    broker_type = EXCLUDED.broker_type,
    account_size = EXCLUDED.account_size,
    max_drawdown_limit = EXCLUDED.max_drawdown_limit,
    profit_target = EXCLUDED.profit_target;

-- ============================================
-- MIGRATION: If tables already exist, run these:
-- ============================================
-- ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS broker_type TEXT DEFAULT 'deriv';
-- ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS broker_credentials JSONB;
-- ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS evaluation_started_at TIMESTAMPTZ;
-- ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
-- ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS display_name TEXT;
