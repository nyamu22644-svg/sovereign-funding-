import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

// 1. Define TypeScript Interface for live trading data
interface TradingState {
  id: number;
  user_email: string;
  balance: number;
  equity: number;
  daily_pnl: number;
  status: string;
  last_trade_at: string | null;
  updated_at: string;
  created_at: string;
}

// 2. Default state when no data exists
const DEFAULT_TRADING_STATE: TradingState = {
  id: 0,
  user_email: '',
  balance: 0,
  equity: 0,
  daily_pnl: 0,
  status: 'inactive',
  last_trade_at: null,
  updated_at: '',
  created_at: ''
};

// Account configuration based on tier (you can expand this)
const ACCOUNT_CONFIG = {
  accountSize: 10000,
  dailyLossLimit: 500,
  maxDrawdownLimit: 1000,
  profitTarget: 1000,
  minTradingDays: 5
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value: number, total: number) => {
  return ((value / total) * 100).toFixed(1) + '%';
};

const ProgressBar: React.FC<{ value: number; max: number; colorClass: string }> = ({ value, max, colorClass }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full bg-darkbg rounded-full overflow-hidden border border-white/5 mt-3">
      <div 
        className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useContent();
  const [tradingState, setTradingState] = useState<TradingState>(DEFAULT_TRADING_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasDerivToken, setHasDerivToken] = useState<boolean | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Manual refresh function
  const refreshData = async () => {
    if (!user?.email) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('trading_states')
        .select('*')
        .eq('user_email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing data:', error);
        setError(error.message);
      } else if (data) {
        console.log('Manual refresh data:', data);
        setTradingState(data);
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if user has connected Deriv account and get challenge status
  useEffect(() => {
    if (!user?.email) return;

    const checkDerivConnection = async () => {
      const { data } = await supabase
        .from('user_accounts')
        .select('deriv_api_token, challenge_status')
        .eq('user_email', user.email)
        .single();

      setHasDerivToken(!!(data?.deriv_api_token));
      if (data?.challenge_status) {
        setChallengeStatus(data.challenge_status);
      }
    };

    checkDerivConnection();

    // Subscribe to challenge_status changes
    const channel = supabase
      .channel('user_accounts_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_accounts',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'challenge_status' in payload.new) {
            setChallengeStatus((payload.new as any).challenge_status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // Fetch initial trading state
  useEffect(() => {
    if (!user?.email) return;

    const fetchTradingState = async () => {
      try {
        const { data, error } = await supabase
          .from('trading_states')
          .select('*')
          .eq('user_email', user.email)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
          console.error('Error fetching trading state:', error);
          setError(error.message);
        } else if (data) {
          setTradingState(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingState();
  }, [user?.email]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.email) return;

    console.log('Setting up real-time subscription for:', user.email);

    const channel = supabase
      .channel('trading_states_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_states',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as TradingState;
            console.log('Updating trading state:', newData);
            setTradingState(newData);
            setIsLive(true);
            // Flash the live indicator
            setTimeout(() => setIsLive(false), 2000);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // Calculated values
  const currentProfit = tradingState.equity - ACCOUNT_CONFIG.accountSize;
  const currentDailyLoss = Math.abs(Math.min(tradingState.daily_pnl, 0));
  const maxDrawdown = ACCOUNT_CONFIG.accountSize - tradingState.balance;

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-silver">Loading trading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="text-neon text-sm font-bold tracking-widest uppercase">{t('dash_title')}</div>
              {/* Live indicator */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono transition-all duration-300 ${
                isLive ? 'bg-neon/20 text-neon' : tradingState.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-neon animate-ping' : tradingState.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></span>
                {isLive ? 'LIVE UPDATE' : tradingState.status === 'active' ? 'LIVE' : 'OFFLINE'}
              </div>
              {/* Refresh button */}
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-xs font-mono text-silver hover:text-white transition-colors disabled:opacity-50"
                title="Refresh data from Deriv"
              >
                <svg className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {refreshing ? 'SYNCING...' : 'SYNC'}
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('dash_welcome')}, {user?.email?.split('@')[0] || 'Trader'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="bg-white/5 px-3 py-1 rounded text-xs text-silver font-mono">
                {user?.email}
              </span>
              {challengeStatus === 'breached' ? (
                <span className="flex items-center text-red-500 text-sm font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {t('dash_breached')}
                </span>
              ) : challengeStatus === 'passed' ? (
                <span className="flex items-center text-green-400 text-sm font-semibold">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {t('dash_funded')}
                </span>
              ) : (
                <span className="flex items-center text-gold text-sm font-semibold">
                  <span className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></span>
                  {t('dash_phase_1')}
                </span>
              )}
            </div>
          </div>

        {/* BREACHED Banner */}
        {challengeStatus === 'breached' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-red-900/20 border-2 border-red-500/50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-xl mb-1">{t('dash_breached_title')}</h3>
                  <p className="text-red-300/80 text-sm">{t('dash_breached_msg')}</p>
                  <p className="text-gray-400 text-xs mt-2">Don't give up! Many successful traders failed before succeeding.</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.('evaluation')}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-center whitespace-nowrap"
              >
                {t('dash_try_again')} →
              </button>
            </div>
          </div>
        )}

        {/* FUNDED Banner */}
        {challengeStatus === 'passed' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-900/20 border-2 border-green-500/50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold text-xl mb-1">{t('dash_funded_title')}</h3>
                  <p className="text-green-300/80 text-sm">{t('dash_funded_msg')}</p>
                  <p className="text-gray-400 text-xs mt-2">Complete verification to receive your funded account credentials.</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.('verification')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-center whitespace-nowrap flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                {t('dash_verify')} →
              </button>
            </div>
          </div>
        )}

        {/* Connect Deriv Account Banner */}
        {hasDerivToken === false && challengeStatus === 'active' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-gold/10 to-neon/10 border border-gold/30 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t('dash_connect_title')}</h3>
                  <p className="text-silver text-sm">{t('dash_connect_msg')}</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.('settings')}
                className="px-6 py-3 bg-gradient-to-r from-gold to-neon text-darkbg font-bold rounded-lg hover:opacity-90 transition-opacity text-center whitespace-nowrap"
              >
                {t('dash_connect')} →
              </button>
            </div>
          </div>
        )}

          <div className="mt-6 md:mt-0 text-right">
             <div className="text-silver text-sm uppercase tracking-wider mb-1">{t('dash_account_size')}</div>
             <div className="text-3xl font-mono text-white font-bold">{formatCurrency(ACCOUNT_CONFIG.accountSize)}</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Card 1: Equity */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-neon/30 p-6 rounded-lg neon-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div className="text-neon font-bold text-sm tracking-wider uppercase mb-4">{t('dash_equity')}</div>
            <div className="text-3xl font-mono text-white mb-2">{formatCurrency(tradingState.equity)}</div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Balance: {formatCurrency(tradingState.balance)}</span>
              <span className="text-neon">
                {tradingState.equity >= tradingState.balance ? '+' : ''}
                {formatCurrency(tradingState.equity - tradingState.balance)}
              </span>
            </div>
          </div>

          {/* Card 2: Daily Drawdown */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
            <div className="flex justify-between items-end mb-2">
              <div className="text-silver font-bold text-sm tracking-wider uppercase">{t('dash_daily_pnl')}</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              <span className={tradingState.daily_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                {tradingState.daily_pnl >= 0 ? '+' : ''}{formatCurrency(tradingState.daily_pnl)}
              </span>
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">-{formatCurrency(ACCOUNT_CONFIG.dailyLossLimit)}</span>
            </div>
            <ProgressBar 
              value={currentDailyLoss} 
              max={ACCOUNT_CONFIG.dailyLossLimit} 
              colorClass="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
            />
            <div className="mt-2 text-right text-xs text-red-400">
              {formatPercent(currentDailyLoss, ACCOUNT_CONFIG.dailyLossLimit)} Daily Limit Used
            </div>
          </div>

          {/* Card 3: Max Drawdown */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
             <div className="text-silver font-bold text-sm tracking-wider uppercase mb-2">{t('dash_max_loss')}</div>
             <div className="text-2xl font-mono text-white mb-1">
              {formatCurrency(Math.max(maxDrawdown, 0))} 
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">{formatCurrency(ACCOUNT_CONFIG.maxDrawdownLimit)}</span>
            </div>
            <ProgressBar 
              value={Math.max(maxDrawdown, 0)} 
              max={ACCOUNT_CONFIG.maxDrawdownLimit} 
              colorClass="bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
            />
            <div className="mt-2 text-right text-xs text-orange-400">
              {formatPercent(Math.max(maxDrawdown, 0), ACCOUNT_CONFIG.maxDrawdownLimit)} Used
            </div>
          </div>

          {/* Card 4: Profit Target */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-gold/30 p-6 rounded-lg gold-glow">
            <div className="flex justify-between items-start mb-2">
               <div className="text-gold font-bold text-sm tracking-wider uppercase">{t('dash_profit_target')}</div>
               <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              <span className={currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                {currentProfit >= 0 ? '+' : ''}{formatCurrency(currentProfit)}
              </span>
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">{formatCurrency(ACCOUNT_CONFIG.profitTarget)}</span>
            </div>
            <ProgressBar 
              value={Math.max(currentProfit, 0)} 
              max={ACCOUNT_CONFIG.profitTarget} 
              colorClass="bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-gray-500">Status: {tradingState.status}</span>
              <span className="text-gold">{formatPercent(Math.max(currentProfit, 0), ACCOUNT_CONFIG.profitTarget)} Complete</span>
            </div>
          </div>

        </div>

        {/* Last Update Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Last updated: {tradingState.updated_at ? new Date(tradingState.updated_at).toLocaleString() : 'Never'}
          {tradingState.last_trade_at && (
            <span className="ml-4">| Last trade: {new Date(tradingState.last_trade_at).toLocaleString()}</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;