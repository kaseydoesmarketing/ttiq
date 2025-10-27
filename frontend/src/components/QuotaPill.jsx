import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const QuotaPill = () => {
  const { user, isAuthed } = useAuth();
  const [usage, setUsage] = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (isAuthed && user) {
      fetchUsage();
      // Refresh usage every 30 seconds
      const interval = setInterval(fetchUsage, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthed, user]);

  const fetchUsage = async () => {
    try {
      const response = await userApi.getUsage();
      setUsage(response.usage);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  if (!isAuthed || !user || !usage) {
    return null;
  }

  const getUsageColor = () => {
    if (usage.billing_status === 'lifetime') return 'from-orange-500 to-red-500';

    const percentUsed = (usage.used / usage.limit) * 100;
    if (percentUsed >= 90) return 'from-red-500 to-pink-500';
    if (percentUsed >= 70) return 'from-orange-500 to-yellow-500';
    return 'from-purple-500 to-pink-500';
  };

  const getPlanDisplay = () => {
    if (usage.billing_status === 'lifetime') {
      return `${usage.plan === 'creator_pro' ? 'Pro' : 'Creator'} ∞`;
    }

    const planNames = {
      trial: 'Trial',
      creator: 'Creator',
      creator_pro: 'Pro'
    };

    return `${planNames[usage.plan] || 'Trial'}: ${usage.used} / ${usage.limit}`;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className={`relative bg-gradient-to-r ${getUsageColor()} rounded-full px-4 py-2 shadow-lg backdrop-blur-sm`}>
            <button
              onClick={() => setShow(false)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xs transition"
            >
              ×
            </button>
            <div className="flex items-center gap-2">
              <div className="text-white font-semibold text-sm">
                {getPlanDisplay()}
              </div>
              {usage.used >= usage.limit && usage.billing_status !== 'lifetime' && (
                <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Limit reached
                </div>
              )}
            </div>
            {usage.plan === 'trial' && (
              <div className="text-xs text-white/80 mt-1">
                left today
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuotaPill;
