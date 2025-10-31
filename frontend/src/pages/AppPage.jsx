import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { generateApi } from '../utils/api';
import { track } from '../utils/analytics';
import Navbar from '../components/Navbar';
import QuotaPill from '../components/QuotaPill';
import AuthGateModal from '../components/AuthGateModal';
import UpgradeModal from '../components/UpgradeModal';
import DescriptionGenerator from '../components/DescriptionGenerator';

export default function AppPage() {
  const { user, isAuthed } = useAuth();

  // Phase state machine
  const [phase, setPhase] = useState('idle');
  // Phases: 'idle', 'fetchingTranscript', 'waitingForASR', 'transcriptReady', 'generatingTitles', 'titlesReady', 'error'

  // Input mode
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'text'

  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [transcriptText, setTranscriptText] = useState('');

  // Transcript metadata
  const [sourceInfo, setSourceInfo] = useState(null); // { cached, source, videoId, durationSec }
  const [activeJobId, setActiveJobId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [pollingStartTime, setPollingStartTime] = useState(null);

  // Error state
  const [error, setError] = useState('');

  // Results state
  const [titlesResult, setTitlesResult] = useState(null); // { titles[], description, tags, usedProvider }

  // UI state
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDescriptionGenerator, setShowDescriptionGenerator] = useState(false);

  // Animated loading dots effect
  useEffect(() => {
    if (phase === 'fetchingTranscript' || phase === 'waitingForASR' || phase === 'generatingTitles') {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots('');
    }
  }, [phase]);

  // Polling effect for async ASR jobs
  useEffect(() => {
    if (!activeJobId) return;

    const interval = setInterval(async () => {
      try {
        // Check for 2-minute timeout
        const now = Date.now();
        if (pollingStartTime && (now - pollingStartTime) > 2 * 60 * 1000) {
          clearInterval(interval);
          setActiveJobId(null);
          setPollingStartTime(null);
          setStatusMessage('');
          setPhase('error');
          setError('Transcription timed out. Please try again or paste your script manually.');
          return;
        }

        const response = await fetch(`/api/transcript/status/${activeJobId}`);
        const data = await response.json();

        if (data.status === 'done') {
          // Job completed successfully
          clearInterval(interval);
          setTranscriptText(data.transcript);
          setSourceInfo({
            cached: false,
            source: data.source || 'asr',
            videoId: null,
            durationSec: data.durationSec || null,
          });
          setActiveJobId(null);
          setPollingStartTime(null);
          setStatusMessage('');
          setPhase('transcriptReady');
        } else if (data.status === 'error') {
          // Job failed - allow manual paste
          clearInterval(interval);
          setActiveJobId(null);
          setPollingStartTime(null);
          setStatusMessage('');
          setError(data.error || "We couldn't auto-transcribe this video. Paste your script below.");
          setPhase('transcriptReady');
        } else {
          // Still processing - update message if available
          if (data.message) {
            setStatusMessage(data.message);
          }
        }
      } catch (err) {
        // Network error during polling - stop and allow manual paste
        clearInterval(interval);
        setActiveJobId(null);
        setPollingStartTime(null);
        setStatusMessage('');
        setError('Connection lost while transcribing. Please paste your script manually.');
        setPhase('transcriptReady');
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [activeJobId, pollingStartTime]);

  // Handle Get Transcript from URL
  const handleGetTranscript = async () => {
    // Validate URL
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    if (!youtubeRegex.test(videoUrl)) {
      setError('Invalid YouTube URL. Please check and try again.');
      return;
    }

    // Reset state
    setPhase('fetchingTranscript');
    setError('');
    setTitlesResult(null);
    setSourceInfo(null);
    setActiveJobId(null);
    setStatusMessage('');
    setTranscriptText('');

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });
      const data = await response.json();

      if (data.status === 'done') {
        // Fast path - captions or cache hit
        setTranscriptText(data.transcript);
        setSourceInfo({
          cached: data.cached || false,
          source: data.source || 'captions',
          videoId: data.videoId || null,
          durationSec: data.durationSec || null,
        });
        setPhase('transcriptReady');
      } else if (data.status === 'processing' && data.jobId) {
        // Async ASR job - start polling
        setActiveJobId(data.jobId);
        setPollingStartTime(Date.now());
        setStatusMessage(data.message || 'Transcribing audio… this can take ~2 minutes.');
        setPhase('waitingForASR');
      } else if (data.status === 'error') {
        // Immediate error - allow manual paste
        setPhase('transcriptReady');
        setTranscriptText('');
        setError(data.error || "We couldn't auto-transcribe this video. Paste your script below.");
      } else {
        // Unexpected response
        setPhase('error');
        setError('Unexpected response from transcript service. Please try again.');
      }
    } catch (err) {
      // Network or server error
      setPhase('error');
      setError(err.message || 'Failed to connect to server. Please try again.');
    }
  };

  // Handle Generate Titles
  const handleGenerateTitles = async () => {
    // Auth gate - show modal if not logged in
    if (!isAuthed) {
      setShowAuthModal(true);
      return;
    }

    const trimmed = transcriptText.trim();

    if (trimmed.length < 100) {
      setError('Transcript must be at least 100 characters long');
      return;
    }

    // Track generation request
    track('generate_request', {
      plan: user?.plan || 'guest',
      transcriptLength: trimmed.length,
      inputMode: inputMode
    });

    setPhase('generatingTitles');
    setError('');

    try {
      const data = await generateApi.generateTitles(trimmed);

      if (data.titles && data.titles.length > 0) {
        setTitlesResult({
          titles: data.titles,
          description: data.description || '',
          tags: data.tags || '',
          usedProvider: data.usedProvider || 'Service',
        });
        setPhase('titlesReady');
      } else {
        setPhase('error');
        setError(data.error || 'Failed to generate titles. Please try again.');
      }
    } catch (err) {
      // Check for 429 (daily limit exceeded)
      if (err.response?.status === 429) {
        track('upgrade_modal_shown', {
          currentPlan: user?.plan || 'guest',
          reason: 'daily_limit_exceeded'
        });
        setShowUpgradeModal(true);
        setPhase('transcriptReady');
      } else {
        setPhase('error');
        setError(err.response?.data?.error || err.message || 'Failed to generate titles. Please try again.');
      }
    }
  };

  // Handle "Generate New Titles" - reset to idle
  const handleReset = () => {
    setPhase('idle');
    setVideoUrl('');
    setTranscriptText('');
    setSourceInfo(null);
    setActiveJobId(null);
    setStatusMessage('');
    setError('');
    setTitlesResult(null);
    setInputMode('url');
  };

  // Infer badge labels from title text
  const inferBadges = (title) => {
    const badges = [];
    const lower = title.toLowerCase();

    // Contrast Hook - vs, but, while, although, yet
    if (/(vs\.|but|while|although|yet|however|despite|even though)/i.test(lower)) {
      badges.push({ label: 'Contrast', color: 'bg-orange-500' });
    }

    // Curiosity Gap - secret, reveal, unlock, discover, hidden, truth, never, what, why, how
    if (/(secret|reveal|unlock|discover|hidden|truth|never|nobody|what|why|how|this)/i.test(lower)) {
      badges.push({ label: 'Curiosity', color: 'bg-purple-500' });
    }

    // Pain Hook - struggle, fix, avoid, mistake, problem, fail
    if (/(avoid|mistake|fail|struggle|problem|fix|wrong|error|trap)/i.test(lower)) {
      badges.push({ label: 'Pain Hook', color: 'bg-red-500' });
    }

    // Status Flex - transform, level up, zero to hero, master, pro, expert
    if (/(transform|level.?up|zero.?to|master|pro|expert|advanced|elite|become)/i.test(lower)) {
      badges.push({ label: 'Status', color: 'bg-blue-500' });
    }

    // Fallback
    if (badges.length === 0) {
      badges.push({ label: 'Hook', color: 'bg-green-500' });
    }

    return badges;
  };

  // Render source pill
  const renderSourcePill = () => {
    if (!sourceInfo) return null;

    let text = '';
    let colorClass = 'bg-gray-600';

    if (sourceInfo.cached) {
      text = 'Loaded from cache ⚡ Instant';
      colorClass = 'bg-green-600';
    } else if (sourceInfo.source === 'captions') {
      text = 'Pulled YouTube captions';
      colorClass = 'bg-blue-600';
    } else if (sourceInfo.source === 'asr') {
      text = 'Transcribed with speech recognition';
      colorClass = 'bg-purple-600';
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${colorClass} mb-2`}
      >
        {text}
        {sourceInfo.durationSec && (
          <span className="ml-2 opacity-75">
            ({Math.floor(sourceInfo.durationSec / 60)}:{String(sourceInfo.durationSec % 60).padStart(2, '0')})
          </span>
        )}
      </motion.div>
    );
  };

  // Should "Generate Titles" button pulse?
  const shouldPulse =
    phase === 'transcriptReady' && transcriptText.trim().length >= 100;

  // Is "Generate Titles" button disabled?
  const generateButtonDisabled =
    transcriptText.trim().length < 100 ||
    phase === 'fetchingTranscript' ||
    phase === 'waitingForASR' ||
    phase === 'generatingTitles';

  // Character count helpers
  const charCount = transcriptText.length;
  const charsNeeded = Math.max(0, 100 - charCount);

  // Copy functions
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopyToastVisible(true);
          setTimeout(() => setCopyToastVisible(false), 2000);
        })
        .catch(() => {
          // Fallback: show message that copy failed
          alert('Copy not supported in this browser. Please copy manually.');
        });
    } else {
      // Old browser - show alert with text
      alert('Clipboard not supported. Please copy manually:\n\n' + text);
    }
  };

  const copyAll = () => {
    if (!titlesResult) return;
    const allText = [
      '🎬 TITLES:',
      ...titlesResult.titles.map((t, i) => `${i + 1}. ${t}`),
      '',
      '📝 DESCRIPTION:',
      titlesResult.description,
      '',
      '🏷️ TAGS:',
      titlesResult.tags,
      '',
      `Generated by TitleIQ by TightSlice`,
    ].join('\n');
    copyToClipboard(allText);
  };

  // Dopamine loading messages
  const getDopamineMessage = () => {
    const messages = [
      'Weaponizing curiosity gaps',
      'Extracting contrast hooks',
      'Optimizing for algorithmic dominance',
      'Injecting dopamine triggers',
      'Crafting irresistible hooks',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Check if user is trial (to show blurred tags)
  const isTrialUser = user?.plan === 'trial';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <QuotaPill />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <AnimatePresence mode="wait">
          {/* IDLE / INPUT STAGE */}
          {(phase === 'idle' ||
            phase === 'fetchingTranscript' ||
            phase === 'waitingForASR' ||
            phase === 'transcriptReady') && (
            <motion.div
              key="input-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  YouTube Title Generator
                </h1>
                <p className="text-lg text-purple-200">
                  Advanced title generator • TitleIQ by TightSlice
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg max-w-md mx-auto">
                <button
                  onClick={() => setInputMode('url')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    inputMode === 'url'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  YouTube URL
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                    inputMode === 'text'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Paste Transcript
                </button>
              </div>

              {/* URL Input Mode */}
              {inputMode === 'url' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4"
                >
                  <label className="block">
                    <span className="text-sm font-medium text-gray-300 mb-2 block">
                      YouTube Video URL
                    </span>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                      disabled={phase === 'fetchingTranscript' || phase === 'waitingForASR'}
                    />
                  </label>

                  <button
                    onClick={handleGetTranscript}
                    disabled={phase === 'fetchingTranscript' || phase === 'waitingForASR'}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {phase === 'fetchingTranscript' && `Checking for captions${loadingDots}`}
                    {phase === 'waitingForASR' && `Transcribing audio${loadingDots}`}
                    {phase !== 'fetchingTranscript' && phase !== 'waitingForASR' && 'Fetch Transcript'}
                  </button>

                  {/* Status message during async processing */}
                  {phase === 'waitingForASR' && statusMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-blue-200 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>{statusMessage}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Text Input Mode */}
              {inputMode === 'text' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4"
                >
                  <label className="block">
                    <span className="text-sm font-medium text-gray-300 mb-2 block">
                      Paste Your Transcript
                    </span>
                    <textarea
                      value={transcriptText}
                      onChange={(e) => {
                        setTranscriptText(e.target.value);
                        if (e.target.value.trim().length >= 100) {
                          setPhase('transcriptReady');
                        }
                      }}
                      placeholder="Paste your video transcript here..."
                      rows={10}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition resize-none"
                    />
                  </label>
                  <div className="text-sm text-gray-400">
                    {charCount} characters
                    {charsNeeded > 0 && (
                      <span className="text-yellow-400 ml-2">
                        (need {charsNeeded} more)
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Transcript Editing Area (after URL fetch) */}
              {inputMode === 'url' && (phase === 'transcriptReady' || transcriptText) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4"
                >
                  {renderSourcePill()}

                  <label className="block">
                    <span className="text-sm font-medium text-gray-300 mb-2 block">
                      Transcript (editable)
                    </span>
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      placeholder="Your transcript will appear here..."
                      rows={10}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition resize-none"
                    />
                  </label>

                  <div className="text-sm text-gray-400">
                    {charCount} characters
                    {charsNeeded > 0 && (
                      <span className="text-yellow-400 ml-2">
                        (need {charsNeeded} more)
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200"
                >
                  {error}
                </motion.div>
              )}

              {/* Generate Titles CTA */}
              {(phase === 'transcriptReady' || phase === 'generatingTitles') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={handleGenerateTitles}
                    disabled={generateButtonDisabled}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      shouldPulse ? 'animate-pulse' : ''
                    }`}
                  >
                    {phase === 'generatingTitles'
                      ? `${getDopamineMessage()}${loadingDots}`
                      : '✨ Generate 10 Titles'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TITLES READY STAGE */}
          {phase === 'titlesReady' && titlesResult && (
            <motion.div
              key="results-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header with Copy All */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Your Titles</h2>
                <button
                  onClick={copyAll}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy All
                </button>
              </div>

              {/* Titles List */}
              <div className="space-y-3">
                {titlesResult.titles.map((title, idx) => {
                  const badges = inferBadges(title);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-purple-500/50 transition group flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-purple-400 font-bold text-lg">
                            {idx + 1}.
                          </span>
                          <p className="text-white font-medium flex-1 leading-relaxed">
                            {title}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 ml-8">
                          {badges.map((badge, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-xs font-medium text-white ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          ))}
                          <span className="text-gray-400 text-xs">
                            {title.length} chars
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(title)}
                        className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
                      >
                        Copy
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Description */}
              {titlesResult.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white">SEO Description</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDescriptionGenerator(true)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-lg"
                      >
                        <span className="mr-1">✨</span>
                        4 Premium Layouts
                      </button>
                      <button
                        onClick={() => copyToClipboard(titlesResult.description)}
                        className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {titlesResult.description}
                  </p>
                </motion.div>
              )}

              {/* Tags */}
              {titlesResult.tags && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30 relative"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white">SEO Tags</h3>
                    {!isTrialUser && (
                      <button
                        onClick={() => copyToClipboard(titlesResult.tags)}
                        className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition"
                      >
                        Copy
                      </button>
                    )}
                  </div>

                  {/* Trial users see blurred tags with upgrade CTA */}
                  {isTrialUser ? (
                    <div className="relative">
                      <p className="text-gray-200 blur-sm select-none">
                        {titlesResult.tags}
                      </p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-6 text-center border border-purple-500/50">
                          <p className="text-white font-semibold mb-3">
                            🔒 Upgrade to see SEO tags
                          </p>
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                          >
                            Upgrade Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-200 leading-relaxed">
                      {titlesResult.tags}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Provider Footer */}
              <div className="text-center text-sm text-gray-400">
                Generated by TitleIQ by TightSlice
              </div>

              {/* Generate New Titles Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                >
                  Generate New Titles
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ERROR STAGE */}
          {phase === 'error' && (
            <motion.div
              key="error-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-900/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/50 text-center"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-3">Something Went Wrong</h2>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AuthGateModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user?.plan || 'trial'}
      />

      {/* Copy Toast */}
      <AnimatePresence>
        {copyToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Description Generator */}
      {showDescriptionGenerator && titlesResult && (
        <DescriptionGenerator
          videoTitle={titlesResult.titles[0] || 'Your Video'}
          generationId={null}
          onClose={() => setShowDescriptionGenerator(false)}
        />
      )}
    </div>
  );
}
