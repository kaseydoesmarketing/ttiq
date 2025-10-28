import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();

  // Password requirements
  const requirements = [
    { label: 'At least 10 characters', check: (pwd) => pwd.length >= 10 },
    { label: 'One uppercase letter', check: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', check: (pwd) => /[a-z]/.test(pwd) },
    { label: 'One number', check: (pwd) => /[0-9]/.test(pwd) },
    { label: 'One special character', check: (pwd) => /[^a-zA-Z0-9]/.test(pwd) }
  ];

  // Check password requirements
  useEffect(() => {
    if (newPassword) {
      const failed = requirements.filter(req => !req.check(newPassword));
      setPasswordErrors(failed.map(req => req.label));
    } else {
      setPasswordErrors([]);
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (passwordErrors.length > 0) {
      setError('Password does not meet all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email,
        token,
        newPassword
      });

      setMessage(response.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.details && Array.isArray(errorData.details)) {
        setError(errorData.details.join('. '));
      } else {
        setError(errorData?.error || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Enter Reset Code
            </h1>
            <p className="text-gray-400 text-sm">
              Check your email for the 6-digit code
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                placeholder="000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />

              {/* Password Requirements */}
              {(passwordFocused || newPassword.length > 0) && (
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Password must contain:</p>
                  <ul className="space-y-1">
                    {requirements.map((req, index) => {
                      const isValid = newPassword && req.check(newPassword);
                      return (
                        <li
                          key={index}
                          className={`text-xs flex items-center gap-2 ${
                            isValid ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          <span className="text-base">{isValid ? '✓' : '○'}</span>
                          {req.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || !newPassword || !confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Don't have a code?{' '}
              <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">
                Request Reset Code
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
