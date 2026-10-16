import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../../Config/api';
import { dashboardPathForRole } from '../../../Config/auth';
import { useAuth } from '../../../Core/AuthHooks';
import AdminRouter from './AdminRouter';
import AdminShell from './AdminShell';
import { DashboardThemeProvider } from '../DashboardTheme';
import '../Dashboard.css';
import './AdminDashboard.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoutError, setLogoutError] = useState('');
  const [liveNotification, setLiveNotification] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/notifications', { params: { unreadOnly: true } })
      .then(({ data }) => {
        if (mounted) setUnreadCount(count => Math.max(count, data.unreadCount || 0));
      })
      .catch(error => {
        if (mounted) setLiveNotification(getApiErrorMessage(error, 'Notifications could not be loaded.'));
      });

    if (typeof EventSource === 'undefined') {
      return () => { mounted = false; };
    }

    const streamUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/notifications/stream`;
    const stream = new EventSource(streamUrl, { withCredentials: true });
    let dismissTimer;

    const onNotification = event => {
      let notification;
      try {
        notification = JSON.parse(event.data);
      } catch {
        return;
      }
      setUnreadCount(count => count + 1);
      setLiveNotification(notification.message || 'You have a new notification.');
      window.clearTimeout(dismissTimer);
      dismissTimer = window.setTimeout(() => setLiveNotification(''), 7000);
    };

    const onStreamError = () => setLiveNotification('Live notifications are temporarily disconnected. Reconnecting…');
    stream.addEventListener('notification', onNotification);
    stream.addEventListener('error', onStreamError);

    return () => {
      mounted = false;
      stream.removeEventListener('notification', onNotification);
      stream.removeEventListener('error', onStreamError);
      stream.close();
      window.clearTimeout(dismissTimer);
    };
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to={dashboardPathForRole(user.role)} replace />;

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, 'Could not sign out. Please try again.'));
    }
  };

  return (
    <DashboardThemeProvider>
      <AdminShell user={user} unreadCount={unreadCount} onUnreadChange={setUnreadCount} logoutError={logoutError} onLogout={handleLogout}>
        {liveNotification && <div className="dash-note" role="status" aria-live="polite">{liveNotification}</div>}
        <AdminRouter user={user} />
      </AdminShell>
    </DashboardThemeProvider>
  );
};

export default AdminLayout;
