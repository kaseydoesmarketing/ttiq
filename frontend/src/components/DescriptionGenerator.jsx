import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DescriptionGenerator = ({ videoTitle, generationId, onClose }) => {
  const [activeTab, setActiveTab] = useState('a');
  const [layouts, setLayouts] = useState(null);
  const [descriptionId, setDescriptionId] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(null);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'a', label: 'Creator/Educational', emoji: '🎓', color: 'purple' },
    { id: 'b', label: 'Show/Podcast', emoji: '🎙️', color: 'pink' },
    { id: 'c', label: 'News/Commentary', emoji: '📰', color: 'blue' },
    { id: 'd', label: 'Tech/Product Review', emoji: '🔧', color: 'green' }
  ];

  useEffect(() => {
    generateLayouts();
  }, []);

  const generateLayouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('titleiq_token');
      const response = await axios.post(
        `${API_URL}/api/descriptions/generate`,
        {
          videoTitle,
          generationId,
          timestamps: [] // Could be enhanced to pass actual timestamps
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLayouts(response.data.layouts);
      setDescriptionId(response.data.descriptionId);
      setLoading(false);

    } catch (error) {
      console.error('Failed to generate descriptions:', error);
      setError(error.response?.data?.error || 'Failed to generate descriptions');
      setLoading(false);
    }
  };

  const handleCopy = async (layoutKey) => {
    try {
      await navigator.clipboard.writeText(layouts[`layout_${layoutKey}`]);
      setCopySuccess(layoutKey);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSelect = async (layoutKey) => {
    try {
      const token = localStorage.getItem('titleiq_token');
      await axios.post(
        `${API_URL}/api/descriptions/select`,
        {
          descriptionId,
          layoutChoice: layoutKey
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelectedLayout(layoutKey);

      // Show success for 1 second then auto-copy
      setTimeout(() => {
        handleCopy(layoutKey);
      }, 500);

    } catch (error) {
      console.error('Failed to save selection:', error);
    }
  };

  const getCharCount = (layoutKey) => {
    if (!layouts) return 0;
    return layouts[`layout_${layoutKey}`]?.length || 0;
  };

  const getTabColor = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.color || 'purple';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Generating 4 Premium Layouts...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-semibold">PRO</span>
            </div>
            <h2 className="text-2xl font-bold text-white">4 Premium Description Layouts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? `text-${tab.color}-600 border-${tab.color}-500`
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Description Preview */}
              <div className="bg-gray-50 rounded-xl p-6 mb-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Preview (YouTube formatting)</span>
                  <span className={`text-sm font-medium ${
                    getCharCount(activeTab) > 5000 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getCharCount(activeTab)} / 5,000 characters
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {layouts && layouts[`layout_${activeTab}`]}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleCopy(activeTab)}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                    copySuccess === activeTab
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copySuccess === activeTab ? (
                    <>
                      <span className="mr-2">✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📋</span>
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSelect(activeTab)}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                    selectedLayout === activeTab
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  {selectedLayout === activeTab ? (
                    <>
                      <span className="mr-2">✓</span>
                      Selected & Saved
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⭐</span>
                      Use This Layout
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip:</h4>
                <p className="text-sm text-blue-800">
                  {activeTab === 'a' && "This layout works best for tutorial and educational content. Add your own timestamps for maximum engagement."}
                  {activeTab === 'b' && "Perfect for podcast-style content. Your platform links are auto-included from your profile."}
                  {activeTab === 'c' && "Ideal for news and commentary videos. Update the bullet points to match your video's key takeaways."}
                  {activeTab === 'd' && "Great for product reviews and tech content. Your affiliate links are automatically formatted."}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            All your links and CTAs are auto-included based on your profile settings.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DescriptionGenerator;
