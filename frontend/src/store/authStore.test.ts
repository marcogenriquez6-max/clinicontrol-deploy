import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/services', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('../api/tokenStore', () => ({
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

import { useAuthStore } from './authStore';
import { authService } from '../api/services';
import { setAccessToken, clearAccessToken } from '../api/tokenStore';

const USUARIO = {
  id: 1,
  nombre: 'Admin',
  email: 'admin@clinica.com',
  rol: 'Admin',
};

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  });

  it('login autentica y guarda el token', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { access_token: 'tok.123', user: USUARIO },
    });

    await useAuthStore.getState().login('admin@clinica.com', 'Admin123!', true);

    const s = useAuthStore.getState();
    expect(authService.login).toHaveBeenCalledWith(
      'admin@clinica.com',
      'Admin123!',
      true,
    );
    expect(setAccessToken).toHaveBeenCalledWith('tok.123');
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe('tok.123');
    expect(s.user).toEqual(USUARIO);
  });

  it('logout limpia el estado y el token', async () => {
    (authService.logout as ReturnType<typeof vi.fn>).mockResolvedValue({});
    useAuthStore.setState({
      user: USUARIO,
      token: 'tok',
      isAuthenticated: true,
      isInitializing: false,
    });

    await useAuthStore.getState().logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(clearAccessToken).toHaveBeenCalled();
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
  });

  it('initialize restaura la sesión desde el refresh token', async () => {
    (authService.refresh as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { access_token: 'refreshed', user: USUARIO },
    });

    await useAuthStore.getState().initialize();

    const s = useAuthStore.getState();
    expect(setAccessToken).toHaveBeenCalledWith('refreshed');
    expect(s.isInitializing).toBe(false);
    expect(s.isAuthenticated).toBe(true);
    expect(s.user).toEqual(USUARIO);
  });

  it('initialize no autentica si el refresh falla', async () => {
    (authService.refresh as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('no session'),
    );

    await useAuthStore.getState().initialize();

    const s = useAuthStore.getState();
    expect(s.isInitializing).toBe(false);
    expect(s.isAuthenticated).toBe(false);
  });

  it('setSession autentica con token y usuario dados', () => {
    useAuthStore.getState().setSession('directo', USUARIO);
    const s = useAuthStore.getState();
    expect(setAccessToken).toHaveBeenCalledWith('directo');
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe('directo');
  });
});
