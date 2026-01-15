import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Evaluation from './components/Evaluation';
import Dashboard from './components/Dashboard';
import ScalingPlan from './components/ScalingPlan';
import TradingRules from './components/TradingRules';
import FAQ from './components/FAQ';
import Login from './components/Login';

const Footer: React.FC = () => (
  <footer className="bg-darkbg border-t border-white/5 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
           <span className="text-xl font-bold tracking-tighter text-white">
                SOVEREIGN <span className="text-gold">FUNDING</span>
            </span>
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              Empowering traders worldwide with capital and institutional-grade technology.
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
          &copy; {new Date().getFullYear()} Sovereign Funding. All rights reserved. 
          Trading involves significant risk.
        </p>
      </div>
    </div>
  </footer>
);

export type ViewState = 'home' | 'evaluation' | 'dashboard' | 'scaling-plan' | 'trading-rules' | 'faq' | 'login';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  return (
    <div className="min-h-screen bg-darkbg text-silver font-sans selection:bg-neon selection:text-darkbg">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <main>
        {currentView === 'home' && (
          <>
            <Hero onStartEvaluation={() => setCurrentView('evaluation')} />
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
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'scaling-plan' && <ScalingPlan onStartEvaluation={() => setCurrentView('evaluation')} />}
        {currentView === 'trading-rules' && <TradingRules />}
        {currentView === 'faq' && <FAQ />}
        {currentView === 'login' && (
          <Login 
            onLogin={() => setCurrentView('dashboard')} 
            onNavigateToSignup={() => setCurrentView('evaluation')} 
          />
        )}
      </main>
      {currentView !== 'login' && <Footer />}
    </div>
  );
};

export default App;