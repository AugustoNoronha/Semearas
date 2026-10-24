import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { ApiError, apiRequest } from '../services/api';
import type { RequestOptions } from '../services/api';
import type { AuthResponse, Session, UserProfile } from '../services/auth-types';
import { readSession, storeSession } from '../services/session-storage';
import type { AuthValues } from '../utils/validation';

type AuthState = {
  session: Session | null;
  loading: boolean;
  restoreError: string | null;
  message: string | null;
  authenticate: (values: AuthValues, register: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => void;
  discard: () => Promise<void>;
  request: <T>(path: string, options?: Omit<RequestOptions, 'token'>) => Promise<T>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const current = useRef<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const update = useCallback((value: Session | null) => {
    current.current = value;
    setSession(value);
  }, []);

  const clear = useCallback(async (reason: string | null = null) => {
    update(null);
    setMessage(reason);
    // In-memory logout still succeeds if device/browser storage is unavailable.
    await storeSession(null).catch(() => {});
  }, [update]);

  useEffect(() => {
    let active = true;
    async function restore() {
      setLoading(true); setRestoreError(null);
      try {
        const saved = await readSession();
        if (!active || !saved) return;
        if (saved.expiresAt <= Date.now()) {
          await clear('Sua sessão expirou. Entre novamente.');
          return;
        }
        const user = await apiRequest<UserProfile>('/api/auth/me', { token: saved.accessToken });
        if (active) update({ ...saved, user });
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) await clear('Sua sessão terminou. Entre novamente.');
        else setRestoreError('Não foi possível verificar sua sessão. Confira a conexão e tente novamente.');
      } finally { if (active) setLoading(false); }
    }
    void restore();
    return () => { active = false; };
  }, [attempt, clear, update]);

  const refresh = useCallback(async () => {
    const saved = current.current;
    if (!saved) return;
    if (saved.expiresAt <= Date.now()) { await clear('Sua sessão expirou. Entre novamente.'); return; }
    try {
      const user = await apiRequest<UserProfile>('/api/auth/me', { token: saved.accessToken });
      if (current.current?.accessToken === saved.accessToken) update({ ...saved, user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && current.current?.accessToken === saved.accessToken) {
        await clear('Sua sessão terminou. Entre novamente.');
      } else throw error;
    }
  }, [clear, update]);

  const request = useCallback(async <T,>(path: string, options: Omit<RequestOptions, 'token'> = {}): Promise<T> => {
    const saved = current.current;
    if (!saved || saved.expiresAt <= Date.now()) {
      await clear('Sua sessão expirou. Entre novamente.');
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }
    try { return await apiRequest<T>(path, { ...options, token: saved.accessToken }); }
    catch (error) {
      if (error instanceof ApiError && error.status === 401 && current.current?.accessToken === saved.accessToken) {
        await clear('Sua sessão terminou. Entre novamente.');
      }
      throw error;
    }
  }, [clear]);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => { void clear('Sua sessão expirou. Entre novamente.'); }, Math.max(0, session.expiresAt - Date.now()));
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh().catch(() => {});
    });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [session, clear, refresh]);

  async function authenticate(values: AuthValues, register: boolean) {
    const body = register
      ? { name: values.name.trim(), email: values.email.trim(), cpf: values.cpf.replace(/\D/g, ''), password: values.password }
      : { email: values.email.trim(), password: values.password };
    const response = await apiRequest<AuthResponse>(register ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body });
    const saved = { accessToken: response.accessToken, expiresAt: Date.now() + response.expiresIn * 1000 };
    // A device that blocks storage can still use the current in-memory session.
    await storeSession(saved).catch(() => {});
    setMessage(null);
    update({ ...saved, user: response.user });
  }

  async function logout() {
    const saved = current.current;
    if (saved) {
      try { await apiRequest<void>('/api/auth/logout', { method: 'POST', token: saved.accessToken }); }
      catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
    }
    await clear();
  }

  async function discard() { await clear(); setRestoreError(null); setLoading(false); }

  return <AuthContext.Provider value={{ session, loading, restoreError, message, authenticate, logout, refresh,
    retry: () => setAttempt(value => value + 1), discard, request }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider ausente.');
  return context;
}
