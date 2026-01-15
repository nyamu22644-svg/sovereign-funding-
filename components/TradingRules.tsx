import React from 'react';

interface Rule {
  title: string;
  value: string;
  detail: string;
  type: 'breach' | 'target' | 'info';
}

const rules: Rule[] = [
  {
    title: "Max Daily Loss",
    value: "5%",
    detail: "Hard Breach. Calculated based on the higher of the initial balance or equity at the start of the day.",
    type: "breach"
  },
  {
    title: "Max Total Drawdown",
    value: "10%",
    detail: "Hard Breach. Trailing drawdown calculated from the highest high water mark.",
    type: "breach"
  },
  {
    title: "Profit Target",
    value: "10% / 5%",
    detail: "Phase 1 requires 10% profit. Phase 2 requires 5% profit to pass.",
    type: "target"
  },
  {
    title: "Minimum Trading Days",
    value: "5 Days",
    detail: "You must trade for a minimum of 5 days in each phase to advance.",
    type: "target"
  },
  {
    title: "News Trading",
    value: "Allowed",
    detail: "Trading during high-impact news events is permitted, subject to slippage risks.",
    type: "info"
  },
  {
    title: "Overnight & Weekend",
    value: "Allowed",
    detail: "Holding positions overnight and over the weekend is fully permitted.",
    type: "info"
  }
];

const TradingRules: React.FC = () => {
  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            TRADING OBJECTIVES & RULES
          </h1>
          <p className="text-xl text-silver font-light max-w-3xl mx-auto">
            Adherence to these parameters is required to pass the evaluation and maintain a funded account.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rules.map((rule, index) => (
            <div 
              key={index}
              className={`
                group relative p-8 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-1
                ${rule.type === 'breach' 
                  ? 'bg-darkcard/40 border-red-900/30 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                  : rule.type === 'target'
                    ? 'bg-darkcard/40 border-gold/30 hover:border-gold/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]'
                    : 'bg-darkcard/40 border-neon/30 hover:border-neon/50 hover:shadow-[0_0_20px_rgba(102,252,241,0.1)]'
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                   <h3 className="text-silver text-sm font-bold uppercase tracking-widest mb-1">{rule.title}</h3>
                   <div className={`text-3xl font-mono font-bold ${
                     rule.type === 'breach' ? 'text-white' : 
                     rule.type === 'target' ? 'text-gold' : 'text-neon'
                   }`}>
                     {rule.value}
                   </div>
                </div>
                
                {/* Icons */}
                <div className={`p-3 rounded-lg bg-darkbg/50 border border-white/5`}>
                  {rule.type === 'breach' && (
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  )}
                  {rule.type === 'target' && (
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                  )}
                  {rule.type === 'info' && (
                    <svg className="w-6 h-6 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-white/10 mb-4"></div>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                {rule.detail}
              </p>

              {rule.type === 'breach' && (
                 <div className="absolute top-0 right-0 -mt-2 -mr-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-neon/5 border border-neon/20 rounded-lg text-center">
          <p className="text-neon text-sm uppercase tracking-wide font-bold mb-2">Transparency Promise</p>
          <p className="text-silver text-sm">
            All rules are programmed automatically into our trading server. You can track your limits in real-time on the Dashboard.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TradingRules;