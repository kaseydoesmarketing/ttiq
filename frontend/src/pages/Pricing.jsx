import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingApi } from '../utils/api';
import { motion } from 'framer-motion';

const Pricing = () => {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = async (plan) => {
    if (!isAuthed) {
      navigate('/register');
      return;
    }

    try {
      const response = await billingApi.createCheckoutSession(plan);
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        alert(response.message || 'Billing setup pending');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const plans = [
    {
      name: 'Trial',
      price: 'Free',
      period: '3 days',
      description: '~50% of Creator',
      features: [
        'Up to 5 title options per request',
        '10 generations per day',
        'Basic descriptions',
        'Auto-activates Creator after trial',
      ],
      cta: 'Start Free Trial',
      plan: 'trial',
      highlighted: false,
    },
    {
      name: 'Creator',
      price: '$15',
      period: 'per month',
      description: 'For serious creators',
      features: [
        'Up to 10 hyper-clickable titles',
        '25 generations per day',
        'SEO-primed descriptions (500-800 chars)',
        'Keyword-rich ranking tags',
        'Multi-model AI engine access',
      ],
      cta: 'Start Creator',
      plan: 'creator',
      highlighted: false,
    },
    {
      name: 'Creator Pro',
      price: '$29',
      period: 'per month',
      description: 'Most Popular',
      features: [
        'Up to 10 hyper-clickable titles',
        '75 generations per day',
        'Advanced SEO Pack (2026 patterns)',
        'Future: Chapter timestamps',
        'Multi-model selection (OpenAI, Groq, Grok, Gemini)',
        'Priority generation speed',
      ],
      cta: 'Go Pro',
      plan: 'creator_pro',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Unfair Advantage
          </h1>
          <p className="text-xl text-gray-300">
            Stop guessing. Start dominating YouTube CTR.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={'relative rounded-2xl p-8 border ' + (plan.highlighted ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 shadow-2xl shadow-purple-500/30' : 'bg-gray-800/50 border-gray-700/50')}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.plan)}
                className={'w-full py-3 rounded-lg font-semibold transition-all ' + (plan.highlighted ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30' : 'bg-gray-700 text-white hover:bg-gray-600')}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-700/30 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Need full-stack channel growth?
          </h3>
          <p className="text-gray-300 mb-6">
            Funnels, retention strategy, editing pipeline, and thumbnail systems.
            <br />
            TightSlice runs creator brands like products.
          </p>
          <a
            href="https://tightslice.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
          >
            Get 1:1 Growth Coaching →
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
