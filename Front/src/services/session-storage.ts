import * as SecureStore from 'expo-secure-store';
import type { StoredSession } from './auth-types';

const key = 'semearas.session';
export async function readSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return typeof value.accessToken === 'string' && Number.isFinite(value.expiresAt) ? value : null;
  } catch { return null; }
}
export async function storeSession(value: StoredSession | null) {
  if (value) await SecureStore.setItemAsync(key, JSON.stringify(value));
  else await SecureStore.deleteItemAsync(key);
}
