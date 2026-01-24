import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserAccount {
  id: number;
  user_email: string;
  deriv_api_token: string | null;
  deriv_account_id: string | null;
  broker_type?: string | null;
  broker_credentials?: Record<string, any> | null;
  currency?: string | null;
  locked_at?: string | null;
  evaluation_started_at?: string | null;
  start_balance?: number | null;
  account_tier: string;
  account_size: number;
  is_active: boolean;
}

const REQUIRED_BALANCE = 10000;

const verifyDerivToken = (token: string): Promise<{ balance: number; currency: string; loginid: string }> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('Deriv API token is required'));
      return;
    }

    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(timeoutId);
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      ws.close();
      reject(new Error('Verification timed out. Please try again.'));
    }, 15000); // Increased from 8 to 15 seconds

    ws.onopen = () => {
      ws.send(JSON.stringify({ authorize: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        cleanup();
        ws.close();
        reject(new Error(data.error.message || 'Invalid Deriv token'));
        return;
      }

      if (data.authorize) {
        ws.send(JSON.stringify({ balance: 1 }));
      }

      if (data.balance) {
        const { balance, currency, loginid } = data.balance;
        cleanup();
        ws.close();
        resolve({ balance, currency, loginid });
      }
    };

    ws.onerror = () => {
      cleanup();
      reject(new Error('Could not reach Deriv. Check your connection and try again.'));
    };

    ws.onclose = () => {
      cleanup();
    };
  });
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [derivToken, setDerivToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  // Fetch existing user account data
  useEffect(() => {
    if (!user?.email) return;

    const fetchUserAccount = async () => {
      try {
        const { data, error } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('user_email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user account:', error);
        } else if (data) {
          setUserAccount(data);
          setDerivToken(data.deriv_api_token || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccount();
  }, [user?.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { balance, currency, loginid } = await verifyDerivToken(derivToken);

      if (Math.abs(balance - REQUIRED_BALANCE) > 0.5) {
        throw new Error(`Balance must be exactly $${REQUIRED_BALANCE.toLocaleString()} on your Deriv demo account. Current: ${balance}`);
      }

      const now = new Date().toISOString();
      const payload = {
        user_email: user.email,
        deriv_api_token: derivToken,
        deriv_account_id: loginid,
        broker_type: 'deriv',
        broker_credentials: { token: derivToken, account_id: loginid },
        currency: currency || 'USD',
        locked_at: now,
        evaluation_started_at: now,
        start_balance: balance,
        account_tier: 'standard',
        account_size: balance,
        is_active: true,
        updated_at: now
      } as const;

      const { data: accountData, error: accountError } = await supabase
        .from('user_accounts')
        .upsert(payload, { onConflict: 'user_email' })
        .select()
        .single();

      if (accountError) throw accountError;

      const { error: stateError } = await supabase
        .from('trading_states')
        .upsert({
          user_email: user.email,
          balance,
          equity: balance,
          daily_pnl: 0,
          currency: currency || 'USD',
          status: 'active',
          updated_at: now
        }, { onConflict: 'user_email' });

      if (stateError) throw stateError;

      setUserAccount(accountData as UserAccount);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to start evaluation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-silver">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-5 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="text-neon text-sm font-bold tracking-widest uppercase mb-1">Account Settings</div>
          <h1 className="text-3xl font-bold text-white mb-2">Connect Your Deriv Demo</h1>
          <p className="text-silver">Paste your Deriv API token, we verify the demo is $10,000, and we start monitoring. No in-app trading.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-4 bg-darkcard/40 border border-white/5 rounded-lg text-sm text-gray-300 space-y-1">
            <div className="font-semibold text-white">How it works</div>
            <div>1) Create free Deriv demo → reset to $10,000.</div>
            <div>2) Generate API token (Read + Trade) in Deriv.</div>
            <div>3) Paste token below → we verify balance = $10k → monitoring starts.</div>
          </div>
          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${
            userAccount?.is_active && derivToken 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                userAccount?.is_active && derivToken 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-yellow-400'
              }`}></div>
              <span className={`text-sm font-medium ${
                userAccount?.is_active && derivToken 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                {userAccount?.is_active && derivToken 
                  ? 'Monitoring active - token locked' 
                  : 'Not connected - paste your Deriv API token'}
              </span>
            </div>
          </div>

          {/* Deriv API Token */}
          <div>
            <label className="block text-sm font-medium text-silver mb-2">
              Deriv API Token <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={derivToken}
                onChange={(e) => setDerivToken(e.target.value)}
                placeholder="Enter your Deriv API token"
                className="w-full px-4 py-3 pr-12 bg-darkcard border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showToken ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <div className="font-semibold text-yellow-400 mb-1">Important: Use Demo Account Token</div>
                  <div className="text-yellow-200">
                    Please generate your API token from your <strong>Deriv Demo account</strong>, not your Real account. 
                    Only Demo tokens are supported for evaluation. Real account tokens will not work.
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Get your API token from{' '}
              <a 
                href="https://app.deriv.com/account/api-token" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neon hover:underline"
              >
                Deriv API Token Settings
              </a>
              {' '}(Enable: Read, Trade, Payments)
            </p>
          </div>

          {/* Account Info (read-only) */}
          {userAccount && userAccount.account_size && (
            <div className="p-4 bg-darkcard/50 rounded-lg border border-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Account Details</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Tier:</span>
                  <span className="text-white ml-2 capitalize">{userAccount.account_tier || 'standard'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Account Size:</span>
                  <span className="text-white ml-2">${Number(userAccount.account_size).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Token verified and monitoring started. Keep trading on Deriv; we will track automatically.
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-6 bg-gradient-to-r from-neon to-gold text-darkbg font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-darkbg border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Verify & Start Monitoring
              </>
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-10 p-6 bg-darkcard/30 rounded-lg border border-white/5">
          <h3 className="text-white font-semibold mb-3">How to get your Deriv API Token:</h3>
          <ol className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-neon font-mono">1.</span>
              Log in to your Deriv account
            </li>
            <li className="flex gap-2">
              <span className="text-neon font-mono">2.</span>
              Go to <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer" className="text-neon hover:underline">Settings → API Token</a>
            </li>
            <li className="flex gap-2">
              <span className="text-neon font-mono">3.</span>
              Create a new token with <span className="text-white">Read</span>, <span className="text-white">Trade</span>, and <span className="text-white">Payments</span> permissions
            </li>
            <li className="flex gap-2">
              <span className="text-neon font-mono">4.</span>
              Copy the token and paste it above
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
