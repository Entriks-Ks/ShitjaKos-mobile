import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_BACKEND = 'http://localhost:3001';
const DEFAULT_PORT = 3001;
const DEFAULT_EXPO_WEB = 'http://localhost:8081';

function lanHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri;
  if (!hostUri) return null;

  return (
    hostUri
      .replace(/^[a-z]+:\/\//i, '')
      .split('/')[0]
      ?.split(':')[0] ?? null
  );
}

function expoWebOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const host = Constants.expoConfig?.hostUri?.split(',')[0];
  if (host) return `http://${host}`;

  return DEFAULT_EXPO_WEB;
}

export const authOrigin =
  process.env.EXPO_PUBLIC_AUTH_ORIGIN?.replace(/\/$/, '') ?? DEFAULT_BACKEND;

export function getBackendBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? DEFAULT_BACKEND;
}

export function getApiBaseUrl() {
  if (Platform.OS === 'web') {
    return expoWebOrigin();
  }

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const host = lanHost();
  const isLoopback = !host || host === 'localhost' || host === '127.0.0.1';

  if (Platform.OS === 'android' && isLoopback) {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  if (!isLoopback) {
    return `http://${host}:${DEFAULT_PORT}`;
  }

  return DEFAULT_BACKEND;
}

export const apiBaseUrl = getApiBaseUrl();
export const backendBaseUrl = getBackendBaseUrl();
