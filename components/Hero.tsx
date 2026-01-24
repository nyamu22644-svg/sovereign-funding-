import React from 'react';
import Button from './Button';
import { useContent } from '../context/ContentContext';

interface HeroProps {
  onStartEvaluation: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartEvaluation }) => {
  const { t } = useContent();

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
          <span className="text-neon text-xs font-bold tracking-widest uppercase">{t('home_hero_badge')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">
          <span className="block text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">{t('home_hero_title')}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon to-white drop-shadow-[0_0_15px_rgba(102,252,241,0.3)]">
            {t('home_hero_title_2')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-xl text-silver md:text-2xl font-light leading-relaxed">
          {t('home_hero_subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Button variant="primary" className="min-w-[200px]" onClick={onStartEvaluation}>
            {t('home_cta_button')}
          </Button>
          <Button variant="secondary" className="min-w-[200px]" onClick={onStartEvaluation}>
            {t('home_cta_button_2')}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 text-center opacity-50">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{t('stat_traders')}</span>
            <span className="text-xs text-silver uppercase tracking-wider">{t('stat_traders_label')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{t('stat_payouts')}</span>
            <span className="text-xs text-silver uppercase tracking-wider">{t('stat_payouts_label')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{t('stat_countries')}</span>
            <span className="text-xs text-silver uppercase tracking-wider">{t('stat_countries_label')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{t('stat_payout_time')}</span>
            <span className="text-xs text-silver uppercase tracking-wider">{t('stat_payout_time_label')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;