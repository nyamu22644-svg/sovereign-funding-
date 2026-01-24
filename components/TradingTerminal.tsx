import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface TradingTerminalProps {
  onNavigate?: (view: string) => void;
}

interface AccountInfo {
  loginid: string;
  balance: number;
  currency: string;
}

interface TickData {
  symbol: string;
  quote: number;
  epoch: number;
}

interface SimContract {
  id: string;
  type: 'CALL' | 'PUT';
  stake: number;
  symbol: string;
  startIndex: number;
  startPrice: number;
  durationTicks: number;
}

interface ContractType {
  id: string;
  name: string;
  icon: string;
}

const SYMBOLS = [
  { symbol: 'R_100', name: 'Volatility 100 Index', category: 'Synthetics' },
  { symbol: 'R_75', name: 'Volatility 75 Index', category: 'Synthetics' },
  { symbol: 'R_50', name: 'Volatility 50 Index', category: 'Synthetics' },
  { symbol: 'R_25', name: 'Volatility 25 Index', category: 'Synthetics' },
  { symbol: 'R_10', name: 'Volatility 10 Index', category: 'Synthetics' },
  { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', category: 'Synthetics' },
  { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', category: 'Synthetics' },
  { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', category: 'Synthetics' },
  { symbol: 'BOOM1000', name: 'Boom 1000 Index', category: 'Crash/Boom' },
  { symbol: 'BOOM500', name: 'Boom 500 Index', category: 'Crash/Boom' },
  { symbol: 'CRASH1000', name: 'Crash 1000 Index', category: 'Crash/Boom' },
  { symbol: 'CRASH500', name: 'Crash 500 Index', category: 'Crash/Boom' },
  { symbol: 'JD10', name: 'Jump 10 Index', category: 'Jump' },
  { symbol: 'JD25', name: 'Jump 25 Index', category: 'Jump' },
  { symbol: 'JD50', name: 'Jump 50 Index', category: 'Jump' },
  { symbol: 'JD75', name: 'Jump 75 Index', category: 'Jump' },
  { symbol: 'JD100', name: 'Jump 100 Index', category: 'Jump' },
  { symbol: 'stpRNG', name: 'Step Index', category: 'Other' },
];

const CONTRACT_TYPES: ContractType[] = [
  { id: 'CALL', name: 'Rise', icon: '📈' },
  { id: 'PUT', name: 'Fall', icon: '📉' },
  { id: 'DIGITOVER', name: 'Over', icon: '⬆️' },
  { id: 'DIGITUNDER', name: 'Under', icon: '⬇️' },
  { id: 'DIGITMATCH', name: 'Matches', icon: '🎯' },
  { id: 'DIGITDIFF', name: 'Differs', icon: '❌' },
  { id: 'DIGITEVEN', name: 'Even', icon: '2️⃣' },
  { id: 'DIGITODD', name: 'Odd', icon: '1️⃣' },
];

const DURATIONS = [
  { value: 1, unit: 't', label: '1 Tick' },
  { value: 2, unit: 't', label: '2 Ticks' },
  { value: 3, unit: 't', label: '3 Ticks' },
  { value: 4, unit: 't', label: '4 Ticks' },
  { value: 5, unit: 't', label: '5 Ticks' },
  { value: 1, unit: 'm', label: '1 Minute' },
  { value: 2, unit: 'm', label: '2 Minutes' },
  { value: 5, unit: 'm', label: '5 Minutes' },
  { value: 15, unit: 'm', label: '15 Minutes' },
  { value: 30, unit: 'm', label: '30 Minutes' },
  { value: 1, unit: 'h', label: '1 Hour' },
];

const TradingTerminal: React.FC<TradingTerminalProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [derivToken, setDerivToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  
  // Trading state
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [contractType, setContractType] = useState<string>('CALL');
  const [stake, setStake] = useState<number>(1);
  const [duration, setDuration] = useState({ value: 5, unit: 't' });
  const [digit, setDigit] = useState<number>(5);
  const [currentTick, setCurrentTick] = useState<TickData | null>(null);
  const [tickHistory, setTickHistory] = useState<number[]>([]);
  const [payout, setPayout] = useState<number | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ type: 'win' | 'lose'; amount: number } | null>(null);
  const [openContracts, setOpenContracts] = useState<any[]>([]);
  const [simContracts, setSimContracts] = useState<SimContract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(true); // default to evaluation mode

  // Fetch user's Deriv token
  useEffect(() => {
    if (!user?.email) return;

    const fetchToken = async () => {
      const { data } = await supabase
        .from('user_accounts')
        .select('deriv_api_token')
        .eq('user_email', user.email)
        .single();

      setDerivToken(data?.deriv_api_token || null);
      setLoading(false);
    };

    fetchToken();
  }, [user?.email]);

  // Handle WebSocket messages
  const handleMessage = useCallback((data: any) => {
    if (data.error) {
      setError(data.error.message);
      setIsTrading(false);
      return;
    }

    if (data.authorize) {
      setConnected(true);
      setAccount({
        loginid: data.authorize.loginid,
        balance: data.authorize.balance,
        currency: data.authorize.currency,
      });
      // Subscribe to balance updates
      wsRef.current?.send(JSON.stringify({ balance: 1, subscribe: 1 }));
      // Subscribe to open contracts
      wsRef.current?.send(JSON.stringify({ proposal_open_contract: 1, subscribe: 1 }));
    }

    if (data.balance) {
      setAccount(prev => prev ? { ...prev, balance: data.balance.balance } : null);
    }

    if (data.tick) {
      setCurrentTick({
        symbol: data.tick.symbol,
        quote: data.tick.quote,
        epoch: data.tick.epoch,
      });
      setTickHistory(prev => [...prev.slice(-49), data.tick.quote]);
    }

    if (data.proposal) {
      setPayout(data.proposal.payout);
    }

    if (data.buy) {
      setIsTrading(false);
      // Contract purchased successfully
    }

    if (data.proposal_open_contract) {
      const contract = data.proposal_open_contract;
      if (contract.is_sold) {
        // Contract settled
        const profit = contract.profit;
        setTradeResult({
          type: profit >= 0 ? 'win' : 'lose',
          amount: Math.abs(profit)
        });
        setTimeout(() => setTradeResult(null), 3000);
        // Remove from open contracts
        setOpenContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
      } else if (contract.contract_id) {
        // Update open contracts
        setOpenContracts(prev => {
          const exists = prev.find(c => c.contract_id === contract.contract_id);
          if (exists) {
            return prev.map(c => c.contract_id === contract.contract_id ? contract : c);
          }
          return [...prev, contract];
        });
      }
    }
  }, []);

  // Connect to Deriv WebSocket
  useEffect(() => {
    if (!derivToken && !isSimulation) return; // for live we need token; simulation can use public feed

    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Deriv');
      // Authorize only in live mode
      if (derivToken && !isSimulation) {
        ws.send(JSON.stringify({ authorize: derivToken }));
      } else if (isSimulation) {
        // simulation can stream public ticks without auth
        setConnected(true);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please try again.');
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [derivToken, handleMessage]);

  // Subscribe to symbol ticks
  useEffect(() => {
    if (!connected || !wsRef.current) return;

    // Forget previous subscription
    wsRef.current.send(JSON.stringify({ forget_all: 'ticks' }));
    
    // Subscribe to new symbol
    wsRef.current.send(JSON.stringify({
      ticks: selectedSymbol.symbol,
      subscribe: 1
    }));

    setTickHistory([]);
    setSimContracts([]); // reset local sims on symbol change
    }, [connected, selectedSymbol]);

  // Settle simulated contracts based on ticks
  useEffect(() => {
    if (simContracts.length === 0) return;
    if (tickHistory.length === 0) return;

    const completed: SimContract[] = [];
    const remaining: SimContract[] = [];
    simContracts.forEach(c => {
      if (tickHistory.length - c.startIndex >= c.durationTicks) {
        completed.push(c);
      } else {
        remaining.push(c);
      }
    });

    if (completed.length > 0) {
      completed.forEach(c => {
        const endPrice = tickHistory[tickHistory.length - 1];
        const win = c.type === 'CALL' ? endPrice > c.startPrice : endPrice < c.startPrice;
        const payoutFactor = 1.9; // 90% return on win
        const profit = win ? c.stake * (payoutFactor - 1) : -c.stake;
        setTradeResult({ type: win ? 'win' : 'lose', amount: Math.abs(profit) });
        setTimeout(() => setTradeResult(null), 3000);
      });
      setSimContracts(remaining);
    }
  }, [tickHistory, simContracts]);

  // Get price proposal
  useEffect(() => {
    if (!connected || !wsRef.current) return;
    if (isSimulation) return; // no proposals needed in sim mode

    const needsDigit = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType);

    const proposal: any = {
      proposal: 1,
      amount: stake,
      basis: 'stake',
      contract_type: contractType,
      currency: account?.currency || 'USD',
      duration: duration.value,
      duration_unit: duration.unit,
      symbol: selectedSymbol.symbol,
    };

    if (needsDigit) {
      proposal.barrier = digit.toString();
    }

    wsRef.current.send(JSON.stringify(proposal));
  }, [connected, selectedSymbol, contractType, stake, duration, digit, account?.currency]);

  // Place trade
  const placeTrade = () => {
    if (isSimulation) {
      // Create a simulated contract using current tick as entry
      if (!currentTick) {
        setError('Waiting for price data...');
        return;
      }
      const durationTicks = duration.unit === 't' ? duration.value : 5; // support ticks; fallback 5
      const newContract: SimContract = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: contractType === 'PUT' ? 'PUT' : 'CALL',
        stake,
        symbol: selectedSymbol.symbol,
        startIndex: tickHistory.length,
        startPrice: currentTick.quote,
        durationTicks
      };
      setSimContracts(prev => [...prev, newContract]);
      setTradeResult(null);
      return;
    }

    if (!wsRef.current || !payout) return;


    setIsTrading(true);
    setError(null);

    const needsDigit = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType);

    const buyRequest: any = {
      buy: 1,
      price: stake,
      parameters: {
        amount: stake,
        basis: 'stake',
        contract_type: contractType,
        currency: account?.currency || 'USD',
        duration: duration.value,
        duration_unit: duration.unit,
        symbol: selectedSymbol.symbol,
      }
    };

    if (needsDigit) {
      buyRequest.parameters.barrier = digit.toString();
    }

    wsRef.current.send(JSON.stringify(buyRequest));
  };

  // Quick trade functions
  const quickRise = () => {
    setContractType('CALL');
    setTimeout(placeTrade, 50);
  };

  const quickFall = () => {
    setContractType('PUT');
    setTimeout(placeTrade, 50);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-silver">Loading trading terminal...</p>
        </div>
      </div>
    );
  }

  // No token state
  if (!derivToken) {
    return (
      <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-darkcard/50 border border-gold/30 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Deriv Account</h2>
            <p className="text-silver mb-6">
              To access the trading terminal, connect your Deriv API token first.
            </p>
            <button
              onClick={() => onNavigate?.('settings')}
              className="px-6 py-3 bg-gradient-to-r from-gold to-neon text-darkbg font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Settings →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const needsDigit = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'].includes(contractType);
  const lastDigit = currentTick ? Math.floor(currentTick.quote * 100) % 10 : null;

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Account Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">📊</span> Trading Terminal
            </h1>
            <p className="text-silver text-sm mt-1">Trade volatility indices with real-time pricing</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="bg-darkcard/50 border border-white/10 rounded-lg p-1 flex items-center gap-1">
              <button
                onClick={() => setIsSimulation(true)}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  isSimulation ? 'bg-neon text-darkbg' : 'text-silver hover:bg-white/5'
                }`}
              >Evaluation (Sim)</button>
              <button
                onClick={() => setIsSimulation(false)}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  !isSimulation ? 'bg-gold text-darkbg' : 'text-silver hover:bg-white/5'
                }`}
              >Live (Deriv)</button>
            </div>

            {account && !isSimulation && (
              <div className="flex items-center gap-3">
                <div className="bg-darkcard/50 border border-white/10 rounded-lg px-4 py-2">
                  <div className="text-xs text-silver">Account</div>
                  <div className="text-white font-mono">{account.loginid}</div>
                </div>
                <div className="bg-darkcard/50 border border-neon/30 rounded-lg px-4 py-2">
                  <div className="text-xs text-silver">Balance</div>
                  <div className="text-neon font-mono font-bold">
                    {account.balance.toFixed(2)} {account.currency}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {connected ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Trade Result Notification */}
        {tradeResult && (
          <div className={`mb-4 p-4 rounded-lg flex items-center justify-center gap-3 ${
            tradeResult.type === 'win' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            <span className="text-2xl">{tradeResult.type === 'win' ? '🎉' : '😔'}</span>
            <span className="font-bold text-lg">
              {tradeResult.type === 'win' ? 'WIN' : 'LOSS'}: {tradeResult.type === 'win' ? '+' : '-'}
              {tradeResult.amount.toFixed(2)} {account?.currency}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Symbol & Chart */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Symbol Selector */}
            <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
              <label className="text-silver text-sm mb-2 block">Select Market</label>
              <select
                value={selectedSymbol.symbol}
                onChange={(e) => setSelectedSymbol(SYMBOLS.find(s => s.symbol === e.target.value) || SYMBOLS[0])}
                className="w-full bg-darkbg border border-white/20 rounded-lg px-4 py-3 text-white focus:border-neon focus:outline-none"
              >
                {SYMBOLS.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Price Display */}
            <div className="bg-darkcard/50 border border-neon/30 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedSymbol.name}</h3>
                  <p className="text-silver text-sm">{selectedSymbol.symbol}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono text-neon font-bold">
                    {currentTick?.quote.toFixed(4) || '---'}
                  </div>
                  {lastDigit !== null && (
                    <div className="text-sm text-silver">
                      Last Digit: <span className="text-gold font-bold text-lg">{lastDigit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Chart */}
              <div className="h-32 flex items-end gap-1">
                {tickHistory.map((tick, i) => {
                  const min = Math.min(...tickHistory);
                  const max = Math.max(...tickHistory);
                  const range = max - min || 1;
                  const height = ((tick - min) / range) * 100;
                  const isLast = i === tickHistory.length - 1;
                  
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all duration-100 ${
                        isLast ? 'bg-neon' : 'bg-neon/30'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    ></div>
                  );
                })}
                {tickHistory.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-silver text-sm">
                    Waiting for price data...
                  </div>
                )}
              </div>
            </div>

            {/* Digit Prediction Grid (for digit contracts) */}
            {needsDigit && (
              <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
                <label className="text-silver text-sm mb-3 block">Select Digit (0-9)</label>
                <div className="grid grid-cols-10 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                    <button
                      key={d}
                      onClick={() => setDigit(d)}
                      className={`aspect-square rounded-lg font-bold text-xl transition-all ${
                        digit === d
                          ? 'bg-gold text-darkbg'
                          : lastDigit === d
                          ? 'bg-neon/30 text-neon border border-neon'
                          : 'bg-darkbg text-silver hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Open Contracts (Live) */}
            {!isSimulation && openContracts.length > 0 && (
              <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">Open Contracts ({openContracts.filter(c => !c.is_sold).length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {openContracts.filter(c => !c.is_sold).map(contract => (
                    <div key={contract.contract_id} className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="text-white font-mono text-sm">{contract.contract_type}</div>
                        <div className="text-silver text-xs">{contract.underlying}</div>
                      </div>
                      <div className={`font-mono font-bold ${(contract.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(contract.profit || 0) >= 0 ? '+' : ''}{(contract.profit || 0).toFixed(2)} {contract.currency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Contracts (Simulation) */}
            {isSimulation && simContracts.length > 0 && (
              <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">Simulated Contracts ({simContracts.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {simContracts.map(contract => (
                    <div key={contract.id} className="bg-darkbg rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="text-white font-mono text-sm">{contract.type}</div>
                        <div className="text-silver text-xs">{contract.symbol}</div>
                        <div className="text-gray-500 text-xs">Dur: {contract.durationTicks} ticks</div>
                      </div>
                      <div className="text-silver text-xs text-right">
                        Entry: {contract.startPrice.toFixed(4)}
                        <div className="text-gray-500">Waiting...</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Trade Form */}
          <div className="space-y-4">
            
            {/* Contract Type */}
            <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
              <label className="text-silver text-sm mb-3 block">Contract Type</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTRACT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setContractType(type.id)}
                    className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                      contractType === type.id
                        ? type.id === 'CALL' || type.id === 'DIGITOVER' || type.id === 'DIGITEVEN'
                          ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                          : 'bg-red-500/20 border-2 border-red-500 text-red-400'
                        : 'bg-darkbg border border-white/10 text-silver hover:border-white/30'
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span> {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
              <label className="text-silver text-sm mb-2 block">Duration</label>
              <select
                value={`${duration.value}${duration.unit}`}
                onChange={(e) => {
                  const match = e.target.value.match(/(\d+)([tmh])/);
                  if (match) {
                    setDuration({ value: parseInt(match[1]), unit: match[2] });
                  }
                }}
                className="w-full bg-darkbg border border-white/20 rounded-lg px-4 py-3 text-white focus:border-neon focus:outline-none"
              >
                {DURATIONS.map(d => (
                  <option key={d.label} value={`${d.value}${d.unit}`}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stake */}
            <div className="bg-darkcard/50 border border-white/10 rounded-lg p-4">
              <label className="text-silver text-sm mb-2 block">Stake ({account?.currency || 'USD'})</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(0.35, parseFloat(e.target.value) || 0.35))}
                  min="0.35"
                  step="0.1"
                  className="flex-1 bg-darkbg border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-neon focus:outline-none"
                />
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 5, 10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                      stake === amount 
                        ? 'bg-neon text-darkbg' 
                        : 'bg-darkbg text-silver hover:bg-white/10'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Info */}
            {payout && !isSimulation && (
              <div className="bg-darkcard/50 border border-gold/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-silver">Potential Payout</span>
                  <span className="text-gold font-bold font-mono text-xl">
                    {payout.toFixed(2)} {account?.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-silver text-sm">Profit</span>
                  <span className="text-green-400 font-mono">
                    +{(payout - stake).toFixed(2)} {account?.currency}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Trade Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={quickRise}
                disabled={isTrading || !connected}
                className={`py-4 rounded-lg font-bold text-lg transition-all ${
                  isTrading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white'
                }`}
              >
                {isTrading ? '...' : '📈 RISE'}
              </button>
              <button
                onClick={quickFall}
                disabled={isTrading || !connected}
                className={`py-4 rounded-lg font-bold text-lg transition-all ${
                  isTrading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white'
                }`}
              >
                {isTrading ? '...' : '📉 FALL'}
              </button>
            </div>

            {/* Custom Trade Button */}
            <button
              onClick={placeTrade}
              disabled={isTrading || !connected}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                isTrading 
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                  : 'bg-gradient-to-r from-gold to-neon text-darkbg hover:opacity-90'
              }`}
            >
              {isTrading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                `Place ${CONTRACT_TYPES.find(t => t.id === contractType)?.name} Trade`
              )}
            </button>

            {/* Back to Dashboard */}
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="w-full py-3 rounded-lg border border-white/10 text-silver hover:bg-white/5 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;
