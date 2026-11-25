import { useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/screens/auth';

export default function AuthRoute() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = params.mode === 'signup' ? 'signup' : 'signin';

  return <AuthScreen initialMode={initialMode} />;
}
