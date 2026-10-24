import type { StoredSession } from './auth-types';

const key = 'semearas.session';
export async function readSession(): Promise<StoredSession | null> {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return typeof value.accessToken === 'string' && Number.isFinite(value.expiresAt) ? value : null;
  } catch { return null; }
}
export async function storeSession(value: StoredSession | null) {
  if (value) window.sessionStorage.setItem(key, JSON.stringify(value));
  else window.sessionStorage.removeItem(key);
}
