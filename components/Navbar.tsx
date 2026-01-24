import React, { useState } from 'react';
import { NavItem } from '../types';
import Button from './Button';
import { ViewState } from '../App';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useContent();

  const navItems: NavItem[] = [
    { label: t('nav_evaluation'), href: '#' },
    { label: t('nav_scaling'), href: '#' },
    { label: t('nav_rules'), href: '#' },
    { label: t('nav_faq'), href: '#' },
    { label: t('nav_about'), href: '#' },
  ];

  const handleNavClick = (label: string) => {
    if (label === t('nav_evaluation')) {
      onNavigate('evaluation');
    } else if (label === t('nav_scaling')) {
      onNavigate('scaling-plan');
    } else if (label === t('nav_rules')) {
      onNavigate('trading-rules');
    } else if (label === t('nav_faq')) {
      onNavigate('faq');
    } else if (label === t('nav_about')) {
      onNavigate('about');
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
    onNavigate('login-page');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    onNavigate('dashboard');
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    onNavigate('profile');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onNavigate('settings');
    setIsOpen(false);
  };

  const handleAdminClick = () => {
    onNavigate('admin');
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
                      (item.label === 'FAQ' && currentView === 'faq') ||
                      (item.label === 'About' && currentView === 'about')
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
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <select className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-silver focus:outline-none focus:border-neon">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
              </select>
            </div>
            {user ? (
              <>
                <Button variant="secondary" className="px-6 py-2 text-xs" onClick={handleDashboardClick}>{t('nav_dashboard')}</Button>
                <Button variant="outline" className="px-4 py-2 text-xs" onClick={handleProfileClick} title="Profile">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </Button>
                <Button variant="outline" className="px-4 py-2 text-xs" onClick={handleSettingsClick} title={t('nav_settings')}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </Button>
                <Button variant="outline" className="px-6 py-2 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleLogout}>{t('nav_logout')}</Button>
              </>
            ) : (
              <Button variant="secondary" className="px-6 py-2 text-xs" onClick={handlePortalClick}>{t('nav_login')}</Button>
            )}
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
            {/* Language Selector Mobile */}
            <div className="px-3 py-2">
              <select className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-silver focus:outline-none focus:border-neon w-full">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Button variant="secondary" fullWidth onClick={handleDashboardClick}>{t('nav_dashboard')}</Button>
                  <Button variant="outline" fullWidth className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleLogout}>{t('nav_logout')}</Button>
                </>
              ) : (
                <Button variant="secondary" fullWidth onClick={handlePortalClick}>{t('nav_login')}</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;