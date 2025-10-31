import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [onboardingState, setOnboardingState] = useState({
    completed: null,
    step: 0,
    skipped: false,
    loading: true
  });

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('titleiq_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setOnboardingState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Check onboarding status ONCE when user is authenticated
  useEffect(() => {
    if (user && onboardingState.completed === null) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem('titleiq_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/onboarding/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      setOnboardingState({
        completed: data.onboardingCompleted || data.completed,
        step: data.onboardingStep || data.step || 0,
        skipped: localStorage.getItem('onboarding_skipped') === 'true',
        loading: false
      });
    } catch (err) {
      console.error('Failed to check onboarding status:', err);
      setOnboardingState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthed(true);
      } else {
        // Invalid token
        localStorage.removeItem('titleiq_token');
        setUser(null);
        setIsAuthed(false);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('titleiq_token');
      setUser(null);
      setIsAuthed(false);
    } finally {
      setLoading(false);
      setOnboardingState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.token) {
        localStorage.setItem('titleiq_token', response.token);
        setUser(response.user);
        setIsAuthed(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await authApi.register(email, password);
      if (response.success && response.token) {
        localStorage.setItem('titleiq_token', response.token);
        setUser(response.user);
        setIsAuthed(true);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('titleiq_token');
    setUser(null);
    setIsAuthed(false);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    await fetchUserProfile();
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    setOnboardingState(prev => ({ ...prev, skipped: true }));
  };

  const completeOnboarding = () => {
    setOnboardingState(prev => ({ ...prev, completed: true, skipped: false }));
    localStorage.removeItem('onboarding_skipped');
  };

  const value = {
    user,
    loading,
    isAuthed,
    login,
    register,
    logout,
    refreshUser,
    onboardingState,
    skipOnboarding,
    completeOnboarding,
    checkOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
