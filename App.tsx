import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Evaluation from './components/Evaluation';
import Dashboard from './components/Dashboard';
import ScalingPlan from './components/ScalingPlan';
import TradingRules from './components/TradingRules';
import FAQ from './components/FAQ';
import Login from './components/Login';
import PaymentSuccess from './components/PaymentSuccess';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './pages/SettingsPage';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import ProfilePage from './components/ProfilePage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider, useContent } from './context/ContentContext';

const Footer: React.FC = () => {
  const { t } = useContent();
  
  return (
    <footer className="bg-darkbg border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <span className="text-xl font-bold tracking-tighter text-white">
                  SOVEREIGN <span className="text-gold">FUNDING</span>
              </span>
              <p className="mt-4 text-sm text-gray-500 max-w-xs">
                {t('footer_tagline')}
              </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-silver tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-neon text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-neon text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-neon text-sm">Risk Disclosure</a></li>
            </ul>
          </div>
          <div>
             <h3 className="text-sm font-semibold text-silver tracking-wider uppercase">Support</h3>
             <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-neon text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-neon text-sm">Contact Us</a></li>
             </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {t('footer_copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export type ViewState = 'home' | 'evaluation' | 'dashboard' | 'scaling-plan' | 'trading-rules' | 'faq' | 'login' | 'payment-success' | 'login-page' | 'signup' | 'settings' | 'admin' | 'about' | 'superadmin';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const { user, signOut } = useAuth();

  // Route-like handling for payment return without a router
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      setCurrentView('payment-success');
      params.delete('payment');
      window.history.replaceState({}, document.title, window.location.pathname + (params.toString() ? `?${params.toString()}` : ''));
    }
    if (paymentStatus === 'cancel') {
      setCurrentView('evaluation');
      params.delete('payment');
      window.history.replaceState({}, document.title, window.location.pathname + (params.toString() ? `?${params.toString()}` : ''));
    }
    
    // Handle /admin path
    if (window.location.pathname === '/admin') {
      setCurrentView('admin');
    }
  }, []);

  return (
    <div className="min-h-screen bg-darkbg text-silver font-sans selection:bg-neon selection:text-darkbg">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <main>
        {currentView === 'home' && (
          <>
            <Hero onStartEvaluation={() => {
              if (user) {
                setCurrentView('evaluation');
              } else {
                setCurrentView('signup');
              }
            }} />
            {/* Value Prop Section */}
            <section className="py-20 bg-darkbg relative">
               <div className="max-w-7xl mx-auto px-4 text-center">
                 <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>
                 <p className="text-sm uppercase tracking-[0.3em] text-silver/40">Institutional Grade Execution</p>
               </div>
            </section>
          </>
        )}
        {currentView === 'evaluation' && <Evaluation />}
        {currentView === 'about' && (
          <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                  About Sovereign Funding
                </h1>
                <p className="text-xl text-silver font-light">
                  Empowering traders with institutional-grade funding solutions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="glass-panel p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-silver leading-relaxed">
                    To democratize access to professional trading capital, enabling skilled traders to scale their strategies 
                    without the limitations of personal capital constraints.
                  </p>
                </div>
                
                <div className="glass-panel p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                  <p className="text-silver leading-relaxed">
                    To become the world's leading prop trading firm, recognized for our commitment to trader success, 
                    technological innovation, and transparent evaluation processes.
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-8">Why Choose Sovereign Funding?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-panel p-6">
                    <div className="text-neon text-4xl mb-4">⚡</div>
                    <h4 className="text-xl font-bold text-white mb-2">Fast Payouts</h4>
                    <p className="text-silver text-sm">Get paid within 24 hours of reaching your profit target</p>
                  </div>
                  <div className="glass-panel p-6">
                    <div className="text-gold text-4xl mb-4">🎯</div>
                    <h4 className="text-xl font-bold text-white mb-2">Fair Evaluation</h4>
                    <p className="text-silver text-sm">Transparent rules with no hidden fees or tricky conditions</p>
                  </div>
                  <div className="glass-panel p-6">
                    <div className="text-neon text-4xl mb-4">🚀</div>
                    <h4 className="text-xl font-bold text-white mb-2">Scaling Opportunities</h4>
                    <p className="text-silver text-sm">Scale up to $2M+ accounts as you prove your trading skills</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentView === 'scaling-plan' && <ScalingPlan onStartEvaluation={() => setCurrentView('evaluation')} />}
        {currentView === 'trading-rules' && <TradingRules />}
        {currentView === 'faq' && <FAQ />}
        {currentView === 'login' && (
          <Login 
            onLogin={() => setCurrentView('dashboard')} 
            onNavigateToSignup={() => setCurrentView('signup')} 
          />
        )}
        {currentView === 'login-page' && (
          <LoginPage 
            onLoginSuccess={() => setCurrentView('dashboard')} 
            onNavigateToSignup={() => setCurrentView('signup')} 
          />
        )}
        {currentView === 'signup' && (
          <SignupPage 
            onSignupSuccess={() => setCurrentView('evaluation')} 
            onNavigateToLogin={() => setCurrentView('login-page')} 
          />
        )}
        {currentView === 'dashboard' && (
          <ProtectedRoute onNavigateToLogin={() => setCurrentView('login-page')}>
            <Dashboard onNavigate={setCurrentView} />
          </ProtectedRoute>
        )}
        {currentView === 'payment-success' && (
          <PaymentSuccess onGoToDashboard={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'settings' && (
          <ProtectedRoute onNavigateToLogin={() => setCurrentView('login-page')}>
            <SettingsPage />
          </ProtectedRoute>
        )}
        {currentView === 'profile' && (
          <ProtectedRoute onNavigateToLogin={() => setCurrentView('login-page')}>
            <ProfilePage />
          </ProtectedRoute>
        )}
        {currentView === 'admin' && <Admin />}
        {currentView === 'superadmin' && <SuperAdmin />}
      </main>
      {currentView !== 'login' && currentView !== 'login-page' && currentView !== 'signup' && currentView !== 'payment-success' && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;