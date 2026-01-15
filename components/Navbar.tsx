import React, { useState } from 'react';
import { NavItem } from '../types';
import Button from './Button';
import { ViewState } from '../App';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

const navItems: NavItem[] = [
  { label: 'Evaluation', href: '#' },
  { label: 'Scaling Plan', href: '#' },
  { label: 'Trading Rules', href: '#' },
  { label: 'FAQ', href: '#' },
];

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (label: string) => {
    if (label === 'Evaluation') {
      onNavigate('evaluation');
    } else if (label === 'Scaling Plan') {
      onNavigate('scaling-plan');
    } else if (label === 'Trading Rules') {
      onNavigate('trading-rules');
    } else if (label === 'FAQ') {
      onNavigate('faq');
    } else {
      // Placeholder for other links
      onNavigate('home');
    }
    setIsOpen(false);
  };

  const handleLogoClick = () => {
    onNavigate('home');
    setIsOpen(false);
  };

  const handlePortalClick = () => {
    onNavigate('login');
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
              <span className="text-2xl font-bold tracking-tighter text-white">
                SOVEREIGN <span className="text-gold">FUNDING</span>
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className={`${
                      (item.label === 'Evaluation' && currentView === 'evaluation') ||
                      (item.label === 'Scaling Plan' && currentView === 'scaling-plan') ||
                      (item.label === 'Trading Rules' && currentView === 'trading-rules') ||
                      (item.label === 'FAQ' && currentView === 'faq')
                        ? 'text-neon' 
                        : 'text-silver'
                    } hover:text-neon px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 uppercase tracking-wide bg-transparent border-none cursor-pointer focus:outline-none`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
             <Button variant="secondary" className="px-6 py-2 text-xs" onClick={handlePortalClick}>Client Portal</Button>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-silver hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                className="text-silver hover:text-neon block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4">
                 <Button variant="secondary" fullWidth onClick={handlePortalClick}>Client Portal</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;