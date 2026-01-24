import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './Button';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        console.log('Login successful:', data.user.email);
        onLoginSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkbg px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20 pb-20">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-darkbg via-transparent to-darkbg/80 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-darkcard/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
          
          <div className="text-center mb-10">
            <span className="text-neon text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Secure Environment</span>
            <h1 className="text-3xl font-bold text-gold tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
              CLIENT PORTAL
            </h1>
            <p className="mt-2 text-sm text-silver">Enter your credentials to access the trading floor.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                className="block w-full px-4 py-3 border border-white/10 rounded-lg bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors disabled:opacity-50"
                placeholder="trader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                className="block w-full px-4 py-3 border border-white/10 rounded-lg bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors disabled:opacity-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-neon border-gray-600 rounded bg-darkbg" />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-400">Remember me</label>
              </div>
              <a href="#" className="text-xs font-medium text-neon hover:text-white transition-colors">Forgot password?</a>
            </div>

            <Button variant="secondary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Secure Login'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <button onClick={onNavigateToSignup} className="font-bold text-gold hover:text-white transition-colors uppercase tracking-wide">
                Create Account
              </button>
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            256-bit SSL Encrypted Connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
