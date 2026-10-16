import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Building2, Check, CheckCheck, LogOut, X } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';

export const DashboardBrand = ({ compact = false }) => (
  <Link className={`dashboard-brand${compact ? ' dashboard-brand--compact' : ''}`} to="/">
    <span className="dashboard-brand-mark">L</span>
    <span>LuxuryStay<small>HOSPITALITY</small></span>
  </Link>
);

export const DashboardIdentity = ({ user }) => {
  const displayName = user.name?.split(' ')[0] || 'Guest';
  return (
    <div className="dashboard-user-chip">
      <span className="dashboard-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
      <span><strong>{user.name}</strong><small>{user.role}</small></span>
    </div>
  );
};

export const NotificationIndicator = ({ unreadCount, onUnreadChange = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const centerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = event => {
      if (!centerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    api.get('/notifications')
      .then(({ data }) => {
        if (!mounted) return;
        setNotifications(data.notifications || []);
        onUnreadChange(data.unreadCount || 0);
        setError('');
      })
      .catch(requestError => {
        if (mounted) setError(getApiErrorMessage(requestError, 'Notifications could not be loaded.'));
      });
    return () => { mounted = false; };
  }, [isOpen, onUnreadChange]);

  const markRead = async notificationId => {
    setWorkingId(notificationId);
    setError('');
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(current => current.map(item => item._id === notificationId ? { ...item, isRead: true } : item));
      onUnreadChange(Math.max(0, unreadCount - 1));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Notification could not be marked as read.'));
    } finally {
      setWorkingId('');
    }
  };

  const markAllRead = async () => {
    setWorkingId('all');
    setError('');
    try {
      await api.patch('/notifications/mark-all/read');
      setNotifications(current => current.map(item => ({ ...item, isRead: true })));
      onUnreadChange(0);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Notifications could not be marked as read.'));
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="notification-center" ref={centerRef}>
      <button className="dashboard-icon-button notification-button" type="button" aria-label={`${unreadCount} unread notifications`} aria-expanded={isOpen} aria-controls="dashboard-notification-popover" onClick={() => setIsOpen(open => !open)}>
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <section className="notification-popover" id="dashboard-notification-popover" aria-label="Notifications" hidden={!isOpen}>
        <div className="notification-popover-head"><strong>Notifications</strong><div>{unreadCount > 0 && <button type="button" disabled={workingId === 'all'} onClick={markAllRead}><CheckCheck size={14} />Mark all read</button>}<button type="button" aria-label="Close notifications" onClick={() => setIsOpen(false)}><X size={16} /></button></div></div>
        {error && <p className="notification-error" role="alert">{error}</p>}
        <div className="notification-list">
          {notifications.length === 0 && !error && <p className="notification-empty">You're all caught up.</p>}
          {notifications.map(notification => <article className={`notification-item${notification.isRead ? '' : ' is-unread'}`} key={notification._id}>
            <div><p>{notification.message}</p><time>{new Date(notification.createdAt).toLocaleString()}</time></div>
            {!notification.isRead && <button type="button" aria-label="Mark as read" disabled={Boolean(workingId)} onClick={() => markRead(notification._id)}><Check size={15} /></button>}
          </article>)}
        </div>
      </section>
    </div>
  );
};

export const SignOutButton = ({ onLogout, compact = false }) => (
  <button className={compact ? 'dashboard-logout dashboard-logout--compact' : 'dashboard-logout'} type="button" aria-label="Sign out" onClick={onLogout}>
    <LogOut size={17} aria-hidden="true" /> <span>Sign out</span>
  </button>
);

export const PropertyLabel = () => (
  <div className="dashboard-property-mark"><Building2 size={17} /> LuxuryStay Portfolio</div>
);

export const useActiveDashboardSection = links => {
  const [activeHref, setActiveHref] = useState(() => {
    const initialHash = typeof window === 'undefined' ? '' : window.location.hash;
    return links.some(link => link.href === initialHash) ? initialHash : links[0]?.href;
  });

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const sections = links
      .map(link => ({ href: link.href, element: document.getElementById(link.href.slice(1)) }))
      .filter(item => item.element);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
      if (visible[0]) {
        const current = sections.find(section => section.element === visible[0].target);
        if (current) setActiveHref(current.href);
      }
    }, { rootMargin: '-82px 0px -65% 0px', threshold: [0, 0.15, 0.4] });

    sections.forEach(section => observer.observe(section.element));
    return () => observer.disconnect();
  }, [links]);

  return activeHref;
};

export const SidebarNav = ({ links, onNavigate }) => {
  const activeHref = useActiveDashboardSection(links);
  return (
    <nav className="dashboard-nav" aria-label="Dashboard sections">
      {links.map(({ label, href, icon: Icon, group }, index) => (
          <div className="dashboard-nav-item" key={href}>
            {group && links[index - 1]?.group !== group && <span className="dashboard-nav-group-label">{group}</span>}
            <a
              className={`dashboard-nav-link${activeHref === href ? ' is-active' : ''}`}
              href={href}
              aria-current={activeHref === href ? 'location' : undefined}
              onClick={onNavigate}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
            </a>
          </div>
      ))}
    </nav>
  );
};

export const TopNav = ({ links, onNavigate }) => {
  const activeHref = useActiveDashboardSection(links);
  return (
    <nav className="dashboard-top-nav" aria-label="Dashboard sections">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          className={`dashboard-top-nav-link${activeHref === href ? ' is-active' : ''}`}
          href={href}
          key={href}
          aria-current={activeHref === href ? 'location' : undefined}
          onClick={onNavigate}
        >
          <Icon size={15} aria-hidden="true" /><span>{label}</span>
        </a>
      ))}
    </nav>
  );
};