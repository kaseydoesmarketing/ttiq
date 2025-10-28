import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for resend
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });

      setMessage(response.data.message);
      setLastSentEmail(email);

      // If in development mode, show the token
      if (response.data.dev_token) {
        setMessage(
          `Reset code: ${response.data.dev_token} (valid for 15 minutes)`
        );
      }

      // Start 60-second resend timer
      setCanResend(false);
      setResendTimer(60);

      setEmail('');
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.response?.data?.error || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !lastSentEmail) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email: lastSentEmail });

      setMessage('Reset code sent again. Check your email.');

      if (response.data.dev_token) {
        setMessage(
          `Reset code: ${response.data.dev_token} (valid for 15 minutes)`
        );
      }

      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else {
        setError(err.response?.data?.error || 'Failed to resend code');
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
              Reset Password
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your email and we'll send you a reset code
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
              {message.includes('Reset code:') && (
                <div className="mt-2">
                  <Link
                    to="/reset-password"
                    className="text-green-300 hover:text-green-200 font-medium underline"
                  >
                    Enter reset code →
                  </Link>
                </div>
              )}

              {/* Resend option */}
              {lastSentEmail && (
                <div className="mt-3 pt-3 border-t border-green-700/30">
                  <button
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className="text-xs text-green-300 hover:text-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!canResend && resendTimer > 0
                      ? `Resend code in ${resendTimer}s`
                      : 'Didn\'t receive it? Resend code'}
                  </button>
                </div>
              )}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Back to Login
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Have a reset code?{' '}
              <Link to="/reset-password" className="text-purple-400 hover:text-purple-300 font-medium">
                Enter Code →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
