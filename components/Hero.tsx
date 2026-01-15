import React from 'react';
import Button from './Button';

interface HeroProps {
  onStartEvaluation: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartEvaluation }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-darkbg">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10"></div>
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-darkbg via-transparent to-darkbg/80"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10 pt-20">
        
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-neon/30 bg-neon/5 backdrop-blur-sm mb-8 animate-fade-in-down">
          <span className="flex h-2 w-2 relative mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
          </span>
          <span className="text-neon text-xs font-bold tracking-widest uppercase">Accepting New Traders</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">
          <span className="block text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">SOVEREIGN FUNDING.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon to-white drop-shadow-[0_0_15px_rgba(102,252,241,0.3)]">
            TRADE OUR CAPITAL.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-xl text-silver md:text-2xl font-light leading-relaxed">
          Prove your skills. Get funded up to <span className="text-white font-semibold">$200,000</span>. 
          Keep up to <span className="text-neon font-semibold">90%</span> of the profits. 
          Institutional-grade infrastructure for serious traders.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Button variant="primary" className="min-w-[200px]" onClick={onStartEvaluation}>
            Start Evaluation
          </Button>
          <Button variant="secondary" className="min-w-[200px]" onClick={onStartEvaluation}>
            View Offering
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 text-center opacity-50">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">50K+</span>
            <span className="text-xs text-silver uppercase tracking-wider">Traders</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">$15M+</span>
            <span className="text-xs text-silver uppercase tracking-wider">Payouts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">100+</span>
            <span className="text-xs text-silver uppercase tracking-wider">Countries</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">&lt; 4h</span>
            <span className="text-xs text-silver uppercase tracking-wider">Avg Payout Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;