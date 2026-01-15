'use client';

import React, { useState } from 'react';
import Button from './Button';

// 1. Define TypeScript Interface
interface AccountTier {
  name: string;
  size: string;
  price: string;
  profitTarget: string;
  dailyDrawdown: string;
  maxDrawdown: string;
  leverage: string;
  popular: boolean;
}

// 2. Define Data Constant
const accountTiers: AccountTier[] = [
  {
    name: 'Starter',
    size: '$10,000',
    price: '$99',
    profitTarget: '10%',
    dailyDrawdown: '5%',
    maxDrawdown: '10%',
    leverage: '1:100',
    popular: false
  },
  {
    name: 'Standard',
    size: '$50,000',
    price: '$299',
    profitTarget: '10%',
    dailyDrawdown: '5%',
    maxDrawdown: '10%',
    leverage: '1:100',
    popular: true
  },
  {
    name: 'Executive',
    size: '$100,000',
    price: '$499',
    profitTarget: '10%',
    dailyDrawdown: '5%',
    maxDrawdown: '10%',
    leverage: '1:100',
    popular: false
  }
];

const Evaluation: React.FC = () => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectTier = async (tier: AccountTier) => {
    try {
      setLoadingTier(tier.name);
      
      // Extract numeric price from price string (e.g., "$99" -> 99)
      const amount = parseInt(tier.price.replace(/\D/g, ''));
      
      console.log('Initiating payment for:', tier.name, 'Amount:', amount);
      
      // Fetch payment intent from backend
      const response = await fetch('http://localhost:3001/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          email: 'trader@example.com',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment request failed: ${errorData.details || response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Payment response:', data);
      
      // Redirect to IntaSend checkout URL (try both property names)
      const checkoutUrl = data.url || data.checkout_url;
      
      if (checkoutUrl) {
        console.log('Redirecting to:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        console.error('No checkout URL in response:', data);
        alert('Failed to get payment URL. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Payment processing failed'}`);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            CHOOSE YOUR FUNDING PATH
          </h1>
          <p className="text-xl text-silver font-light">
            Select an assessment account to begin your evaluation.
          </p>
        </div>

        {/* Pricing Grid - Refactored with .map() */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {accountTiers.map((tier, index) => (
            <div 
              key={index}
              className={`
                relative p-8 rounded-xl transition-all duration-300
                ${tier.popular 
                  ? 'bg-darkcard/80 border-2 border-gold shadow-[0_0_30px_rgba(255,215,0,0.1)] transform md:-translate-y-4 z-10' 
                  : 'bg-darkcard/40 border border-white/10 hover:border-neon/50'
                }
                backdrop-blur-sm group
              `}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold text-darkbg text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-gold' : 'text-white'}`}>
                  {tier.size}
                </h3>
                <div className="text-sm text-silver uppercase tracking-widest mb-6">{tier.name} Account</div>
                <div className="text-4xl font-light text-white">
                  {tier.price}
                  <span className="text-sm text-silver font-normal ml-1">/ one-time</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-silver text-sm">Profit Target</span>
                  <span className="text-neon font-mono font-bold">{tier.profitTarget}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-silver text-sm">Daily Drawdown</span>
                  <span className="text-white font-mono">{tier.dailyDrawdown}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-silver text-sm">Max Drawdown</span>
                  <span className="text-white font-mono">{tier.maxDrawdown}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-silver text-sm">Leverage</span>
                  <span className="text-white font-mono">{tier.leverage}</span>
                </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-silver text-sm">Time Limit</span>
                  <span className="text-white font-mono">Unlimited</span>
                </div>
              </div>

              <Button 
                variant={tier.popular ? 'secondary' : 'primary'} 
                fullWidth
                onClick={() => handleSelectTier(tier)}
                disabled={loadingTier !== null}
              >
                {loadingTier === tier.name ? 'Processing...' : 'Select Account'}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <p className="text-sm text-gray-500">
            * All accounts are simulated. Evaluation fees are refundable with the first payout on the live funded account.
            Trading financial markets involves substantial risk and is not suitable for every investor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;