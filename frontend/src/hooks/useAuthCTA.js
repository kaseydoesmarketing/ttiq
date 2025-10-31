import { useAuth } from '../context/AuthContext';

export function useAuthCTA() {
  const { user, loading } = useAuth();

  if (loading) {
    return {
      text: 'Loading...',
      href: '#',
      disabled: true
    };
  }

  if (user) {
    return {
      text: 'Go to App',
      href: '/dashboard',
      disabled: false
    };
  }

  return {
    text: 'Start Free Trial',
    href: '/register',
    disabled: false
  };
}
