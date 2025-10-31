import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingModal from './OnboardingModal';
import PulseIndicator from './PulseIndicator';

const Navbar = () => {
  const { isAuthed, user, logout, onboardingState } = useAuth();
  const location = useLocation();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const shouldShowPulse = user && onboardingState.skipped &&
    !localStorage.getItem('hide_onboarding_pulse');

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-lg">TitleIQ</span>
                <span className="text-gray-400 text-xs">by TightSlice</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={'text-sm font-medium transition-colors ' + (isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white')}>
              Home
            </Link>
            <Link to="/app" className={'text-sm font-medium transition-colors ' + (isActive('/app') ? 'text-white' : 'text-gray-400 hover:text-white')}>
              App
            </Link>
            <Link to="/pricing" className={'text-sm font-medium transition-colors ' + (isActive('/pricing') ? 'text-white' : 'text-gray-400 hover:text-white')}>
              Pricing
            </Link>
            <a href="https://tightslice.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20">
              🚀 1:1 Growth Coaching
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthed ? (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30">
                  Start Free Trial
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={'text-sm font-medium transition-colors ' + (isActive('/dashboard') ? 'text-white' : 'text-gray-400 hover:text-white')}>
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setShowOnboardingModal(true);
                    localStorage.setItem('hide_onboarding_pulse', 'true');
                  }}
                  className="relative flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Onboarding
                  {shouldShowPulse && <PulseIndicator />}
                </button>
                <Link to="/settings" className={'text-sm font-medium transition-colors ' + (isActive('/settings') ? 'text-white' : 'text-gray-400 hover:text-white')}>
                  Settings
                </Link>
                {user?.plan && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-900/40 rounded-lg border border-purple-600/50 backdrop-blur-sm">
                    {user.plan === 'trial' && 'Trial'}
                    {user.plan === 'creator' && 'Creator'}
                    {user.plan === 'creator_pro' && 'Pro'}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-all border border-red-500/50 backdrop-blur-sm shadow-lg shadow-red-500/20"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <OnboardingModal
        open={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
    </nav>
  );
};

export default Navbar;
