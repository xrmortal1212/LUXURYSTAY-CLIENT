import { BedDouble, CalendarDays, ChartNoAxesCombined, ConciergeBell, Menu, Users, X, Settings2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, PropertyLabel, SidebarNav, SignOutButton } from '../DashboardShellParts';
import { DashboardThemeToggle } from '../DashboardTheme';
import { useDashboardMenu } from '../DashboardShellHooks';
import { Link } from 'react-router-dom'


const links = [
  { label: 'Overview', href: '#overview', icon: ChartNoAxesCombined },
  { label: 'Reservations', href: '#reservations', icon: CalendarDays },
  { label: 'Departures', href: '#departures', icon: CalendarDays },
  { label: 'History & activity', href: '#history', icon: ConciergeBell },
  { label: 'Staff & access', href: '#staff', icon: Users },
  { label: 'Housekeeping & assignments', href: '#operations', icon: BedDouble },
  { label: 'Room readiness', href: '#readiness', icon: BedDouble },
  { label: 'Service requests', href: '#service-requests', icon: ConciergeBell },
  { label: 'Maintenance', href: '#maintenance', icon: Settings2 },
  { label: 'Rooms', href: '#rooms', icon: BedDouble },
  { label: 'AI operations', href: '#ai-tools', icon: BrainCircuit },
  { label: 'Guest feedback', href: '#feedback', icon: ConciergeBell }
];

const ManagerShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => {
  const [menuOpen, setMenuOpen] = useDashboardMenu();
  return (
    <div className="dashboard-shell dashboard-shell--manager">
      <a className="dash-skip-link" href="#dashboard-content">Skip to content</a>
      <aside id="dashboard-sidebar" className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Management navigation">
        <DashboardBrand />
        <div className="dashboard-role-label">PROPERTY OPERATIONS</div>
        <SidebarNav links={links} onNavigate={() => setMenuOpen(false)} />
        <div className="dashboard-sidebar-bottom"><PropertyLabel /><SignOutButton onLogout={onLogout} /></div>
      </aside>
      {menuOpen && <button className="dashboard-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-icon-button dashboard-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="dashboard-topbar-heading"><span>Management</span><small>Daily performance</small></div>
          <div className="dashboard-topbar-actions"><DashboardThemeToggle /><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><DashboardIdentity user={user} /></div>
        </header>
         <div className="guest-shell-context"><span>YOUR LUXURYSTAY ACCOUNT</span><Link className="guest-shell-back-link" to="/"><ArrowLeft size={14} aria-hidden="true" />Back to hotel site</Link></div>
        {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
        <main className="dashboard-content" id="dashboard-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
};

export default ManagerShell;