import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFundedUsers() {
  console.log('🔍 Checking users marked as funded...');

  const { data, error } = await supabase
    .from('user_accounts')
    .select('user_email, challenge_status, start_balance, profit_target, max_drawdown_limit')
    .eq('challenge_status', 'passed');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Users marked as FUNDED:');
  for (const user of data) {
    console.log(`📈 ${user.user_email}: ${user.challenge_status}`);
    console.log(`   Account: $${user.start_balance}, Target: $${user.profit_target}, Drawdown: $${user.max_drawdown_limit}`);

    // Check their trading state
    const { data: tradingData, error: tradingError } = await supabase
      .from('trading_states')
      .select('equity, balance, status, updated_at')
      .eq('user_email', user.user_email)
      .single();

    if (tradingError) {
      console.log(`   ❌ No trading data found`);
    } else {
      console.log(`   💰 Equity: $${tradingData.equity}, Balance: $${tradingData.balance}, Status: ${tradingData.status}`);
      console.log(`   📅 Last updated: ${tradingData.updated_at}`);
    }
    console.log('');
  }
}

checkFundedUsers();