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

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('titleiq_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

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

  const value = {
    user,
    loading,
    isAuthed,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
