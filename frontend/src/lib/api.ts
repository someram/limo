import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = 3000;
const PROXY_PREFIX = '/api';

function normalize(url: string) {
  return url.trim().replace(/\/+$/, '');
}

function isLoopback(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isPrivateHost(hostname: string) {
  if (isLoopback(hostname) || hostname.endsWith('.local')) return true;

  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

  const [a, b] = parts as [number, number, number, number];
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function parseHostUri(hostUri: string) {
  const withoutScheme = hostUri.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const hostPort = withoutScheme.split('/')[0] ?? '';
  const colon = hostPort.lastIndexOf(':');

  if (colon === -1) return { hostname: hostPort || 'localhost', port: '' };

  return {
    hostname: hostPort.slice(0, colon) || 'localhost',
    port: hostPort.slice(colon + 1),
  };
}

function devProxyUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${PROXY_PREFIX}`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return directApiUrl();

  const { hostname, port } = parseHostUri(hostUri);
  return `https://${port ? `${hostname}:${port}` : hostname}${PROXY_PREFIX}`;
}

function directApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const hostname = hostUri ? parseHostUri(hostUri).hostname : 'localhost';
  const host = Platform.OS === 'android' && isLoopback(hostname) ? '10.0.2.2' : hostname;
  return `http://${host}:${DEFAULT_API_PORT}`;
}

function shouldUseDevProxy() {
  if (!__DEV__) return false;
  if (Platform.OS === 'web') return true;

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return false;

  return !isPrivateHost(parseHostUri(hostUri).hostname);
}

function remapLoopback(url: string) {
  if (!__DEV__ || Platform.OS === 'web') return url;

  try {
    const parsed = new URL(url);
    if (!isLoopback(parsed.hostname)) return url;

    const hostUri = Constants.expoConfig?.hostUri;
    const hostname = hostUri ? parseHostUri(hostUri).hostname : 'localhost';
    parsed.hostname =
      Platform.OS === 'android' && isLoopback(hostname) ? '10.0.2.2' : hostname;
    return normalize(parsed.toString());
  } catch {
    return url;
  }
}

function isLoopbackUrl(url: string) {
  try {
    return isLoopback(new URL(url).hostname);
  } catch {
    return false;
  }
}

const configuredUrl = normalize(process.env.EXPO_PUBLIC_API_URL ?? '');

export const API_URL = (() => {
  if (configuredUrl && !isLoopbackUrl(configuredUrl)) return configuredUrl;
  if (shouldUseDevProxy()) return devProxyUrl();
  if (configuredUrl) return remapLoopback(configuredUrl);
  return directApiUrl();
})();
