import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from './tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('set/get/clear del access token', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('abc.123');
    expect(getAccessToken()).toBe('abc.123');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('refreshAccessToken guarda el token devuelto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'nuevo.token' }),
      }),
    );
    const token = await refreshAccessToken();
    expect(token).toBe('nuevo.token');
    expect(getAccessToken()).toBe('nuevo.token');
  });

  it('refreshAccessToken devuelve null y limpia el token si la respuesta no es ok', async () => {
    setAccessToken('viejo');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );
    const token = await refreshAccessToken();
    expect(token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('refreshAccessToken devuelve null si fetch lanza una excepción', async () => {
    setAccessToken('viejo');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const token = await refreshAccessToken();
    expect(token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('usa el mismo fetch al refrescar de forma concurrente', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 't' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 't' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 't' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ]);
    expect(a).toBe('t');
    expect(b).toBe('t');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
