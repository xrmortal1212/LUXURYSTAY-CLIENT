import { BedDouble, CalendarDays, ClipboardCheck, Menu, Settings2, X } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, PropertyLabel, SidebarNav, SignOutButton } from '../DashboardShellParts';
import { DashboardThemeToggle } from '../DashboardTheme';
import { useDashboardMenu } from '../DashboardShellHooks';

const links = [
  { label: 'Cleaning queue', href: '#queue', icon: ClipboardCheck },
  { label: 'Room readiness', href: '#readiness', icon: BedDouble },
  { label: 'Upcoming stays', href: '#upcoming-readiness', icon: CalendarDays },
  { label: 'Maintenance', href: '#maintenance', icon: Settings2 }
];

const HousekeepingShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => {
  const [menuOpen, setMenuOpen] = useDashboardMenu();
  return (
    <div className="dashboard-shell dashboard-shell--housekeeping">
      <a className="dash-skip-link" href="#dashboard-content">Skip to content</a>
      <aside id="dashboard-sidebar" className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Housekeeping navigation">
        <DashboardBrand />
        <div className="dashboard-role-label">ROOM READINESS</div>
        <SidebarNav links={links} onNavigate={() => setMenuOpen(false)} />
        <div className="dashboard-sidebar-bottom"><PropertyLabel /><SignOutButton onLogout={onLogout} /></div>
      </aside>
      {menuOpen && <button className="dashboard-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-icon-button dashboard-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="dashboard-topbar-heading"><span>Housekeeping</span><small>Room turnover</small></div>
          <div className="dashboard-topbar-actions"><DashboardThemeToggle /><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><DashboardIdentity user={user} /></div>
        </header>
        <div className="dashboard-role-context dashboard-role-context--housekeeping">HOUSEKEEPING OPERATIONS</div>
        {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
        <main className="dashboard-content" id="dashboard-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
};

export default HousekeepingShell;