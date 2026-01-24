-- Create the site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Data with ALL original site content
INSERT INTO public.site_content (key, value, category, label)
VALUES 
    -- Admin Settings
    ('admin_password', 'sovereign2026!', 'admin', 'Admin Panel Password'),
    
    -- Hero Section
    ('home_hero_title', 'SOVEREIGN FUNDING.', 'home', 'Hero Title Line 1'),
    ('home_hero_title_2', 'TRADE OUR CAPITAL.', 'home', 'Hero Title Line 2'),
    ('home_hero_subtitle', 'Prove your skills. Get funded up to $200,000. Keep up to 90% of the profits. Institutional-grade infrastructure for serious traders.', 'home', 'Hero Subtitle'),
    ('home_hero_badge', 'Accepting New Traders', 'home', 'Hero Badge Text'),
    ('home_cta_button', 'Start Evaluation', 'buttons', 'Primary CTA Button'),
    ('home_cta_button_2', 'View Offering', 'buttons', 'Secondary CTA Button'),
    
    -- Trust Indicators / Stats
    ('stat_traders', '50K+', 'stats', 'Traders Count'),
    ('stat_traders_label', 'Traders', 'stats', 'Traders Label'),
    ('stat_payouts', '$15M+', 'stats', 'Total Payouts'),
    ('stat_payouts_label', 'Payouts', 'stats', 'Payouts Label'),
    ('stat_countries', '100+', 'stats', 'Countries Count'),
    ('stat_countries_label', 'Countries', 'stats', 'Countries Label'),
    ('stat_payout_time', '< 4h', 'stats', 'Average Payout Time'),
    ('stat_payout_time_label', 'Avg Payout Time', 'stats', 'Payout Time Label'),
    
    -- Navigation
    ('nav_evaluation', 'Evaluation', 'nav', 'Nav - Evaluation'),
    ('nav_scaling', 'Scaling Plan', 'nav', 'Nav - Scaling Plan'),
    ('nav_rules', 'Trading Rules', 'nav', 'Nav - Trading Rules'),
    ('nav_faq', 'FAQ', 'nav', 'Nav - FAQ'),
    ('nav_portal', 'Client Portal', 'nav', 'Nav - Client Portal'),
    ('nav_dashboard', 'Dashboard', 'nav', 'Nav - Dashboard'),
    ('nav_settings', 'Settings', 'nav', 'Nav - Settings'),
    ('nav_logout', 'Logout', 'nav', 'Nav - Logout'),
    
    -- Footer
    ('footer_tagline', 'Empowering traders worldwide with capital and institutional-grade technology.', 'footer', 'Footer Tagline'),
    ('footer_copyright', 'Sovereign Funding. All rights reserved. Trading involves significant risk.', 'footer', 'Footer Copyright'),
    
    -- About
    ('about_text', 'Sovereign Funding is Kenya''s premier proprietary firm, dedicated to empowering local talent with global capital.', 'home', 'About Us Text'),
    
    -- Trading Rules Page
    ('rules_page_title', 'TRADING OBJECTIVES & RULES', 'rules', 'Rules Page Title'),
    ('rules_page_subtitle', 'Adherence to these parameters is required to pass the evaluation and maintain a funded account.', 'rules', 'Rules Page Subtitle'),
    ('rule_1_title', 'Max Daily Loss', 'rules', 'Rule 1 Title'),
    ('rule_1_value', '5%', 'rules', 'Rule 1 Value'),
    ('rule_1_detail', 'Hard Breach. Calculated based on the higher of the initial balance or equity at the start of the day.', 'rules', 'Rule 1 Detail'),
    ('rule_2_title', 'Max Total Drawdown', 'rules', 'Rule 2 Title'),
    ('rule_2_value', '10%', 'rules', 'Rule 2 Value'),
    ('rule_2_detail', 'Hard Breach. Trailing drawdown calculated from the highest high water mark.', 'rules', 'Rule 2 Detail'),
    ('rule_3_title', 'Profit Target', 'rules', 'Rule 3 Title'),
    ('rule_3_value', '10% / 5%', 'rules', 'Rule 3 Value'),
    ('rule_3_detail', 'Phase 1 requires 10% profit. Phase 2 requires 5% profit to pass.', 'rules', 'Rule 3 Detail'),
    ('rule_4_title', 'Minimum Trading Days', 'rules', 'Rule 4 Title'),
    ('rule_4_value', '5 Days', 'rules', 'Rule 4 Value'),
    ('rule_4_detail', 'You must trade for a minimum of 5 days in each phase to advance.', 'rules', 'Rule 4 Detail'),
    ('rule_5_title', 'News Trading', 'rules', 'Rule 5 Title'),
    ('rule_5_value', 'Allowed', 'rules', 'Rule 5 Value'),
    ('rule_5_detail', 'Trading during high-impact news events is permitted, subject to slippage risks.', 'rules', 'Rule 5 Detail'),
    ('rule_6_title', 'Overnight & Weekend', 'rules', 'Rule 6 Title'),
    ('rule_6_value', 'Allowed', 'rules', 'Rule 6 Value'),
    ('rule_6_detail', 'Holding positions overnight and over the weekend is fully permitted.', 'rules', 'Rule 6 Detail'),
    
    -- FAQ Page
    ('faq_page_title', 'FREQUENTLY ASKED QUESTIONS', 'faq', 'FAQ Page Title'),
    ('faq_page_subtitle', 'Everything you need to know about becoming a funded trader with Sovereign Funding.', 'faq', 'FAQ Page Subtitle'),
    ('faq_1_q', 'Do you accept M-Pesa?', 'faq', 'FAQ Question 1'),
    ('faq_1_a', 'Yes, instant automated processing via TinyPesa.', 'faq', 'FAQ Answer 1'),
    ('faq_2_q', 'What is the profit split?', 'faq', 'FAQ Question 2'),
    ('faq_2_a', 'We offer a generous 80/20 profit split in favor of the trader.', 'faq', 'FAQ Answer 2'),
    ('faq_3_q', 'How long does the evaluation take?', 'faq', 'FAQ Question 3'),
    ('faq_3_a', 'There is no minimum or maximum time limit. You can pass in as little as 5 days if all objectives are met.', 'faq', 'FAQ Answer 3'),
    ('faq_4_q', 'What platforms can I use?', 'faq', 'FAQ Question 4'),
    ('faq_4_a', 'We currently support trading via Deriv. More platforms will be added in the future.', 'faq', 'FAQ Answer 4'),
    ('faq_5_q', 'When do I get paid?', 'faq', 'FAQ Question 5'),
    ('faq_5_a', 'Payouts are processed bi-weekly via crypto (USDT, BTC, ETH) or direct bank transfer once you are a funded trader.', 'faq', 'FAQ Answer 5'),
    ('faq_6_q', 'Is the evaluation on a live account?', 'faq', 'FAQ Question 6'),
    ('faq_6_a', 'No, the evaluation is conducted on a simulated account with real market data. Once funded, you will operate on live capital.', 'faq', 'FAQ Answer 6'),
    
    -- Evaluation Page
    ('eval_title', 'CHOOSE YOUR FUNDING PATH', 'evaluation', 'Evaluation Page Title'),
    ('eval_subtitle', 'Select your account size and begin your journey to becoming a funded trader.', 'evaluation', 'Evaluation Page Subtitle'),
    ('eval_tier1_name', 'Starter', 'evaluation', 'Tier 1 Name'),
    ('eval_tier1_size', '$10,000', 'evaluation', 'Tier 1 Account Size'),
    ('eval_tier1_price', '$99', 'evaluation', 'Tier 1 Price'),
    ('eval_tier2_name', 'Standard', 'evaluation', 'Tier 2 Name'),
    ('eval_tier2_size', '$50,000', 'evaluation', 'Tier 2 Account Size'),
    ('eval_tier2_price', '$299', 'evaluation', 'Tier 2 Price'),
    ('eval_tier3_name', 'Executive', 'evaluation', 'Tier 3 Name'),
    ('eval_tier3_size', '$100,000', 'evaluation', 'Tier 3 Account Size'),
    ('eval_tier3_price', '$499', 'evaluation', 'Tier 3 Price'),
    ('eval_profit_target', '10%', 'evaluation', 'Profit Target'),
    ('eval_daily_drawdown', '5%', 'evaluation', 'Daily Drawdown'),
    ('eval_max_drawdown', '10%', 'evaluation', 'Max Drawdown'),
    ('eval_leverage', '1:100', 'evaluation', 'Leverage'),
    
    -- Scaling Plan Page
    ('scaling_title', 'THE SOVEREIGN SCALING PATH', 'scaling', 'Scaling Page Title'),
    ('scaling_subtitle', 'Consistent performance deserves greater rewards. Grow your capital up to $2 Million.', 'scaling', 'Scaling Page Subtitle'),
    ('scaling_level1_title', 'Level 1: The Foundation', 'scaling', 'Level 1 Title'),
    ('scaling_level1_capital', '$100,000', 'scaling', 'Level 1 Capital'),
    ('scaling_level1_split', '80% Profit Split', 'scaling', 'Level 1 Split'),
    ('scaling_level1_status', 'Starting Point', 'scaling', 'Level 1 Status'),
    ('scaling_level2_title', 'Level 2: The Expansion', 'scaling', 'Level 2 Title'),
    ('scaling_level2_capital', '$200,000', 'scaling', 'Level 2 Capital'),
    ('scaling_level2_split', '85% Profit Split', 'scaling', 'Level 2 Split'),
    ('scaling_level2_status', 'Growth Phase', 'scaling', 'Level 2 Status'),
    ('scaling_level3_title', 'Level 3: The Sovereign', 'scaling', 'Level 3 Title'),
    ('scaling_level3_capital', '$500,000 - $2M', 'scaling', 'Level 3 Capital'),
    ('scaling_level3_split', '90% Profit Split', 'scaling', 'Level 3 Split'),
    ('scaling_level3_status', 'Pinnacle Status', 'scaling', 'Level 3 Status'),
    ('scaling_cta', 'Begin Your Journey', 'scaling', 'Scaling CTA Button'),
    
    -- Dashboard Page
    ('dash_title', 'Trader Dashboard', 'dashboard', 'Dashboard Title'),
    ('dash_welcome', 'Welcome', 'dashboard', 'Welcome Text'),
    ('dash_account_size', 'Account Size', 'dashboard', 'Account Size Label'),
    ('dash_equity', 'Current Equity', 'dashboard', 'Equity Card Title'),
    ('dash_daily_pnl', 'Daily P&L', 'dashboard', 'Daily P&L Card Title'),
    ('dash_max_loss', 'Max Trailing Loss', 'dashboard', 'Max Loss Card Title'),
    ('dash_profit_target', 'Profit Target', 'dashboard', 'Profit Target Card Title'),
    ('dash_phase_1', 'Phase 1: Evaluation', 'dashboard', 'Phase 1 Label'),
    ('dash_funded', 'FUNDED TRADER', 'dashboard', 'Funded Label'),
    ('dash_breached', 'ACCOUNT BREACHED', 'dashboard', 'Breached Label'),
    ('dash_breached_title', 'Account Breached', 'dashboard', 'Breached Title'),
    ('dash_breached_msg', 'Your account has exceeded the maximum drawdown limit. Trading has been disabled.', 'dashboard', 'Breached Message'),
    ('dash_funded_title', '🎉 Congratulations! You Are Funded!', 'dashboard', 'Funded Title'),
    ('dash_funded_msg', 'You''ve passed the evaluation phase. Welcome to the Sovereign Funding family!', 'dashboard', 'Funded Message'),
    ('dash_connect_title', 'Connect Your Deriv Account', 'dashboard', 'Connect Deriv Title'),
    ('dash_connect_msg', 'Link your Deriv API token to start monitoring your demo account in real time.', 'dashboard', 'Connect Deriv Message'),
    ('dash_try_again', 'Try Again', 'dashboard', 'Try Again Button'),
    ('dash_verify', 'Complete Verification', 'dashboard', 'Verification Button'),
    ('dash_connect', 'Connect Now', 'dashboard', 'Connect Button')
ON CONFLICT (key) DO NOTHING;

-- Security: Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can SELECT
CREATE POLICY "Allow public read access"
ON public.site_content
FOR SELECT
TO public
USING (true);

-- Only authenticated admins can UPDATE (Assuming a field 'is_admin' exists on profiles/users or using roles)
-- For simplicity in this dev phase, we'll allow update if there's a specific auth header or just check a service role
-- If using Supabase Auth:
CREATE POLICY "Allow admins to update content"
ON public.site_content
FOR UPDATE
USING ( auth.jwt() ->> 'email' IN ('admin@sovereignfunding.com') ); -- Replace with actual admin logic
