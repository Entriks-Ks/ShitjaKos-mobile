import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const webStorage = {
  getItem(key: string) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async getItemAsync(key: string) {
    return webStorage.getItem(key);
  },
  async setItemAsync(key: string, value: string) {
    webStorage.setItem(key, value);
  },
  async deleteItemAsync(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const authStorage = Platform.OS === 'web' ? webStorage : SecureStore;
