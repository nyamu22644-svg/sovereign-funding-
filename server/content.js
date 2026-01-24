import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const router = express.Router();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

// No need for separate CORS here as it's handled in index.js

// Default content - fallback when DB is not available
const DEFAULT_CONTENT = {
  // Admin Settings
  admin_password: 'sovereign2026!',
  // Hero Section
  home_hero_title: 'SOVEREIGN FUNDING.',
  home_hero_title_2: 'TRADE OUR CAPITAL.',
  home_hero_subtitle: 'Prove your skills. Get funded up to $200,000. Keep up to 90% of the profits. Institutional-grade infrastructure for serious traders.',
  home_hero_badge: 'Accepting New Traders',
  home_cta_button: 'Start Evaluation',
  home_cta_button_2: 'View Offering',
  // Stats
  stat_traders: '50K+',
  stat_traders_label: 'Traders',
  stat_payouts: '$15M+',
  stat_payouts_label: 'Payouts',
  stat_countries: '100+',
  stat_countries_label: 'Countries',
  stat_payout_time: '< 4h',
  stat_payout_time_label: 'Avg Payout Time',
  // Navigation
  nav_evaluation: 'Evaluation',
  nav_scaling: 'Scaling Plan',
  nav_rules: 'Trading Rules',
  nav_faq: 'FAQ',
  nav_about: 'About',
  nav_portal: 'Client Portal',
  nav_login: 'Log In',
  nav_dashboard: 'Dashboard',
  nav_settings: 'Settings',
  nav_logout: 'Logout',
  // Footer
  footer_tagline: 'Empowering traders worldwide with capital and institutional-grade technology.',
  footer_copyright: 'Sovereign Funding. All rights reserved. Trading involves significant risk.',
  about_text: "Sovereign Funding is Kenya's premier proprietary firm, dedicated to empowering local talent with global capital.",
  // Trading Rules
  rules_page_title: 'TRADING OBJECTIVES & RULES',
  rules_page_subtitle: 'Adherence to these parameters is required to pass the evaluation and maintain a funded account.',
  rule_1_title: 'Max Daily Loss', rule_1_value: '5%', rule_1_detail: 'Hard Breach. Calculated based on the higher of the initial balance or equity at the start of the day.',
  rule_2_title: 'Max Total Drawdown', rule_2_value: '10%', rule_2_detail: 'Hard Breach. Trailing drawdown calculated from the highest high water mark.',
  rule_3_title: 'Profit Target', rule_3_value: '10% / 5%', rule_3_detail: 'Phase 1 requires 10% profit. Phase 2 requires 5% profit to pass.',
  rule_4_title: 'Minimum Trading Days', rule_4_value: '5 Days', rule_4_detail: 'You must trade for a minimum of 5 days in each phase to advance.',
  rule_5_title: 'News Trading', rule_5_value: 'Allowed', rule_5_detail: 'Trading during high-impact news events is permitted, subject to slippage risks.',
  rule_6_title: 'Overnight & Weekend', rule_6_value: 'Allowed', rule_6_detail: 'Holding positions overnight and over the weekend is fully permitted.',
  // FAQ
  faq_page_title: 'FREQUENTLY ASKED QUESTIONS',
  faq_page_subtitle: 'Everything you need to know about becoming a funded trader with Sovereign Funding.',
  faq_1_q: 'Do you accept M-Pesa?', faq_1_a: 'Yes, instant automated processing via TinyPesa.',
  faq_2_q: 'What is the profit split?', faq_2_a: 'We offer a generous 80/20 profit split in favor of the trader.',
  faq_3_q: 'How long does the evaluation take?', faq_3_a: 'There is no minimum or maximum time limit. You can pass in as little as 5 days if all objectives are met.',
  faq_4_q: 'What platforms can I use?', faq_4_a: 'We currently support trading via Deriv. More platforms will be added in the future.',
  faq_5_q: 'When do I get paid?', faq_5_a: 'Payouts are processed bi-weekly via crypto (USDT, BTC, ETH) or direct bank transfer once you are a funded trader.',
  faq_6_q: 'Is the evaluation on a live account?', faq_6_a: 'No, the evaluation is conducted on a simulated account with real market data. Once funded, you will operate on live capital.',
  // Evaluation
  eval_title: 'CHOOSE YOUR FUNDING PATH',
  eval_subtitle: 'Select your account size and begin your journey to becoming a funded trader.',
  eval_tier1_name: 'Starter', eval_tier1_size: '$10,000', eval_tier1_price: '$99',
  eval_tier2_name: 'Standard', eval_tier2_size: '$50,000', eval_tier2_price: '$299',
  eval_tier3_name: 'Executive', eval_tier3_size: '$100,000', eval_tier3_price: '$499',
  eval_profit_target: '10%', eval_daily_drawdown: '5%', eval_max_drawdown: '10%', eval_leverage: '1:100',
  // Scaling Plan
  scaling_title: 'THE SOVEREIGN SCALING PATH',
  scaling_subtitle: 'Consistent performance deserves greater rewards. Grow your capital up to $2 Million.',
  scaling_level1_title: 'Level 1: The Foundation', scaling_level1_capital: '$100,000', scaling_level1_split: '80% Profit Split', scaling_level1_status: 'Starting Point',
  scaling_level2_title: 'Level 2: The Expansion', scaling_level2_capital: '$200,000', scaling_level2_split: '85% Profit Split', scaling_level2_status: 'Growth Phase',
  scaling_level3_title: 'Level 3: The Sovereign', scaling_level3_capital: '$500,000 - $2M', scaling_level3_split: '90% Profit Split', scaling_level3_status: 'Pinnacle Status',
  scaling_cta: 'Begin Your Journey',
  // Dashboard
  dash_title: 'Trader Dashboard', dash_welcome: 'Welcome', dash_account_size: 'Account Size',
  dash_equity: 'Current Equity', dash_daily_pnl: 'Daily P&L', dash_max_loss: 'Max Trailing Loss', dash_profit_target: 'Profit Target',
  dash_phase_1: 'Phase 1: Evaluation', dash_funded: 'FUNDED TRADER', dash_breached: 'ACCOUNT BREACHED',
  dash_breached_title: 'Account Breached', dash_breached_msg: 'Your account has exceeded the maximum drawdown limit. Trading has been disabled.',
  dash_funded_title: '🎉 Congratulations! You Are Funded!', dash_funded_msg: "You've passed the evaluation phase. Welcome to the Sovereign Funding family!",
  dash_connect_title: 'Connect Your Deriv Account', dash_connect_msg: 'Link your Deriv API token to start monitoring your demo account in real time.',
  dash_try_again: 'Try Again', dash_verify: 'Complete Verification', dash_connect: 'Connect Now'
};

// In-memory content store (starts with defaults, can be updated)
let contentStore = { ...DEFAULT_CONTENT };

// Public: Get all content as key-value object (for frontend display)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value');

    if (error) {
      console.log('DB error, using defaults:', error.message);
      return res.json(contentStore);
    }

    if (!data || data.length === 0) {
      // Database is empty, populate it with defaults
      console.log('Database empty, populating with defaults...');
      const contentArray = Object.entries(contentStore).map(([key, value]) => ({
        key,
        value,
        category: getCategoryForKey(key),
        label: getLabelForKey(key)
      }));

      const { error: insertError } = await supabase
        .from('site_content')
        .insert(contentArray);

      if (insertError) {
        console.log('Failed to populate database:', insertError.message);
        return res.json(contentStore);
      }

      console.log('Database populated with defaults');
      return res.json(contentStore);
    }

    // Convert array to key-value object and merge with defaults
    const dbContent = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const mergedContent = { ...contentStore, ...dbContent };
    res.json(mergedContent);
  } catch (error) {
    console.log('Server error, using defaults:', error.message);
    res.json(contentStore);
  }
});

// Admin: Get all content with full details (for CMS editing)
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      // Return content store as array format for admin
      console.log('Using default content for admin (DB unavailable)');
      const contentArray = Object.entries(contentStore).map(([key, value]) => ({
        key,
        value,
        category: getCategoryForKey(key),
        label: getLabelForKey(key)
      }));
      return res.json(contentArray);
    }
    res.json(data);
  } catch (error) {
    console.log('DB error for /all:', error.message);
    const contentArray = Object.entries(contentStore).map(([key, value]) => ({
      key,
      value,
      category: getCategoryForKey(key),
      label: getLabelForKey(key)
    }));
    res.json(contentArray);
  }
});

// Helper to get category from key
function getCategoryForKey(key) {
  if (key.startsWith('admin_')) return 'admin';
  if (key.startsWith('home_') || key.startsWith('about_')) return 'home';
  if (key.startsWith('stat_')) return 'stats';
  if (key.startsWith('nav_')) return 'nav';
  if (key.startsWith('footer_')) return 'footer';
  if (key.startsWith('rule_') || key.startsWith('rules_')) return 'rules';
  if (key.startsWith('faq_')) return 'faq';
  if (key.startsWith('eval_')) return 'evaluation';
  if (key.startsWith('scaling_')) return 'scaling';
  if (key.startsWith('dash_')) return 'dashboard';
  return 'buttons';
}

// Helper to get label from key
function getLabelForKey(key) {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Admin: Update content
router.post('/update', async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Missing key or value' });
  }

  // Update local store immediately
  contentStore[key] = value;

  try {
    // Try to update DB (upsert)
    const { error } = await supabase
      .from('site_content')
      .upsert({
        key,
        value,
        category: getCategoryForKey(key),
        label: getLabelForKey(key),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.log('DB update failed:', error.message);
      return res.status(500).json({ error: 'Database update failed', details: error.message });
    }

    res.json({ success: true, message: `Content updated for ${key}` });
  } catch (error) {
    console.log('DB error:', error.message);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

export default router;
