import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { settings as settingsApi } from '../utils/api';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hasKey, setHasKey] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user already has an API key
    settingsApi.getApiKeyStatus()
      .then(res => {
        setHasKey(res.data.hasKey);
        if (res.data.provider) {
          setProvider(res.data.provider);
        }
      })
      .catch(err => {
        console.error('Failed to get API key status:', err);
      });
  }, [isAuthenticated, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await settingsApi.saveApiKey(apiKey, provider);
      setSuccess('API key saved successfully!');
      setHasKey(true);
      setApiKey(''); // Clear input
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your API key?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await settingsApi.deleteApiKey();
      setSuccess('API key removed successfully');
      setHasKey(false);
      setApiKey('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove API key');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="font-heading text-3xl font-bold mb-6 text-primary">
            Settings
          </h1>

          {/* Account Info */}
          <div className="mb-8 p-4 bg-dark/50 border border-gray-700 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Account Email</p>
            <p className="text-gray-200">{user?.email}</p>
          </div>

          {/* API Key Section */}
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold mb-2 text-gray-200">
              Optional API Key
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              By default, TitleIQ uses a free AI service. Add your own OpenAI or Claude API key
              for premium results and higher rate limits.
            </p>

            {hasKey && (
              <div className="mb-4 p-4 bg-success/10 border border-success rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-success font-semibold">API Key Active</p>
                    <p className="text-gray-400 text-sm">Provider: {provider}</p>
                  </div>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="input-field"
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="claude">Anthropic (Claude)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasKey ? '••••••••••••••••' : 'sk-...'}
                  className="input-field"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Your API key is encrypted and never displayed. Only you can access it.
                </p>
              </div>

              {success && (
                <div className="p-3 bg-success/10 border border-success rounded-lg text-success text-sm">
                  {success}
                </div>
              )}

              {error && (
                <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !apiKey}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Saving...' : hasKey ? 'Update API Key' : 'Save API Key'}
              </button>
            </form>
          </div>

          {/* How to get API keys */}
          <div className="mt-8 p-4 bg-dark/50 border border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-200 mb-2">How to get API keys:</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <strong className="text-primary">OpenAI:</strong>{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </li>
              <li>
                <strong className="text-primary">Claude:</strong>{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline"
                >
                  console.anthropic.com/settings/keys
                </a>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
