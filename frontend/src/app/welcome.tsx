import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';
import { OnboardingScreen } from '@/screens/onboarding';

export default function WelcomeRoute() {
  const { user } = useAuth();

  if (user) return <Redirect href="/(app)/home" />;

  return <OnboardingScreen />;
}
