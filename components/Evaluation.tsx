'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import Button from './Button';

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

type PaymentMethod = 'mpesa' | 'card' | 'crypto';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const Evaluation: React.FC = () => {
  const { t } = useContent();
  
  const accountTiers: AccountTier[] = [
    {
      name: t('eval_tier1_name'),
      size: t('eval_tier1_size'),
      price: t('eval_tier1_price'),
      profitTarget: t('eval_profit_target'),
      dailyDrawdown: t('eval_daily_drawdown'),
      maxDrawdown: t('eval_max_drawdown'),
      leverage: t('eval_leverage'),
      popular: false
    },
    {
      name: t('eval_tier2_name'),
      size: t('eval_tier2_size'),
      price: t('eval_tier2_price'),
      profitTarget: t('eval_profit_target'),
      dailyDrawdown: t('eval_daily_drawdown'),
      maxDrawdown: t('eval_max_drawdown'),
      leverage: t('eval_leverage'),
      popular: true
    },
    {
      name: t('eval_tier3_name'),
      size: t('eval_tier3_size'),
      price: t('eval_tier3_price'),
      profitTarget: t('eval_profit_target'),
      dailyDrawdown: t('eval_daily_drawdown'),
      maxDrawdown: t('eval_max_drawdown'),
      leverage: t('eval_leverage'),
      popular: false
    }
  ];

  const [paymentModalTier, setPaymentModalTier] = useState<AccountTier | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');
  const [phone, setPhone] = useState('');
  
  const { user } = useAuth();

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return /^(?:254)?([71]\d{8})$/.test(digits) || /^(?:0)([71]\d{8})$/.test(digits);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('254')) return digits;
    if (digits.length === 10 && digits.startsWith('0')) return '254' + digits.substring(1);
    if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) return '254' + digits;
    return digits;
  };

  const handleOpenModal = (tier: AccountTier) => {
    if (!user?.email) {
      alert('Please log in to purchase an evaluation account.');
      return;
    }
    setPaymentModalTier(tier);
    setSelectedMethod(null);
    setPaymentStatus('idle');
    setPaymentMessage('');
    setPhone('');
  };

  const handleCloseModal = () => {
    setPaymentModalTier(null);
    setPaymentStatus('idle');
  };

  const handleProcessPayment = async () => {
    if (!paymentModalTier || !user?.email) return;

    if (selectedMethod === 'mpesa') {
      if (!isValidPhone(phone)) {
        setPaymentStatus('error');
        setPaymentMessage('Invalid phone. Use formats like 07..., 01..., or 254...');
        return;
      }

      setPaymentStatus('processing');
      setPaymentMessage('Initiating STK Push...');

      try {
        const amount = parseInt(paymentModalTier.price.replace(/\D/g, ''));
        const normalizedPhone = formatPhone(phone);
        
        console.log('Sending payment request:', { normalizedPhone, amount });

        const response = await fetch('http://localhost:3005/api/pay-tinypesa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency: 'KES',
            email: user.email,
            tierName: paymentModalTier.name,
            phone: normalizedPhone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Payment initiation failed');
        }

        setPaymentStatus('success');
        setPaymentMessage(data.message || 'STK Push sent! Enter your M-Pesa PIN on your phone.');
      } catch (error) {
        console.error('Payment Error:', error);
        setPaymentStatus('error');
        setPaymentMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
      }
    } else {
      setPaymentStatus('error');
      setPaymentMessage('This payment method is currently under maintenance.');
    }
  };

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            {t('eval_title')}
          </h1>
          <p className="text-xl text-silver font-light">
            {t('eval_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {accountTiers.map((tier, index) => (
            <div 
              key={index}
              className={`
                relative group cursor-pointer transition-all duration-500 transform hover:scale-105
                ${tier.popular 
                  ? 'bg-gradient-to-br from-gold/10 via-darkcard/80 to-neon/5 border-2 border-gold/50 shadow-2xl shadow-gold/20' 
                  : 'bg-gradient-to-br from-darkcard/60 to-darkcard/30 border border-white/10 hover:border-neon/30'
                }
                backdrop-blur-xl rounded-2xl p-8 hover:shadow-2xl overflow-hidden
              `}
              onClick={() => handleOpenModal(tier)}
            >
              {/* Animated Background Glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                tier.popular ? 'bg-gradient-to-br from-gold/5 to-neon/5' : 'bg-gradient-to-br from-neon/5 to-transparent'
              }`}></div>

              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-gold to-neon text-darkbg text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                    🔥 Most Popular
                  </div>
                </div>
              )}

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-16 h-16 border border-neon/30 rounded-full animate-spin-slow"></div>
              </div>
              <div className="absolute bottom-4 left-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-12 h-12 bg-gold/20 rounded-full animate-bounce delay-1000"></div>
              </div>

              <div className="relative z-10">
                {/* Account Size */}
                <div className="text-center mb-6">
                  <div className={`text-4xl font-black mb-2 ${tier.popular ? 'text-gold' : 'text-white'} group-hover:scale-110 transition-transform`}>
                    {tier.size}
                  </div>
                  <div className="text-sm text-silver/70 uppercase tracking-widest font-semibold mb-4">
                    {tier.name} Account
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-light text-white">{tier.price}</span>
                    <span className="text-sm text-silver/60 font-normal">/ one-time</span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4 mb-8">
                  {[
                    { label: 'Profit Target', value: tier.profitTarget, highlight: true },
                    { label: 'Daily Drawdown', value: tier.dailyDrawdown, highlight: false },
                    { label: 'Max Drawdown', value: tier.maxDrawdown, highlight: false },
                    { label: 'Leverage', value: tier.leverage, highlight: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 group-hover:border-white/10 transition-colors">
                      <span className="text-silver/80 text-sm font-medium">{item.label}</span>
                      <span className={`font-mono font-bold text-sm ${
                        item.highlight ? 'text-neon' : 'text-white'
                      } group-hover:scale-105 transition-transform`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button 
                    variant={tier.popular ? "secondary" : "primary"}
                    className="w-full group-hover:shadow-lg transition-shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(tier);
                    }}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Start Evaluation</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                      </svg>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center max-w-3xl mx-auto">
          <p className="text-sm text-gray-500">
            * All accounts are simulated. Evaluation fees are refundable with the first payout on the live funded account.
            Trading financial markets involves substantial risk and is not suitable for every investor.
          </p>
        </div>

        {paymentModalTier && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
            <div className="bg-darkcard border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">
              
              <div className="w-full md:w-1/3 bg-darkbg p-6 border-b md:border-b-0 md:border-r border-white/5">
                <h3 className="text-lg font-semibold text-white mb-6">Payment Method</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                        setSelectedMethod('mpesa');
                        setPaymentStatus('idle');
                        setPaymentMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedMethod === 'mpesa'
                        ? 'bg-green-500/10 border-green-500/50 text-white'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-xs opacity-70">Mobile Money</div>
                  </button>

                  <button
                    onClick={() => {
                        setSelectedMethod('card');
                        setPaymentStatus('idle');
                        setPaymentMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedMethod === 'card'
                        ? 'bg-blue-500/10 border-blue-500/50 text-white'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Card</span>
                        <span className="text-[10px] bg-white/10 px-1 rounded">Soon</span>
                    </div>
                    <div className="text-xs opacity-70">Credit/Debit</div>
                  </button>

                  <button
                    onClick={() => {
                        setSelectedMethod('crypto');
                        setPaymentStatus('idle');
                        setPaymentMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedMethod === 'crypto'
                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Crypto</span>
                        <span className="text-[10px] bg-white/10 px-1 rounded">Soon</span>
                    </div>
                    <div className="text-xs opacity-70">USDT / BTC</div>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-2/3 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{paymentModalTier.name} Plan</h3>
                    <p className="text-gold text-lg font-mono">{paymentModalTier.price}</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div className="flex-grow">
                  {!selectedMethod ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                        <p>Select a payment method to continue</p>
                    </div>
                  ) : selectedMethod === 'mpesa' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                       <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                          <p className="text-sm text-green-200">
                             We will send an STK Push to your phone for authorization.
                          </p>
                       </div>
                       <div>
                          <label className="block text-sm text-silver mb-2 font-medium">M-Pesa Number</label>
                          <input
                            type="tel"
                            placeholder="07XXXXXXXX or 254..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-darkbg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                          />
                          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Format: 07... / 01... or 254...</p>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 animate-in slide-in-from-bottom-2">
                         <div className="p-4 rounded-full bg-white/5 text-xl">🚧</div>
                         <p>This payment method is under maintenance.</p>
                         <button 
                            onClick={() => setSelectedMethod('mpesa')}
                            className="text-neon text-sm hover:underline"
                         >
                            Use M-Pesa instead
                         </button>
                    </div>
                  )}
                </div>

                <div className="min-h-[40px] mt-4">
                  {paymentMessage && (
                      <div className={`p-3 rounded text-sm animate-in zoom-in-95 ${
                          paymentStatus === 'error' ? 'bg-red-500/10 text-red-200 border border-red-500/20' :
                          paymentStatus === 'success' ? 'bg-green-500/10 text-green-200 border border-green-500/20' :
                          'bg-blue-500/10 text-blue-200 border border-blue-500/20'
                      }`}>
                          {paymentMessage}
                      </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex justify-end gap-3">
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    disabled={!selectedMethod || paymentStatus === 'processing' || (selectedMethod !== 'mpesa')}
                    onClick={handleProcessPayment}
                  >
                    {paymentStatus === 'processing' ? 'Processing...' : `Pay ${paymentModalTier.price}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluation;