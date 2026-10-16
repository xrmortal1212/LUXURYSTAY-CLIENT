import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthContext } from '../../../Core/AuthHooks';
import OAuthCallback from './OAuthCallback';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mountedRoots = [];

const renderCallback = async (search, refreshSession) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });

  await act(async () => {
    root.render(
      <AuthContext.Provider value={{ refreshSession }}>
        <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
          <Routes>
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/app/:role" element={<div>role dashboard</div>} />
            <Route path="/login" element={<div>sign in page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return container;
};

afterEach(async () => {
  await act(async () => {
    mountedRoots.splice(0).forEach(({ root, container }) => {
      root.unmount();
      container.remove();
    });
  });
});

it('restores the provider session and redirects OAuth success by role', async () => {
  const refreshSession = vi.fn().mockResolvedValue({ role: 'manager' });
  const container = await renderCallback('?status=success', refreshSession);
  expect(refreshSession).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain('role dashboard');
});

it('shows a retry path when the OAuth provider reports failure', async () => {
  const refreshSession = vi.fn();
  const container = await renderCallback('?status=failed', refreshSession);
  expect(refreshSession).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Sign-in could not be completed.');
  expect(container.textContent).toContain('Return to sign in');
});