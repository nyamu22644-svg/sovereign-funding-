import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './Button';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess(true);
        setTimeout(() => onSignupSuccess(), 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg px-4 pt-20 pb-20">
        <div className="max-w-md w-full bg-darkcard/50 backdrop-blur-xl border border-gold/30 rounded-2xl p-12 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gold mb-4">Account Created!</h2>
          <p className="text-silver mb-6">Check your email for the confirmation link to activate your account.</p>
          <Button variant="primary" onClick={onNavigateToLogin}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkbg px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20 pb-20">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-darkbg via-transparent to-darkbg/80 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-darkcard/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon to-transparent opacity-50"></div>
          
          <div className="text-center mb-10">
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Join The Elite</span>
            <h1 className="text-3xl font-bold text-white tracking-tighter">
              CREATE <span className="text-gold">ACCOUNT</span>
            </h1>
            <p className="mt-2 text-sm text-silver">Start your journey to funded trading.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                disabled={loading}
                className="block w-full px-4 py-3 border border-white/10 rounded-lg bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors disabled:opacity-50"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">Email Address</label>
              <input
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
              <label className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                disabled={loading}
                className="block w-full px-4 py-3 border border-white/10 rounded-lg bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors disabled:opacity-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                required
                disabled={loading}
                className="block w-full px-4 py-3 border border-white/10 rounded-lg bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors disabled:opacity-50"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input id="terms" type="checkbox" required className="h-4 w-4 text-neon border-gray-600 rounded bg-darkbg" />
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-400">
                I agree to the <a href="#" className="text-neon hover:text-white">Terms of Service</a> and <a href="#" className="text-neon hover:text-white">Privacy Policy</a>
              </label>
            </div>

            <Button variant="secondary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button onClick={onNavigateToLogin} className="font-bold text-neon hover:text-white transition-colors uppercase tracking-wide">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
