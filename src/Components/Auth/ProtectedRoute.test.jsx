import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { AuthContext } from '../../Core/AuthHooks';
import ProtectedRoute from './ProtectedRoute';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mountedRoots = [];

const renderRoute = async (user, path, protectedRole = 'admin') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });

  await act(async () => {
    root.render(
      <AuthContext.Provider value={{ user, isLoading: false }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/login" element={<div>sign in page</div>} />
            <Route path="/" element={<div>public home</div>} />
            <Route path="/app/:role" element={
              <ProtectedRoute allowedRoles={[protectedRole]}>
                <div>{protectedRole} dashboard</div>
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
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

it('redirects signed-out users away from a protected dashboard', async () => {
  const container = await renderRoute(null, '/app/admin');
  expect(container.textContent).toContain('sign in page');
  expect(container.textContent).not.toContain('admin dashboard');
});

it('denies a guest access to an admin dashboard', async () => {
  const container = await renderRoute({ _id: 'guest-1', role: 'guest' }, '/app/admin');
  expect(container.textContent).toContain('public home');
  expect(container.textContent).not.toContain('admin dashboard');
});

it('allows an admin into the protected admin dashboard', async () => {
  const container = await renderRoute({ _id: 'admin-1', role: 'admin' }, '/app/admin');
  expect(container.textContent).toContain('admin dashboard');
});

it('allows each role into its own dashboard and blocks cross-role navigation', async () => {
  const roles = ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'];

  for (let index = 0; index < roles.length; index += 1) {
    const role = roles[index];
    const user = { _id: `${role}-1`, role };
    const allowed = await renderRoute(user, `/app/${role}`, role);
    expect(allowed.textContent).toContain(`${role} dashboard`);

    const otherRole = roles[(index + 1) % roles.length];
    const denied = await renderRoute(user, `/app/${otherRole}`, otherRole);
    expect(denied.textContent).toContain('public home');
    expect(denied.textContent).not.toContain(`${otherRole} dashboard`);
  }
});