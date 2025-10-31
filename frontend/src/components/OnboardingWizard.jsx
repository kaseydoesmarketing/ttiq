import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OnboardingWizard = ({ onComplete, relaunch = false, onSkip }) => {
  const { skipOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Channel/Show Basics
    brand_name: '',
    content_type: '',

    // Step 2: Where You Publish
    website_url: '',
    social_links: {
      youtube: '',
      podcast_apple: '',
      podcast_spotify: ''
    },

    // Step 3: Social Media
    social_links_ext: {
      instagram: '',
      twitter: '',
      tiktok: '',
      facebook: ''
    },

    // Step 4: Offers & CTAs
    primary_offer_label: '',
    primary_offer_url: '',
    secondary_offer_label: '',
    secondary_offer_url: '',
    contact_email: '',

    // Step 5: Affiliate & Resources
    affiliates: [
      { label: '', url: '' },
      { label: '', url: '' },
      { label: '', url: '' }
    ],
    sponsor_mention: '',

    // Legacy fields (keep for backwards compatibility but not shown in UI)
    niche: '',
    channel_size: '',
    primary_goal: '',
    upload_schedule: '',
    hashtags: [],
    keywords: [],
    demographics: {
      ageRange: '',
      location: '',
      interests: ''
    },
    brand_voice: '',
    competitors: [],
    biggest_challenge: ''
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 6;

  // Lock body scroll when onboarding is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const updateAffiliateField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      affiliates: prev.affiliates.map((aff, i) =>
        i === index ? { ...aff, [field]: value } : aff
      )
    }));
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      // Save progress to backend
      try {
        const token = localStorage.getItem('titleiq_token');

        // Merge social_links and social_links_ext for backend
        const dataToSave = {
          ...formData,
          social_links: {
            ...formData.social_links,
            ...formData.social_links_ext
          }
        };

        await axios.post(
          `${API_URL}/api/onboarding/update`,
          { step: step + 1, data: dataToSave },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      skipOnboarding();

      if (onSkip) {
        onSkip();
      } else if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('titleiq_token');

      // Merge social_links and social_links_ext for backend
      const dataToSave = {
        ...formData,
        social_links: {
          ...formData.social_links,
          ...formData.social_links_ext
        }
      };

      await axios.post(
        `${API_URL}/api/onboarding/complete`,
        { data: dataToSave },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContainer
            title="Channel/Show Basics"
            subtitle="Tell us about your content"
          >
            <div className="space-y-4">
              <div>
                <Label>Channel Name / Podcast Name</Label>
                <Input
                  placeholder="e.g., The Daily Show, MKBHD, My Fitness Channel"
                  value={formData.brand_name}
                  onChange={(e) => updateField('brand_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Content Type</Label>
                <OptionGrid>
                  {['Educational', 'Podcast', 'News', 'Tech Review', 'Business', 'Lifestyle'].map(type => (
                    <OptionButton
                      key={type}
                      active={formData.content_type === type}
                      onClick={() => updateField('content_type', type)}
                    >
                      {type}
                    </OptionButton>
                  ))}
                </OptionGrid>
              </div>
            </div>
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer
            title="Where You Publish"
            subtitle="Add your main content platforms"
          >
            <div className="space-y-3">
              <SocialInput
                icon="📺"
                platform="YouTube Channel"
                value={formData.social_links.youtube}
                onChange={(e) => updateNestedField('social_links', 'youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
              <SocialInput
                icon="🎙️"
                platform="Apple Podcasts (optional)"
                value={formData.social_links.podcast_apple}
                onChange={(e) => updateNestedField('social_links', 'podcast_apple', e.target.value)}
                placeholder="https://podcasts.apple.com/..."
              />
              <SocialInput
                icon="🎧"
                platform="Spotify Podcast (optional)"
                value={formData.social_links.podcast_spotify}
                onChange={(e) => updateNestedField('social_links', 'podcast_spotify', e.target.value)}
                placeholder="https://open.spotify.com/show/..."
              />
              <SocialInput
                icon="🌐"
                platform="Website (optional)"
                value={formData.website_url}
                onChange={(e) => updateField('website_url', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer
            title="Social Media"
            subtitle="Connect your social profiles (optional but recommended)"
          >
            <div className="space-y-3">
              <SocialInput
                icon="📸"
                platform="Instagram"
                value={formData.social_links_ext.instagram}
                onChange={(e) => updateNestedField('social_links_ext', 'instagram', e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
              <SocialInput
                icon="🐦"
                platform="Twitter/X"
                value={formData.social_links_ext.twitter}
                onChange={(e) => updateNestedField('social_links_ext', 'twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
              <SocialInput
                icon="🎵"
                platform="TikTok"
                value={formData.social_links_ext.tiktok}
                onChange={(e) => updateNestedField('social_links_ext', 'tiktok', e.target.value)}
                placeholder="https://tiktok.com/@yourusername"
              />
              <SocialInput
                icon="👥"
                platform="Facebook"
                value={formData.social_links_ext.facebook}
                onChange={(e) => updateNestedField('social_links_ext', 'facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer
            title="Offers & CTAs"
            subtitle="What do you want viewers to do?"
          >
            <div className="space-y-4">
              <div>
                <Label>Primary Offer (e.g., "Work with me")</Label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Label (e.g., Work with me, Book a call)"
                    value={formData.primary_offer_label}
                    onChange={(e) => updateField('primary_offer_label', e.target.value)}
                  />
                  <Input
                    className="flex-1"
                    placeholder="URL"
                    value={formData.primary_offer_url}
                    onChange={(e) => updateField('primary_offer_url', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Offer (optional - e.g., "Free training")</Label>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Label (e.g., Free course, Join newsletter)"
                    value={formData.secondary_offer_label}
                    onChange={(e) => updateField('secondary_offer_label', e.target.value)}
                  />
                  <Input
                    className="flex-1"
                    placeholder="URL"
                    value={formData.secondary_offer_url}
                    onChange={(e) => updateField('secondary_offer_url', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Contact Email (optional)</Label>
                <Input
                  placeholder="your@email.com"
                  value={formData.contact_email}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                />
              </div>
            </div>
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer
            title="Affiliate & Resources"
            subtitle="Add up to 3 affiliate or product links (optional)"
          >
            <div className="space-y-4">
              {formData.affiliates.map((aff, index) => (
                <div key={index}>
                  <Label>Link {index + 1}</Label>
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Label (e.g., Camera I use, My course)"
                      value={aff.label}
                      onChange={(e) => updateAffiliateField(index, 'label', e.target.value)}
                    />
                    <Input
                      className="flex-1"
                      placeholder="URL"
                      value={aff.url}
                      onChange={(e) => updateAffiliateField(index, 'url', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <div>
                <Label>Sponsor Mention (optional)</Label>
                <Input
                  placeholder="e.g., Brought to you by [Sponsor Name]"
                  value={formData.sponsor_mention}
                  onChange={(e) => updateField('sponsor_mention', e.target.value)}
                />
                <HintText>This will appear in podcast-style descriptions</HintText>
              </div>
            </div>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer title="You're all set!">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  You're ready to create amazing titles!
                </h3>
                <p className="text-gray-600 mb-6">
                  We've personalized TitleIQ based on your profile. Your descriptions will now auto-include your links and CTAs.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <a
                  href="https://www.youtube.com/watch?v=YOUR_TUTORIAL_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-500/20 text-purple-700 rounded-lg font-semibold hover:bg-purple-500/30 transition border border-purple-200"
                >
                  Watch Tutorial
                </a>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Go to Dashboard'}
                </button>
              </div>
            </div>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return createPortal(
    <>
      {/* Gray overlay - dims everything behind */}
      <div className="fixed inset-0 z-[9998] bg-gray-900/95 backdrop-blur-sm" />

      {/* Onboarding content container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 overflow-y-auto">
        {/* Large X Button - Top Right Corner */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSkip}
          className="fixed top-6 right-6 z-[10000] w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-light border border-gray-600 transition-all hover:scale-110 shadow-xl"
          aria-label="Close onboarding"
        >
          ×
        </motion.button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl my-auto"
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 text-sm font-medium">
                Step {step} of {totalSteps}
              </span>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-200 text-sm transition"
              >
                Skip for now
              </button>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content card - WHITE/LIGHT with DARK TEXT */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-h-[calc(100vh-16rem)] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition font-medium"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 shadow-md"
              >
                {loading ? 'Saving...' : step === totalSteps ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
};

// UI Components
const StepContainer = ({ title, subtitle, children }) => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
    {subtitle && <p className="text-gray-600 text-sm mb-6">{subtitle}</p>}
    <div className="mt-6">{children}</div>
  </div>
);

const OptionGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-3">{children}</div>
);

const OptionButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 rounded-lg font-medium transition ${
      active
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
    }`}
  >
    {children}
  </button>
);

const Input = ({ ...props }) => (
  <input
    type="text"
    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    {...props}
  />
);

const SocialInput = ({ icon, platform, ...props }) => (
  <div className="flex items-center gap-3">
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <label className="text-gray-700 text-sm mb-1 block">{platform}</label>
      <Input {...props} />
    </div>
  </div>
);

const HintText = ({ children }) => (
  <p className="text-gray-500 text-sm mt-2">{children}</p>
);

const Label = ({ children }) => (
  <label className="text-gray-700 text-sm mb-2 block font-medium">{children}</label>
);

export default OnboardingWizard;
