import { create } from 'zustand';
import type { AuthResponse, Usuario } from '../types';
import { authService } from '../api/services';
import { setAccessToken, clearAccessToken } from '../api/tokenStore';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginMfa: (mfaToken: string, code: string) => Promise<void>;
  register: (data: Partial<Usuario>) => Promise<void>;
  logout: () => void;
  setSession: (accessToken: string, user: AuthResponse['user']) => void;
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,

  // Restaura la sesión al recargar la página usando el refresh token (cookie httpOnly).
  // Guardado por un promise único: React StrictMode (dev) invoca el efecto 2 veces, y con
  // rotación de refresh token dos llamadas concurrentes harían fallar la segunda (401).
  initialize: async () => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        const response = await authService.refresh();
        const { access_token, user } = response.data as AuthResponse;
        setAccessToken(access_token);
        // No pisar una sesión ya iniciada manualmente durante el refresh.
        set((s) => (s.isAuthenticated ? {} : { user, token: access_token, isAuthenticated: true }));
      } catch {
        // Sin sesión restaurable: NO tocar isAuthenticated (un login concurrente debe prevalecer).
      } finally {
        set({ isInitializing: false });
      }
    })();
    return initPromise;
  },

  login: async (email, password) => {
    const response = await authService.login(email, password);
    const data = response.data;
    if ((data as any).mfaRequired) {
      set({ user: null, token: null, isAuthenticated: false });
      throw { mfaRequired: true, mfaToken: (data as any).mfaToken };
    }
    const { access_token, user } = data as AuthResponse;
    setAccessToken(access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  loginMfa: async (mfaToken, code) => {
    const response = await authService.loginMfa(mfaToken, code);
    const { access_token, user } = response.data;
    setAccessToken(access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await authService.register(data as Parameters<typeof authService.register>[0]);
    const { access_token, user } = response.data;
    setAccessToken(access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  logout: async () => {
    try { await authService.logout(); } catch { /* el backend ya invalido la sesion */ }
    clearAccessToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setSession: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ user, token: accessToken, isAuthenticated: true });
  },
}));
