import axios, { AxiosError } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { dashboardPathForRole } from './auth';

const originalAdapter = api.defaults.adapter;

const unauthorizedResponse = (config) => new AxiosError(
  'Access token expired',
  'ERR_BAD_REQUEST',
  config,
  null,
  { status: 401, statusText: 'Unauthorized', headers: {}, config, data: { message: 'Unauthorized' } }
);

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

describe('shared API client', () => {
  it('sends requests with cookies and targets the versioned API', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.baseURL).toMatch(/\/api\/v1$/);
  });

  it('routes each authenticated role to its own dashboard', () => {
    expect(dashboardPathForRole('admin')).toBe('/app/admin');
    expect(dashboardPathForRole('manager')).toBe('/app/manager');
    expect(dashboardPathForRole('receptionist')).toBe('/app/receptionist');
    expect(dashboardPathForRole('housekeeping')).toBe('/app/housekeeping');
    expect(dashboardPathForRole('guest')).toBe('/app/guest');
    expect(dashboardPathForRole('unexpected')).toBe('/login');
  });

  it('uses one refresh request for concurrent 401s and retries both requests', async () => {
    const adapter = vi.fn(config => {
      if (!config._retry) return Promise.reject(unauthorizedResponse(config));
      return Promise.resolve({ status: 200, statusText: 'OK', headers: {}, config, data: { ok: true } });
    });
    api.defaults.adapter = adapter;
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'refreshed' } });

    const results = await Promise.all([api.get('/users/profile'), api.get('/bookings')]);

    expect(results.map(result => result.data.ok)).toEqual([true, true]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/auth\/refresh-token$/),
      {},
      { withCredentials: true }
    );
    expect(adapter).toHaveBeenCalledTimes(4);
  });

  it('does not try refreshing failed credential submissions', async () => {
    api.defaults.adapter = vi.fn(config => Promise.reject(unauthorizedResponse(config)));
    const refresh = vi.spyOn(axios, 'post');

    await expect(api.post('/auth/login', { email: 'guest@example.com', password: 'invalid' })).rejects.toMatchObject({
      response: { status: 401 }
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('notifies the session provider when refresh fails', async () => {
    api.defaults.adapter = vi.fn(config => Promise.reject(unauthorizedResponse(config)));
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'));
    const unauthorized = vi.fn();
    window.addEventListener('luxurystay:unauthorized', unauthorized);

    await expect(api.get('/users/profile')).rejects.toThrow('refresh failed');

    expect(unauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener('luxurystay:unauthorized', unauthorized);
  });
});