import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import OnboardingWizard from './OnboardingWizard';

const OnboardingGate = ({ children }) => {
  const { user, onboardingState, completeOnboarding } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Show loading only while checking initial state
  if (onboardingState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't show onboarding if:
  // - Not logged in
  // - On admin route
  // - Already completed
  // - User skipped
  // - User is admin role
  if (!user || isAdminRoute || onboardingState.completed || onboardingState.skipped || user.role === 'admin') {
    return <>{children}</>;
  }

  // First-run: Block with onboarding wizard
  return <OnboardingWizard onComplete={completeOnboarding} />;
};

export default OnboardingGate;
