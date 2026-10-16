import { Menu, ShieldCheck, Settings2, Users, ChartNoAxesCombined, CalendarDays, Activity, X, ClipboardCheck, ConciergeBell, BedDouble, BrainCircuit, Building2 } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, PropertyLabel, SidebarNav, SignOutButton } from './AdminShellParts';
import { DashboardThemeToggle } from '../DashboardTheme';
import { useDashboardMenu } from '../DashboardShellHooks';

const links = [
  { group: 'OVERVIEW', label: 'Dashboard', href: '#overview', icon: ChartNoAxesCombined },
  { group: 'PEOPLE & BOOKINGS', label: 'Staff & access', href: '#staff', icon: Users },
  { group: 'PEOPLE & BOOKINGS', label: 'Reservations', href: '#reservations', icon: CalendarDays },
  { group: 'PEOPLE & BOOKINGS', label: 'Booking activity', href: '#reservation-activity', icon: Activity },
  { group: 'PROPERTY SETUP', label: 'Room inventory', href: '#rooms', icon: BedDouble },
  { group: 'PROPERTY SETUP', label: 'Properties', href: '#properties', icon: Building2 },
  { group: 'PROPERTY SETUP', label: 'Dynamic pricing', href: '#pricing-rules', icon: ChartNoAxesCombined },
  { group: 'PROPERTY SETUP', label: 'System settings', href: '#settings', icon: Settings2 },
  { group: 'OPERATIONS', label: 'Service & maintenance', href: '#request-history', icon: ConciergeBell },
  { group: 'OPERATIONS', label: 'Housekeeping history', href: '#operations-history', icon: ClipboardCheck },
  { group: 'OPERATIONS', label: 'AI operations', href: '#ai-tools', icon: BrainCircuit },
  { group: 'SECURITY', label: 'Audit activity', href: '#audit', icon: ShieldCheck }
];

const AdminShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => {
  const [menuOpen, setMenuOpen] = useDashboardMenu();

  return (
    <div className="dashboard-shell dashboard-shell--admin">
      <a className="dash-skip-link" href="#dashboard-content">Skip to content</a>
      <aside id="dashboard-sidebar" className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Administration navigation">
        <DashboardBrand />
        <div className="dashboard-role-label">CONTROL ROOM</div>
        <SidebarNav links={links} onNavigate={() => setMenuOpen(false)} />
        <div className="dashboard-sidebar-bottom">
          <PropertyLabel />
          <SignOutButton onLogout={onLogout} />
        </div>
      </aside>
      {menuOpen && <button className="dashboard-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-icon-button dashboard-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="dashboard-topbar-heading"><span>Administration</span><small>System control</small></div>
          <div className="dashboard-topbar-actions"><DashboardThemeToggle /><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><DashboardIdentity user={user} /></div>
        </header>
        <div className="dashboard-role-context dashboard-role-context--admin">PROPERTY ADMINISTRATION</div>
        {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
        <main className="dashboard-content" id="dashboard-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
