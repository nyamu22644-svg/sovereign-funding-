import React from 'react';
import Button from './Button';

interface PaymentSuccessProps {
  onGoToDashboard: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onGoToDashboard }) => {
  return (
    <div className="min-h-screen bg-darkbg flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20 pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-darkbg via-transparent to-darkbg/80 pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Success Card */}
        <div className="bg-darkcard/50 backdrop-blur-xl border border-gold/30 rounded-2xl p-12 shadow-[0_0_50px_rgba(255,215,0,0.1)] text-center relative overflow-hidden">
          {/* Top Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>

          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-gold/20 rounded-full animate-pulse"></div>
              <svg className="w-12 h-12 text-gold relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gold mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
            Payment Successful!
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl font-semibold text-white mb-6">
            Welcome to Sovereign Funding
          </h2>

          {/* Description */}
          <p className="text-silver text-base leading-relaxed mb-8">
            Your trading credentials have been sent to your email. Check your inbox (and spam folder) for your account details and login information.
          </p>

          {/* Info Box */}
          <div className="bg-neon/5 border border-neon/20 rounded-lg p-4 mb-8">
            <p className="text-neon text-sm">
              <span className="font-bold">Next Step:</span> Log in to your Client Portal to access your funded account and begin trading.
            </p>
          </div>

          {/* Action Button */}
          <Button 
            variant="secondary" 
            fullWidth
            onClick={onGoToDashboard}
          >
            Go to Dashboard
          </Button>

          {/* Support Link */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-400">
              Need help?{' '}
              <a href="#" className="text-neon hover:text-white transition-colors font-semibold">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Secure Transaction • Your data is encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
