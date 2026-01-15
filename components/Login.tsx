import React, { useState } from 'react';
import Button from './Button';

interface LoginProps {
  onLogin: () => void;
  onNavigateToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login process
    setTimeout(() => {
        onLogin();
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkbg px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20 pb-20">
       {/* Background Elements */}
       <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
       <div className="absolute inset-0 bg-gradient-to-b from-darkbg via-transparent to-darkbg/80 pointer-events-none"></div>

       <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
          <div className="bg-darkcard/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
             {/* Top Glow */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
             
             <div className="text-center mb-10">
                <span className="text-neon text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Secure Environment</span>
                <h1 className="text-3xl font-bold text-gold tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                   CLIENT PORTAL
                </h1>
                <p className="mt-2 text-sm text-silver">Enter your credentials to access the trading floor.</p>
             </div>

             <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                   <label htmlFor="email" className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">
                      Email Address
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors duration-200"
                        placeholder="trader@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>
                </div>

                <div>
                   <label htmlFor="password" className="block text-xs font-medium text-silver uppercase tracking-wider mb-2">
                      Password
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-darkbg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon focus:border-neon sm:text-sm transition-colors duration-200"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-neon focus:ring-neon border-gray-600 rounded bg-darkbg"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-400">
                        Remember me
                      </label>
                   </div>

                   <div className="text-xs">
                      <a href="#" className="font-medium text-neon hover:text-white transition-colors">
                        Forgot password?
                      </a>
                   </div>
                </div>

                <div>
                   <Button variant="secondary" fullWidth type="submit" className="shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                      Secure Login
                   </Button>
                </div>
             </form>

             <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-gray-400">
                   Don't have an account?{' '}
                   <button onClick={onNavigateToSignup} className="font-bold text-gold hover:text-white transition-colors uppercase tracking-wide">
                      Start Evaluation
                   </button>
                </p>
             </div>
          </div>
          
          <div className="text-center">
             <p className="text-xs text-gray-600 flex items-center justify-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                256-bit SSL Encrypted Connection
             </p>
          </div>
       </div>
    </div>
  );
};

export default Login;