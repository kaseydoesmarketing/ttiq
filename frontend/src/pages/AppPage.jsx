import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { generation } from '../utils/api';

export default function AppPage() {
  const [inputType, setInputType] = useState('url'); // 'url' or 'text'
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generation.generate(input, inputType);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate titles');

      // If URL failed, suggest paste fallback
      if (err.response?.data?.fallbackRequired) {
        setInputType('text');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleExport = () => {
    if (!result) return;

    const exportData = {
      titles: result.titles,
      description: result.description,
      themes: result.themes,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titleiq-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Generate Optimized Titles
          </h1>
          <p className="text-gray-400">
            Paste a YouTube URL or raw transcript to get 10 high-CTR title options
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputType('url')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                inputType === 'url'
                  ? 'bg-primary text-dark'
                  : 'bg-dark border border-gray-700 text-gray-400 hover:text-primary'
              }`}
            >
              YouTube URL
            </button>
            <button
              onClick={() => setInputType('text')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                inputType === 'text'
                  ? 'bg-primary text-dark'
                  : 'bg-dark border border-gray-700 text-gray-400 hover:text-primary'
              }`}
            >
              Paste Transcript
            </button>
          </div>

          <form onSubmit={handleGenerate}>
            {inputType === 'url' ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-field"
                required
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your video transcript here..."
                className="input-field min-h-[200px] resize-y"
                required
              />
            )}

            {error && (
              <div className="mt-4 p-4 bg-error/10 border border-error rounded-lg text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !input}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Generate Titles'}
            </button>
          </form>
        </motion.div>

        {/* Loading Animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Analyzing transcript and generating titles...</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Themes */}
              <div className="card">
                <h2 className="font-heading text-2xl font-bold mb-4 text-primary">
                  Core Themes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.themes.map((theme, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-sm font-semibold text-primary"
                    >
                      {theme}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-2xl font-bold text-primary">
                    10 Title Options
                  </h2>
                  <button
                    onClick={handleExport}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Export All
                  </button>
                </div>

                <div className="space-y-3">
                  {result.titles.map((title, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="title-card group"
                      onClick={() => handleCopy(title)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-gray-500 text-sm">#{i + 1}</span>
                          <p className="text-gray-200 font-medium mt-1">{title}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {title.length} characters
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(title);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-primary text-dark rounded-lg text-sm font-semibold"
                        >
                          Copy
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-heading text-2xl font-bold text-primary">
                    Optimized Description
                  </h2>
                  <button
                    onClick={() => handleCopy(result.description)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {result.description}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {result.description.length} characters
                </p>
              </div>

              {/* Provider Info */}
              <div className="text-center text-gray-500 text-sm">
                Generated using: {result.usedProvider}
              </div>

              {/* Regenerate Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setInput('');
                  }}
                  className="btn-secondary px-8 py-3"
                >
                  Generate New Titles
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
