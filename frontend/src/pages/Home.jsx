import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NewsletterSignup from '../components/NewsletterSignup';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const features = [
    {
      icon: '🎯',
      title: 'Contrast Hooks',
      description: 'Smart titles with proven tension patterns that stop the scroll'
    },
    {
      icon: '⚡',
      title: 'Curiosity Weaponization',
      description: 'Every title engineered to trigger the curiosity gap and drive clicks'
    },
    {
      icon: '📊',
      title: 'SEO-Optimized',
      description: '500-800 character descriptions with keyword-rich tags that rank'
    },
    {
      icon: '🤖',
      title: 'Advanced Generation',
      description: 'Multiple optimization strategies available for your content style'
    },
    {
      icon: '💎',
      title: '10 Titles Per Request',
      description: 'Get a variety of options to A/B test and find your best performers'
    },
    {
      icon: '🚀',
      title: 'Instant Generation',
      description: 'From YouTube URL to titles in seconds with our optimized pipeline'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Tech YouTuber',
      content: 'TitleIQ doubled my CTR in the first month. The contrast hooks are unreal.',
      avatar: '👩‍💻'
    },
    {
      name: 'Marcus Johnson',
      role: 'Fitness Creator',
      content: "I went from 2% CTR to 8%. This tool pays for itself 10x over.",
      avatar: '💪'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Educational Content',
      content: 'The SEO tags alone are worth it. My discoverability has skyrocketed.',
      avatar: '📚'
    }
  ];

  const pricingTiers = [
    {
      name: 'Trial',
      price: 'Free',
      period: '3 days',
      features: [
        '10 generations per day',
        '5 titles per request',
        'Basic descriptions',
        'Automatic optimization'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Creator',
      price: '$15',
      period: 'per month',
      features: [
        '25 generations per day',
        '10 titles per request',
        'Full SEO descriptions + tags',
        'Premium generation options'
      ],
      cta: 'Go Creator',
      highlighted: true
    },
    {
      name: 'Creator Pro',
      price: '$29',
      period: 'per month',
      features: [
        '75 generations per day',
        '10 titles per request',
        'Advanced SEO pack',
        'All premium features unlocked'
      ],
      cta: 'Go Pro',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-purple-200 text-sm font-medium">
                Advanced Generation Engine • Powered by Industry Leaders
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              YouTube Titles That
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Stop the Scroll
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-3xl mx-auto">
              Smart title generation with contrast hooks, curiosity weaponization, and SEO optimization.
              <span className="block mt-2 text-purple-300">
                From transcript to titles in seconds.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => navigate(isAuthed ? '/app' : '/register')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg hover:shadow-purple-500/50 w-full sm:w-auto"
              >
                {isAuthed ? 'Go to App' : 'Start Free Trial'}
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition border border-white/20 w-full sm:w-auto"
              >
                View Pricing
              </button>
            </div>

            {/* Social Proof */}
            <p className="text-purple-300 text-sm">
              Join 1,000+ creators generating winning titles daily
            </p>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="bg-black/40 rounded-lg p-6 mb-4">
                <div className="text-purple-400 text-sm mb-2">Input:</div>
                <div className="text-white font-mono text-sm">
                  https://www.youtube.com/watch?v=dQw4w9WgXcQ
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-6">
                <div className="text-purple-400 text-sm mb-3">Generated Titles:</div>
                <div className="space-y-2">
                  {[
                    "This 1987 Music Video Predicted Social Media (and nobody noticed)",
                    "Why Every Marketing Expert Secretly Studies This Rick Astley Hit",
                    "The Psychology Behind Why This Song Won't Leave Your Head"
                  ].map((title, i) => (
                    <div key={i} className="text-white text-sm bg-white/5 rounded p-3 border-l-2 border-purple-500">
                      {i + 1}. {title}
                    </div>
                  ))}
                  <div className="text-purple-300 text-xs">+ 7 more titles</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for Performance
            </h2>
            <p className="text-purple-200 text-lg">
              Every feature designed to maximize your CTR and discoverability
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by Creators
            </h2>
            <p className="text-purple-200 text-lg">
              See what YouTubers are saying about TitleIQ
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-purple-300 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-purple-100 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-purple-200 text-lg">
              Start free, upgrade when you're ready to scale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-2xl p-8 border ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-xl scale-105'
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                }`}
              >
                {tier.highlighted && (
                  <div className="text-xs font-bold text-white bg-white/20 rounded-full px-3 py-1 inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-purple-200 ml-2">/{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-white">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(isAuthed ? '/pricing' : '/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    tier.highlighted
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get YouTube Growth Tips
            </h2>
            <p className="text-purple-200 mb-8">
              Join our newsletter for title strategies, CTR hacks, and algorithm insights
            </p>
            <NewsletterSignup />
          </motion.div>
        </div>
      </section>

      {/* TightSlice CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-12 text-center border border-green-500/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want 1:1 YouTube Growth Coaching?
            </h2>
            <p className="text-green-100 text-lg mb-8">
              TitleIQ is brought to you by TightSlice — experts in YouTube strategy and growth optimization
            </p>
            <a
              href="https://tightslice.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
            >
              Learn More at TightSlice.com
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">TitleIQ</h3>
              <p className="text-purple-300 text-sm">
                AI-powered YouTube title generation by TightSlice
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/pricing')} className="text-purple-300 hover:text-purple-100 text-sm transition">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate(isAuthed ? '/app' : '/register')} className="text-purple-300 hover:text-purple-100 text-sm transition">
                    {isAuthed ? 'Dashboard' : 'Start Free Trial'}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://tightslice.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 text-sm transition">
                    TightSlice Coaching
                  </a>
                </li>
                <li>
                  <a href="https://tightslice.com/blog" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 text-sm transition">
                    YouTube Growth Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://tightslice.com/about" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 text-sm transition">
                    About TightSlice
                  </a>
                </li>
                <li>
                  <a href="https://tightslice.com/contact" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 text-sm transition">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/terms')} className="text-purple-300 hover:text-purple-100 text-sm transition">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/privacy')} className="text-purple-300 hover:text-purple-100 text-sm transition">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/disclaimer')} className="text-purple-300 hover:text-purple-100 text-sm transition">
                    Disclaimer
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-purple-300 text-sm">
              © 2025 TitleIQ by TightSlice. All rights reserved.
            </p>
            <p className="text-purple-400 text-xs mt-2">
              YouTube title generator • SEO optimization • Advanced generation • Content strategy tools
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Not affiliated with or endorsed by YouTube, Google, or Alphabet Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
