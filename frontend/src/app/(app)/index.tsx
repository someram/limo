import { Redirect } from 'expo-router';

/**
 * Gives the authenticated route group a concrete default screen.
 *
 * Expo Router uses this route as the protected-stack anchor after a saved
 * session is restored, instead of falling through to its unmatched-route
 * screen.
 */
export default function AuthenticatedIndexRoute() {
  return <Redirect href="/(app)/home" />;
}
