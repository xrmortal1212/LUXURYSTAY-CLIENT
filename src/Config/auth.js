export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ROLE_DASHBOARD_PATHS = Object.freeze({
  admin: '/app/admin',
  manager: '/app/manager',
  receptionist: '/app/receptionist',
  housekeeping: '/app/housekeeping',
  guest: '/app/guest'
});

export const dashboardPathForRole = (role) => ROLE_DASHBOARD_PATHS[role] || '/login';

export const startOAuth = (provider) => {
  const supportedProviders = new Set(['google', 'github']);
  const normalizedProvider = String(provider).toLowerCase();
  if (!supportedProviders.has(normalizedProvider)) throw new Error('Unsupported sign-in provider');
  window.location.assign(`${API_BASE_URL}/api/v1/auth/oauth/${normalizedProvider}`);
};