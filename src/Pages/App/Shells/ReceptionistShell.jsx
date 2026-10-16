import { CalendarDays, ClipboardCheck, DoorOpen, LogOut, Search, ConciergeBell, Settings2, ArrowLeft } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, SignOutButton, TopNav } from '../DashboardShellParts';
import { DashboardThemeToggle } from '../DashboardTheme';
import { Link } from 'react-router-dom'


const links = [
  { label: 'Today', href: '#overview', icon: CalendarDays },
  { label: 'Arrivals', href: '#arrivals', icon: DoorOpen },
  { label: 'Departures', href: '#departures', icon: LogOut },
  { label: 'Room search', href: '#room-search', icon: Search },
  { label: 'New booking', href: '#new-booking', icon: CalendarDays },
  { label: 'Guest search', href: '#guest-search', icon: ClipboardCheck },
  { label: 'Service requests', href: '#service-requests', icon: ConciergeBell },
  { label: 'Maintenance', href: '#maintenance-requests', icon: Settings2 }
];

const ReceptionistShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => (
  <div className="dashboard-shell dashboard-shell--receptionist">
    <a className="dash-skip-link" href="#dashboard-content">Skip to content</a>
    <header className="reception-shell-header">
      <DashboardBrand compact />
      <div className="reception-shell-identity"><DashboardThemeToggle /><DashboardIdentity user={user} /><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><SignOutButton onLogout={onLogout} compact /></div>
    </header>
    <div className="reception-shell-nav"><TopNav links={links} /></div>
     <div className="guest-shell-context"><span>YOUR LUXURYSTAY ACCOUNT</span><Link className="guest-shell-back-link" to="/"><ArrowLeft size={14} aria-hidden="true" />Back to hotel site</Link></div>
    {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
    <main className="dashboard-content reception-shell-content" id="dashboard-content" tabIndex={-1}>{children}</main>
  </div>
);

export default ReceptionistShell;