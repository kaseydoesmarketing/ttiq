import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      description: 'GPT-4 Turbo - Industry-leading language model with deep understanding',
      badge: 'Most Reliable',
      available: ['trial', 'creator', 'creator_pro', 'admin']
    },
    groq: {
      name: 'Groq',
      description: 'Lightning-fast inference with Llama models',
      badge: 'Fastest',
      available: ['creator', 'creator_pro', 'admin']
    },
    grok: {
      name: 'Grok',
      description: 'Real-time data access with rebellious creativity',
      badge: 'Creator Pro',
      available: ['creator_pro', 'admin']
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Multimodal AI with deep reasoning capabilities',
      badge: 'Creator Pro',
      available: ['creator_pro', 'admin']
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedProvider(user.model_provider || 'openai');
  }, [user, navigate]);

  const handleSaveProvider = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await userApi.updateProvider(selectedProvider);

      if (response.success) {
        setUser(response.user);
        setMessage('Provider updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage(error.response.data.error || 'Upgrade required for this provider');
      } else {
        setMessage('Failed to update provider. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const isProviderAvailable = (providerKey) => {
    const provider = providerInfo[providerKey];
    if (!provider || !user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Check if user's plan is in the available list
    return provider.available.includes(user.plan);
  };

  const getProviderLockMessage = (providerKey) => {
    const provider = providerInfo[providerKey];
    if (user?.plan === 'trial') {
      return 'Upgrade to Creator to choose your AI provider';
    }
    if (user?.plan === 'creator' && provider.badge === 'Creator Pro') {
      return 'Upgrade to Creator Pro to unlock this model';
    }
    return '';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-200 hover:text-purple-100 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-purple-200">
            Customize your TitleIQ experience
          </p>
        </motion.div>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-purple-200">Email</div>
              <div className="text-white font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-purple-200">Current Plan</div>
              <div className="text-white font-medium capitalize">
                {user.plan === 'trial' && 'Trial'}
                {user.plan === 'creator' && 'Creator'}
                {user.plan === 'creator_pro' && 'Creator Pro'}
                {user.billing_status === 'lifetime' && ' (Lifetime Access)'}
              </div>
            </div>
            {user.role === 'admin' && (
              <div>
                <div className="text-sm text-purple-200">Role</div>
                <div className="text-orange-400 font-medium flex items-center gap-2">
                  👑 Administrator
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Provider Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-2">AI Provider</h2>
          <p className="text-purple-200 text-sm mb-6">
            {user.plan === 'trial'
              ? 'Upgrade to Creator to choose your preferred AI model'
              : 'Choose the AI model that best fits your content style'}
          </p>

          <div className="space-y-4">
            {Object.entries(providerInfo).map(([key, provider]) => {
              const available = isProviderAvailable(key);
              const lockMessage = getProviderLockMessage(key);

              return (
                <div
                  key={key}
                  className={`relative border rounded-xl p-4 transition ${
                    available
                      ? selectedProvider === key
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/20 bg-black/20 hover:border-purple-400 cursor-pointer'
                      : 'border-white/10 bg-black/30 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => available && setSelectedProvider(key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="radio"
                        checked={selectedProvider === key}
                        onChange={() => available && setSelectedProvider(key)}
                        disabled={!available}
                        className="mt-1 accent-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{provider.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            provider.badge === 'Most Reliable' ? 'bg-green-500/20 text-green-200' :
                            provider.badge === 'Fastest' ? 'bg-blue-500/20 text-blue-200' :
                            'bg-purple-500/20 text-purple-200'
                          }`}>
                            {provider.badge}
                          </span>
                        </div>
                        <p className="text-purple-200 text-sm">{provider.description}</p>
                        {!available && lockMessage && (
                          <p className="text-orange-300 text-xs mt-2 flex items-center gap-1">
                            🔒 {lockMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {user.plan === 'trial' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-purple-200 text-sm mb-3">
                Trial users have AI provider managed by TitleIQ for optimal results. Upgrade to Creator to unlock provider selection.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition"
              >
                View Upgrade Options
              </button>
            </div>
          )}

          {user.plan !== 'trial' && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSaveProvider}
                disabled={saving || selectedProvider === user.model_provider}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  saving || selectedProvider === user.model_provider
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {message && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm ${
                    message.includes('success') ? 'text-green-300' : 'text-orange-300'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Upgrade CTA (for non-Pro users) */}
        {user.plan !== 'creator_pro' && user.billing_status !== 'lifetime' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
          >
            <h2 className="text-xl font-bold text-white mb-2">
              Unlock All AI Models
            </h2>
            <p className="text-purple-200 mb-4">
              Upgrade to Creator Pro to access Grok, Gemini, and all future models
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              Upgrade to Creator Pro
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
