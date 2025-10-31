import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../utils/api';
import { useState } from 'react';

const UpgradeModal = ({ isOpen, onClose, currentPlan = 'trial' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      const response = await billingApi.createCheckoutSession(plan);

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        // Stripe not configured, navigate to pricing
        navigate('/pricing');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlans = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-lg w-full border border-purple-500/30 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white text-center mb-3">
                {currentPlan === 'trial' ? 'Daily Limit Reached' : 'Unlock Performance Mode'}
              </h2>
              <p className="text-purple-200 text-center mb-6">
                {currentPlan === 'trial'
                  ? "You've reached your daily limit. Upgrade to Creator to keep generating winning titles."
                  : 'Upgrade your plan to generate more titles and access premium features.'}
              </p>

              {/* Features */}
              <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/10">
                <h3 className="text-white font-bold mb-4">Unlock with Creator Plan:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-purple-100">
                      <span className="font-semibold">25 generations per day</span>
                      <div className="text-sm text-purple-300">2.5X more than Trial</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-purple-100">
                      <span className="font-semibold">10 titles per generation</span>
                      <div className="text-sm text-purple-300">More options to choose from</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-purple-100">
                      <span className="font-semibold">Full SEO descriptions</span>
                      <div className="text-sm text-purple-300">500-800 character optimized descriptions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-purple-100">
                      <span className="font-semibold">Keyword-rich SEO tags</span>
                      <div className="text-sm text-purple-300">Tags that actually rank</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-purple-100">
                      <span className="font-semibold">Advanced generation settings</span>
                      <div className="text-sm text-purple-300">Premium optimization options</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-1">
                  $15<span className="text-xl text-purple-200">/month</span>
                </div>
                <div className="text-purple-300 text-sm">
                  Cancel anytime • No commitment
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleUpgrade('creator')}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Upgrade to Creator'}
                </button>

                <button
                  onClick={handleViewPlans}
                  className="w-full px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition border border-white/20"
                >
                  See All Plans
                </button>
              </div>

              {/* Creator Pro Teaser */}
              {currentPlan !== 'creator_pro' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">Creator Pro</div>
                      <div className="text-purple-300 text-xs">75 generations/day + all premium features</div>
                    </div>
                    <div className="text-white font-bold">$29/mo</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
