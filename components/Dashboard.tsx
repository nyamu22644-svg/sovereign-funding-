import React from 'react';

// 1. Define TypeScript Interface
interface TraderData {
  traderName: string;
  accountNumber: string;
  phase: string;
  accountSize: number;
  balance: number;
  equity: number;
  dailyLossLimit: number;
  currentDailyLoss: number;
  maxDrawdownLimit: number;
  currentMaxDrawdown: number;
  profitTarget: number;
  currentProfit: number;
  daysTraded: number;
  minTradingDays: number;
}

// 2. Mock Data Constant
const MOCK_DATA: TraderData = {
  traderName: "Alexander Sterling",
  accountNumber: "SV-892104",
  phase: "Phase 1: Evaluation",
  accountSize: 100000,
  balance: 102150.00,
  equity: 103420.50,
  dailyLossLimit: 5000,
  currentDailyLoss: 850.00,
  maxDrawdownLimit: 10000,
  currentMaxDrawdown: 1200.00,
  profitTarget: 10000,
  currentProfit: 3420.50,
  daysTraded: 4,
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

const Dashboard: React.FC = () => {
  const data = MOCK_DATA;

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="text-neon text-sm font-bold tracking-widest uppercase mb-1">Trader Dashboard</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome, {data.traderName}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="bg-white/5 px-3 py-1 rounded text-xs text-silver font-mono">
                #{data.accountNumber}
              </span>
              <span className="flex items-center text-gold text-sm font-semibold">
                <span className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></span>
                {data.phase}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-right">
             <div className="text-silver text-sm uppercase tracking-wider mb-1">Account Size</div>
             <div className="text-3xl font-mono text-white font-bold">{formatCurrency(data.accountSize)}</div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Card 1: Equity */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-neon/30 p-6 rounded-lg neon-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div className="text-neon font-bold text-sm tracking-wider uppercase mb-4">Current Equity</div>
            <div className="text-3xl font-mono text-white mb-2">{formatCurrency(data.equity)}</div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Balance: {formatCurrency(data.balance)}</span>
              <span className="text-neon">
                {data.equity >= data.balance ? '+' : ''}
                {formatCurrency(data.equity - data.balance)}
              </span>
            </div>
          </div>

          {/* Card 2: Daily Drawdown */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
            <div className="flex justify-between items-end mb-2">
              <div className="text-silver font-bold text-sm tracking-wider uppercase">Daily Loss</div>
              <div className="text-xs text-gray-500">Resets in 04:12:00</div>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              {formatCurrency(data.currentDailyLoss)} 
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">{formatCurrency(data.dailyLossLimit)}</span>
            </div>
            <ProgressBar 
              value={data.currentDailyLoss} 
              max={data.dailyLossLimit} 
              colorClass="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
            />
            <div className="mt-2 text-right text-xs text-red-400">
              {formatPercent(data.currentDailyLoss, data.dailyLossLimit)} Used
            </div>
          </div>

          {/* Card 3: Max Drawdown */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:border-white/20 transition-colors">
             <div className="text-silver font-bold text-sm tracking-wider uppercase mb-2">Max Trailing Loss</div>
             <div className="text-2xl font-mono text-white mb-1">
              {formatCurrency(data.currentMaxDrawdown)} 
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">{formatCurrency(data.maxDrawdownLimit)}</span>
            </div>
            <ProgressBar 
              value={data.currentMaxDrawdown} 
              max={data.maxDrawdownLimit} 
              colorClass="bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
            />
            <div className="mt-2 text-right text-xs text-orange-400">
              {formatPercent(data.currentMaxDrawdown, data.maxDrawdownLimit)} Used
            </div>
          </div>

          {/* Card 4: Profit Target */}
          <div className="bg-darkcard/50 backdrop-blur-md border border-gold/30 p-6 rounded-lg gold-glow">
            <div className="flex justify-between items-start mb-2">
               <div className="text-gold font-bold text-sm tracking-wider uppercase">Profit Target</div>
               <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              {formatCurrency(data.currentProfit)} 
              <span className="text-sm text-gray-500 mx-2">/</span> 
              <span className="text-lg text-gray-400">{formatCurrency(data.profitTarget)}</span>
            </div>
            <ProgressBar 
              value={data.currentProfit} 
              max={data.profitTarget} 
              colorClass="bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-gray-500">Days: {data.daysTraded}/{data.minTradingDays}</span>
              <span className="text-gold">{formatPercent(data.currentProfit, data.profitTarget)} Complete</span>
            </div>
          </div>

        </div>

        {/* Placeholder for Trading History or Chart */}
        <div className="mt-8 p-8 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-gray-600 h-64 bg-darkcard/20">
          <p className="uppercase tracking-widest text-sm">Trading History & Analysis Module Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;