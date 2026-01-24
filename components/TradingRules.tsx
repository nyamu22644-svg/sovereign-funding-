import React from 'react';
import { useContent } from '../context/ContentContext';

interface Rule {
  title: string;
  value: string;
  detail: string;
  type: 'breach' | 'target' | 'info';
}

const TradingRules: React.FC = () => {
  const { t } = useContent();

  const rules: Rule[] = [
    {
      title: t('rule_1_title'),
      value: t('rule_1_value'),
      detail: t('rule_1_detail'),
      type: "breach"
    },
    {
      title: t('rule_2_title'),
      value: t('rule_2_value'),
      detail: t('rule_2_detail'),
      type: "breach"
    },
    {
      title: t('rule_3_title'),
      value: t('rule_3_value'),
      detail: t('rule_3_detail'),
      type: "target"
    },
    {
      title: t('rule_4_title'),
      value: t('rule_4_value'),
      detail: t('rule_4_detail'),
      type: "target"
    },
    {
      title: t('rule_5_title'),
      value: t('rule_5_value'),
      detail: t('rule_5_detail'),
      type: "info"
    },
    {
      title: t('rule_6_title'),
      value: t('rule_6_value'),
      detail: t('rule_6_detail'),
      type: "info"
    }
  ];

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            {t('rules_page_title')}
          </h1>
          <p className="text-xl text-silver font-light max-w-3xl mx-auto">
            {t('rules_page_subtitle')}
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