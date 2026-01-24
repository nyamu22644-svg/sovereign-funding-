import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import contentRouter from './content.js';

// Simple in-memory rate limiter
const rateLimitStore = new Map();

const rateLimit = (maxRequests, windowMs) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    next();
  };
};

// Load environment variables from parent .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
const PORT = process.env.PORT || 3005;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize Supabase client with service role key (for backend operations)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', !!supabaseUrl, 'Service Key:', !!supabaseServiceKey);
} else {
  console.log('Supabase URL configured');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase initialized with service role key');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://sovereign-funding.vercel.app', 'https://sovereign-funding.com'] // Replace with your actual domains
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3005'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS preflight for all routes
app.options('*', cors());

// Environment validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TINYPESA_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// TinyPesa API config
const TINYPESA_API_KEY = process.env.TINYPESA_API_KEY;
const TINYPESA_CALLBACK = process.env.TINYPESA_CALLBACK_URL || `${FRONTEND_URL}/payment-callback`;

if (!TINYPESA_API_KEY) {
  console.warn('⚠️ Missing TINYPESA_API_KEY in .env.local');
}

// Routes
app.use('/api/content', contentRouter);

// Apply rate limiting to sensitive endpoints
app.use('/api/pay-tinypesa', rateLimit(5, 15 * 60 * 1000)); // 5 requests per 15 minutes
app.use('/api/tinypesa-callback', rateLimit(100, 60 * 1000)); // 100 requests per minute

// Input validation middleware
const validatePaymentInput = (req, res, next) => {
  const { amount, phone, email } = req.body;

  if (!amount || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields: amount, phone, email' });
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < 1 || amountNum > 100000) {
    return res.status(400).json({ error: 'Invalid amount. Must be between 1 and 100,000' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Sanitize inputs
  req.body.amount = amountNum;
  req.body.phone = phone.toString().replace(/\D/g, '');
  req.body.email = email.toLowerCase().trim();

  next();
};

// Error handler middleware
const jsonErrorHandler = (err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message || String(err)
  });
};

const isValidPhone = (phone) => {
  const digits = (phone || '').toString().replace(/\D/g, '');
  return /^(254|0)?([71]\d{8})$/.test(digits);
};

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: !!process.env.VITE_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      tinypesa: !!process.env.TINYPESA_API_KEY,
      cors: process.env.NODE_ENV === 'production'
        ? 'restricted domains'
        : 'development mode'
    },
    uptime: process.uptime()
  };

  // Check if all required services are available
  const allServicesHealthy = Object.values(health.services).every(service =>
    typeof service === 'boolean' ? service : true
  );

  res.status(allServicesHealthy ? 200 : 503).json(health);
});

// TinyPesa STK Push Endpoint
app.post('/api/pay-tinypesa', validatePaymentInput, async (req, res) => {
  try {
    const { amount, phone, email, tierName, currency } = req.body;
    console.log('📥 Received payment request:', { amount, phone, email, tierName });

    if (!TINYPESA_API_KEY) {
      return res.status(500).json({ error: 'TinyPesa API key missing on server' });
    }

    if (!amount || !phone) {
      return res.status(400).json({ error: 'Missing required fields: amount and phone' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format.' });
    }

    const amountNum = parseFloat(amount);
    
    // Normalize to 254... format for TinyPesa
    let normalizedPhone = phone.toString().replace(/\D/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '254' + normalizedPhone.substring(1);
    } else if (normalizedPhone.length === 9) {
      normalizedPhone = '254' + normalizedPhone;
    }

    const payload = {
      amount: amountNum.toString(),
      msisdn: normalizedPhone,
      account_no: tierName || 'evaluation',
    };

    console.log('🚀 Sending to TinyPesa:', payload);

    const tpResponse = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': TINYPESA_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams(payload).toString()
    });

    const responseText = await tpResponse.text();
    console.log('📡 TinyPesa raw response:', responseText);

    let tpData;
    try {
      tpData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse TinyPesa JSON:', responseText);
      return res.status(502).json({ 
        error: 'Invalid response from TinyPesa',
        details: responseText.substring(0, 200)
      });
    }

    if (!tpResponse.ok || tpData?.success === false) {
      return res.status(400).json({ 
        error: 'TinyPesa STK push failed',
        details: tpData?.message || 'Check your M-Pesa status'
      });
    }

    // Record order in Supabase
    try {
      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          user_email: email || 'guest@sovereignfunding.com',
          amount: amountNum,
          currency: currency || 'KES',
          tier_name: tierName || 'Unknown',
          status: 'pending',
          intasend_ref: tpData?.request_id || null
        });
      
      if (dbError) throw dbError;
    } catch (dbErr) {
      console.error('⚠️ Supabase order record failed:', dbErr);
      // We don't fail the request here because STK push was already sent
    }

    return res.status(200).json({
      success: true,
      message: 'STK push sent. Confirm on your phone.',
      requestId: tpData?.request_id
    });
  } catch (error) {
    console.error('🚨 Route handler error:', error);
    return res.status(500).json({ 
      error: 'Process failed',
      details: error.message || String(error)
    });
  }
});

// App.use(jsonErrorHandler) should be at bottom
app.use(jsonErrorHandler);

// TinyPesa callback to confirm payments
app.post('/api/tinypesa-callback', async (req, res) => {
  try {
    const { request_id, status, msisdn, amount, trans_id } = req.body || {};

    console.log('TinyPesa callback received:', req.body);

    if (!request_id) {
      return res.status(400).json({ error: 'Missing request_id in callback' });
    }

    // Normalize status
    const normalizedStatus = (status || '').toString().toLowerCase();
    const paymentStatus = ['success', 'completed', 'complete'].includes(normalizedStatus)
      ? 'paid'
      : normalizedStatus === 'pending'
        ? 'pending'
        : 'failed';

    const { data, error } = await supabase
      .from('orders')
      .update({ status: paymentStatus })
      .eq('intasend_ref', request_id)
      .select('intasend_ref');

    if (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ error: 'Failed to update order status' });
    }

    if (!data || data.length === 0) {
      console.warn('Callback received but no order matched request_id:', request_id);
    }

    return res.status(200).json({ success: true, status: paymentStatus });
  } catch (error) {
    console.error('Error handling TinyPesa callback:', error);
    return res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Secure backend running on http://localhost:${PORT}`);
  console.log(`📡 TinyPesa STK endpoint: POST http://localhost:${PORT}/api/pay-tinypesa`);
  console.log(`🔔 TinyPesa callback URL: ${TINYPESA_CALLBACK}`);

  // Start the trading evaluation engine
  startEvaluationEngine();
});

// Trading Evaluation Engine
// Checks every 30 seconds if users have passed or breached their evaluation
const startEvaluationEngine = () => {
  console.log('🚀 Starting Trading Evaluation Engine...');

  const evaluateUsers = async () => {
    try {
      // Get all active trading states
      const { data: activeStates, error } = await supabase
        .from('trading_states')
        .select('user_email, equity, status')
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error fetching active trading states:', error);
        return;
      }

      if (!activeStates || activeStates.length === 0) {
        return; // No active evaluations to check
      }

      console.log(`📊 Evaluating ${activeStates.length} active trading accounts...`);

      for (const state of activeStates) {
        const { user_email, equity } = state;

        // Get user account configuration
        const { data: userAccount, error: accountError } = await supabase
          .from('user_accounts')
          .select('start_balance, profit_target, max_drawdown_limit, challenge_status')
          .eq('user_email', user_email)
          .is('challenge_status', null) // Only evaluate users not already passed/breached
          .single();

        if (accountError || !userAccount) {
          // User account not found or already evaluated, skip
          continue;
        }

        const { start_balance, profit_target, max_drawdown_limit } = userAccount;

        const profitTarget = parseFloat(start_balance) + parseFloat(profit_target);
        const drawdownLimit = parseFloat(start_balance) - parseFloat(max_drawdown_limit);
        const currentEquity = parseFloat(equity);

        let newStatus = null;
        let statusReason = '';

        if (currentEquity >= profitTarget) {
          newStatus = 'passed';
          statusReason = `Equity ${currentEquity.toFixed(2)} >= Profit Target ${profitTarget.toFixed(2)}`;
          console.log(`✅ ${user_email}: FUNDED! ${statusReason}`);
        } else if (currentEquity < drawdownLimit) {
          newStatus = 'breached';
          statusReason = `Equity ${currentEquity.toFixed(2)} < Drawdown Limit ${drawdownLimit.toFixed(2)}`;
          console.log(`❌ ${user_email}: BREACHED! ${statusReason}`);
        }

        if (newStatus) {
          // Update user_accounts table
          const { error: updateAccountError } = await supabase
            .from('user_accounts')
            .update({
              challenge_status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('user_email', user_email);

          if (updateAccountError) {
            console.error(`❌ Error updating user_accounts for ${user_email}:`, updateAccountError);
            continue;
          }

          // Update trading_states table status to 'completed'
          const { error: stateError } = await supabase
            .from('trading_states')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('user_email', user_email);

          if (stateError) {
            console.error(`❌ Error updating trading_states for ${user_email}:`, stateError);
          } else {
            console.log(`✅ ${user_email} evaluation ${newStatus.toUpperCase()}: ${statusReason}`);
          }
        }
      }
    } catch (err) {
      console.error('💥 Evaluation engine error:', err);
    }
  };

  // Run evaluation every 30 seconds
  setInterval(evaluateUsers, 30 * 1000);

  // Run initial evaluation on startup
  setTimeout(evaluateUsers, 5000); // Wait 5 seconds after startup
};
