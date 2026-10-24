import { Platform } from 'react-native';

function defaultApiUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
}

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || defaultApiUrl()).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; token?: string };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      credentials: 'omit',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      const fallback = response.status === 401 ? 'E-mail ou senha inválidos.'
        : response.status === 409 ? 'E-mail ou CPF já cadastrado.'
        : response.status === 403 ? 'Você não tem permissão para esta ação.'
        : response.status >= 500 ? 'O serviço está indisponível. Tente novamente.' : 'Confira os dados informados.';
      throw new ApiError(response.status < 500 && typeof problem?.detail === 'string' ? problem.detail : fallback,
        response.status, problem?.fields);
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(controller.signal.aborted ? 'A conexão demorou demais. Tente novamente.'
      : 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0);
  } finally {
    clearTimeout(timeout);
  }
}
