import React from 'react';
import { useContent } from '../context/ContentContext';
import Button from './Button';

interface ScalingStep {
  level: string;
  capital: string;
  split: string;
  requirements: string[];
  theme: 'neon' | 'gold';
  status: string;
}

interface ScalingPlanProps {
  onStartEvaluation: () => void;
}

const ScalingPlan: React.FC<ScalingPlanProps> = ({ onStartEvaluation }) => {
  const { t } = useContent();

  const steps: ScalingStep[] = [
    {
      level: t('scaling_level1_title'),
      capital: t('scaling_level1_capital'),
      split: t('scaling_level1_split'),
      requirements: ["Pass Evaluation Phase 1 & 2", "Consistent Risk Management"],
      theme: "neon",
      status: t('scaling_level1_status')
    },
    {
      level: t('scaling_level2_title'),
      capital: t('scaling_level2_capital'),
      split: t('scaling_level2_split'),
      requirements: ["3 Months of Profitability", "Average 10% Profit / Quarter", "No Serious Rule Violations"],
      theme: "neon",
      status: t('scaling_level2_status')
    },
    {
      level: t('scaling_level3_title'),
      capital: t('scaling_level3_capital'),
      split: t('scaling_level3_split'),
      requirements: ["Consistent Level 2 Performance", "VIP Trader Status Invitation", "Institutional Access"],
      theme: "gold",
      status: t('scaling_level3_status')
    }
  ];

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            {t('scaling_title')}
          </h1>
          <p className="text-xl text-silver font-light">
            {t('scaling_subtitle')}
          </p>
        </div>

        {/* Visual Roadmap */}
        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-neon via-white to-gold opacity-30 transform md:-translate-x-1/2 hidden md:block"></div>
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-neon via-white to-gold opacity-30 md:hidden"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline Dot */}
                <div className={`
                  absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-4 transform md:-translate-x-1/2 -translate-x-1/2 z-20 bg-darkbg
                  ${step.theme === 'gold' ? 'border-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'border-neon shadow-[0_0_15px_rgba(102,252,241,0.5)]'}
                `}></div>

                {/* Content Card */}
                <div className="ml-12 md:ml-0 md:w-1/2 px-4">
                  <div className={`
                    p-6 rounded-xl border backdrop-blur-sm relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300
                    ${step.theme === 'gold' 
                      ? 'border-gold/30 bg-gradient-to-br from-darkcard to-gold/5 gold-glow' 
                      : 'border-neon/30 bg-gradient-to-br from-darkcard to-neon/5 neon-glow'
                    }
                  `}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <span className={`text-6xl font-bold ${step.theme === 'gold' ? 'text-gold' : 'text-neon'}`}>0{index + 1}</span>
                    </div>

                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${step.theme === 'gold' ? 'text-gold' : 'text-neon'}`}>
                      {step.status}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">{step.level}</h3>
                    <div className="text-3xl font-mono text-white mb-4">{step.capital} <span className="text-sm font-normal text-silver">Allocation</span></div>
                    
                    <div className="bg-black/30 rounded p-3 mb-4 inline-block">
                       <span className={`font-bold ${step.theme === 'gold' ? 'text-gold' : 'text-neon'}`}>{step.split}</span>
                    </div>

                    <ul className="space-y-2">
                      {step.requirements.map((req, i) => (
                        <li key={i} className="flex items-start text-sm text-silver">
                          <svg className={`w-4 h-4 mr-2 mt-0.5 ${step.theme === 'gold' ? 'text-gold' : 'text-neon'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Spacer for the other side of the timeline on desktop */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
            <Button variant="primary" className="mx-auto" onClick={onStartEvaluation}>{t('scaling_cta')}</Button>
        </div>

      </div>
    </div>
  );
};

export default ScalingPlan;