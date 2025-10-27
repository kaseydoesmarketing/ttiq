import React, { useState } from 'react';
import { newsletterApi } from '../utils/api';
import { track } from '../utils/analytics';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await newsletterApi.signup(email);
      track('newsletter_signup', {
        source: 'homepage'
      });
      setStatus('success');
      setMessage("You're in. Check your inbox.");
      setEmail('');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to subscribe');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-700/30">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          🔥 Become unscrollable
        </h3>
        <p className="text-gray-300 text-sm">
          Twice a week we send viral hooks, retention tricks, and thumbnail angles.
          <br />
          Sent Tues & Fri @ 11am EST.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Get The Playbook'}
        </button>
      </form>

      {message && (
        <div className={'mt-4 p-3 rounded-lg text-sm text-center ' + (status === 'success' ? 'bg-green-900/30 text-green-400 border border-green-700/50' : 'bg-red-900/30 text-red-400 border border-red-700/50')}>
          {message}
        </div>
      )}
    </div>
  );
};

export default NewsletterSignup;
