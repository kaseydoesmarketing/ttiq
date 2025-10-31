import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OnboardingWizard = ({ onComplete, relaunch = false, onSkip }) => {
  const { skipOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    content_type: '',
    niche: '',
    channel_size: '',
    primary_goal: '',
    upload_schedule: '',
    social_links: {
      youtube: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      linkedin: '',
      facebook: ''
    },
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
  const [hashtagInput, setHashtagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = 12;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addToArray = (field, value, setInput) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setInput('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      // Save progress to backend
      try {
        const token = localStorage.getItem('titleiq_token');
        await axios.post(
          `${API_URL}/api/onboarding/update`,
          { step: step + 1, data: formData },
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
      await axios.post(
        `${API_URL}/api/onboarding/complete`,
        { data: formData },
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
          <StepContainer title="What type of content do you create?">
            <OptionGrid>
              {['Educational', 'Entertainment', 'Gaming', 'Vlogging', 'Review/Unboxing', 'Tutorial/How-to', 'Commentary', 'Other'].map(type => (
                <OptionButton
                  key={type}
                  active={formData.content_type === type}
                  onClick={() => updateField('content_type', type)}
                >
                  {type}
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer title="What's your specific niche or industry?">
            <Input
              placeholder="e.g., Tech reviews, fitness coaching, cooking tutorials"
              value={formData.niche}
              onChange={(e) => updateField('niche', e.target.value)}
            />
            <HintText>Be as specific as possible - this helps us personalize your titles</HintText>
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer title="What's your current channel size?">
            <OptionGrid>
              {['0-1K', '1K-10K', '10K-100K', '100K-1M', '1M+'].map(size => (
                <OptionButton
                  key={size}
                  active={formData.channel_size === size}
                  onClick={() => updateField('channel_size', size)}
                >
                  {size} subscribers
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer title="What's your primary goal?">
            <OptionGrid>
              {['Growth', 'Monetization', 'Engagement', 'Brand building', 'Education', 'Community'].map(goal => (
                <OptionButton
                  key={goal}
                  active={formData.primary_goal === goal}
                  onClick={() => updateField('primary_goal', goal)}
                >
                  {goal}
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer title="How often do you upload?">
            <OptionGrid>
              {['Daily', '2-3x/week', 'Weekly', 'Bi-weekly', 'Monthly', 'Irregular'].map(schedule => (
                <OptionButton
                  key={schedule}
                  active={formData.upload_schedule === schedule}
                  onClick={() => updateField('upload_schedule', schedule)}
                >
                  {schedule}
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer title="Connect your social media" subtitle="We'll auto-add these links to your YouTube descriptions">
            <div className="space-y-3">
              <SocialInput
                icon="📺"
                platform="YouTube"
                value={formData.social_links.youtube}
                onChange={(e) => updateNestedField('social_links', 'youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
              <SocialInput
                icon="📸"
                platform="Instagram"
                value={formData.social_links.instagram}
                onChange={(e) => updateNestedField('social_links', 'instagram', e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
              <SocialInput
                icon="🎵"
                platform="TikTok"
                value={formData.social_links.tiktok}
                onChange={(e) => updateNestedField('social_links', 'tiktok', e.target.value)}
                placeholder="https://tiktok.com/@yourusername"
              />
              <SocialInput
                icon="🐦"
                platform="Twitter/X"
                value={formData.social_links.twitter}
                onChange={(e) => updateNestedField('social_links', 'twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
              <SocialInput
                icon="💼"
                platform="LinkedIn"
                value={formData.social_links.linkedin}
                onChange={(e) => updateNestedField('social_links', 'linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <SocialInput
                icon="👥"
                platform="Facebook"
                value={formData.social_links.facebook}
                onChange={(e) => updateNestedField('social_links', 'facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
          </StepContainer>
        );

      case 7:
        return (
          <StepContainer title="Your favorite hashtags" subtitle="Add 5-10 hashtags you commonly use">
            <TagInput
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('hashtags', hashtagInput, setHashtagInput);
                }
              }}
              placeholder="Type hashtag and press Enter"
            />
            <TagList>
              {formData.hashtags.map((tag, i) => (
                <Tag key={i} onRemove={() => removeFromArray('hashtags', i)}>
                  {tag.startsWith('#') ? tag : '#' + tag}
                </Tag>
              ))}
            </TagList>
          </StepContainer>
        );

      case 8:
        return (
          <StepContainer title="Your target keywords" subtitle="Add 5-10 keywords for your niche">
            <TagInput
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('keywords', keywordInput, setKeywordInput);
                }
              }}
              placeholder="Type keyword and press Enter"
            />
            <TagList>
              {formData.keywords.map((keyword, i) => (
                <Tag key={i} onRemove={() => removeFromArray('keywords', i)}>
                  {keyword}
                </Tag>
              ))}
            </TagList>
          </StepContainer>
        );

      case 9:
        return (
          <StepContainer title="Tell us about your audience">
            <div className="space-y-4">
              <div>
                <Label>Primary age range</Label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.demographics.ageRange}
                  onChange={(e) => updateNestedField('demographics', 'ageRange', e.target.value)}
                >
                  <option value="">Select age range</option>
                  <option value="13-17">13-17</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </div>
              <div>
                <Label>Primary location</Label>
                <Input
                  placeholder="e.g., United States, Global, Europe"
                  value={formData.demographics.location}
                  onChange={(e) => updateNestedField('demographics', 'location', e.target.value)}
                />
              </div>
              <div>
                <Label>Key interests</Label>
                <Input
                  placeholder="e.g., Technology, gaming, fitness"
                  value={formData.demographics.interests}
                  onChange={(e) => updateNestedField('demographics', 'interests', e.target.value)}
                />
              </div>
            </div>
          </StepContainer>
        );

      case 10:
        return (
          <StepContainer title="What's your brand voice?">
            <OptionGrid>
              {['Professional', 'Casual', 'Energetic', 'Educational', 'Funny', 'Inspirational'].map(voice => (
                <OptionButton
                  key={voice}
                  active={formData.brand_voice === voice}
                  onClick={() => updateField('brand_voice', voice)}
                >
                  {voice}
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      case 11:
        return (
          <StepContainer title="Competitors you admire" subtitle="Add 3-5 YouTube channels you look up to">
            <TagInput
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('competitors', competitorInput, setCompetitorInput);
                }
              }}
              placeholder="Type channel name and press Enter"
            />
            <TagList>
              {formData.competitors.map((comp, i) => (
                <Tag key={i} onRemove={() => removeFromArray('competitors', i)}>
                  {comp}
                </Tag>
              ))}
            </TagList>
          </StepContainer>
        );

      case 12:
        return (
          <StepContainer title="What's your biggest challenge?">
            <OptionGrid>
              {['Low CTR', 'Not ranking', 'Standing out', 'Consistency', 'Ideas', 'Audience growth'].map(challenge => (
                <OptionButton
                  key={challenge}
                  active={formData.biggest_challenge === challenge}
                  onClick={() => updateField('biggest_challenge', challenge)}
                >
                  {challenge}
                </OptionButton>
              ))}
            </OptionGrid>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Gray overlay - dims everything behind */}
      <div className="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-sm" />

      {/* Onboarding content container */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center px-4 py-8 overflow-y-auto">
        {/* Large X Button - Top Right Corner */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleSkip}
          className="fixed top-6 right-6 z-[62] w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-light border border-gray-600 transition-all hover:scale-110 shadow-xl"
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
    </>
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

const TagInput = ({ ...props }) => (
  <Input {...props} />
);

const TagList = ({ children }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {children}
  </div>
);

const Tag = ({ children, onRemove }) => (
  <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2 border border-purple-200">
    {children}
    <button
      onClick={onRemove}
      className="hover:text-purple-900 transition"
    >
      ×
    </button>
  </div>
);

const HintText = ({ children }) => (
  <p className="text-gray-500 text-sm mt-2">{children}</p>
);

const Label = ({ children }) => (
  <label className="text-gray-700 text-sm mb-2 block">{children}</label>
);

export default OnboardingWizard;
