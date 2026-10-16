import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Bot, CalendarDays, ConciergeBell, Search, UserRound } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, SignOutButton, TopNav } from '../DashboardShellParts';
import { DashboardThemeToggle } from '../DashboardTheme';

const links = [
  { label: 'My stay', href: '#overview', icon: CalendarDays },
  { label: 'Rewards', href: '#loyalty-rewards', icon: Award },
  { label: 'Reservations', href: '#reservations', icon: CalendarDays },
  { label: 'Find a room', href: '#room-search', icon: Search },
  { label: 'AI concierge', href: '#ai-concierge', icon: Bot },
  { label: 'Services', href: '#service-requests', icon: ConciergeBell },
  { label: 'Profile', href: '#profile', icon: UserRound }
];

const GuestShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => (
  <div className="dashboard-shell dashboard-shell--guest">
    <a className="dash-skip-link" href="#dashboard-content">Skip to content</a>
    <header className="guest-shell-header">
      <DashboardBrand compact />
      <TopNav links={links} />
      <div className="guest-shell-identity"><DashboardThemeToggle /><DashboardIdentity user={user} /><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><SignOutButton onLogout={onLogout} compact /></div>
    </header>
    <div className="guest-shell-context"><span>YOUR LUXURYSTAY ACCOUNT</span><Link className="guest-shell-back-link" to="/"><ArrowLeft size={14} aria-hidden="true" />Back to hotel site</Link></div>
    {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
    <main className="dashboard-content guest-shell-content" id="dashboard-content" tabIndex={-1}>{children}</main>
  </div>
);

export default GuestShell;