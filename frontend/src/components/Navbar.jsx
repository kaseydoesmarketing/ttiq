import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthed, user, logout } = useAuth();
  const location = useLocation();

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
                {user?.plan && (
                  <div className="px-2 py-1 text-xs font-semibold text-purple-400 bg-purple-900/30 rounded-md border border-purple-700/50">
                    {user.plan === 'trial' && 'Trial'}
                    {user.plan === 'creator' && 'Creator'}
                    {user.plan === 'creator_pro' && 'Pro'}
                  </div>
                )}
                <button onClick={logout} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
