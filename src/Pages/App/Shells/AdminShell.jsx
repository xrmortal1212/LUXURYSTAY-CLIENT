import { useState } from 'react';
import { Menu, ShieldCheck, Settings2, Users, ChartNoAxesCombined, CalendarDays, Activity, X, ClipboardCheck, ConciergeBell, BedDouble, BrainCircuit } from 'lucide-react';
import { DashboardBrand, DashboardIdentity, NotificationIndicator, PropertyLabel, SidebarNav, SignOutButton } from '../DashboardShellParts';

const links = [
  { label: 'Overview', href: '#overview', icon: ChartNoAxesCombined },
  { label: 'Staff & access', href: '#staff', icon: Users },
  { label: 'Reservations', href: '#reservations', icon: CalendarDays },
  { label: 'Room inventory', href: '#rooms', icon: BedDouble },
  { label: 'AI operations', href: '#ai-tools', icon: BrainCircuit },
  { label: 'System settings', href: '#settings', icon: Settings2 },
  { label: 'Operations history', href: '#operations-history', icon: ClipboardCheck },
  { label: 'Service & maintenance', href: '#request-history', icon: ConciergeBell },
  { label: 'Audit activity', href: '#activity', icon: Activity },
  { label: 'Audit report', href: '#audit', icon: ShieldCheck }
];

const AdminShell = ({ user, unreadCount, onUnreadChange, logoutError, onLogout, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dashboard-shell dashboard-shell--admin">
      <aside className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Administration navigation">
        <DashboardBrand />
        <div className="dashboard-role-label">CONTROL ROOM</div>
        <SidebarNav links={links} onNavigate={() => setMenuOpen(false)} />
        <div className="dashboard-sidebar-bottom"><PropertyLabel /><SignOutButton onLogout={onLogout} /></div>
      </aside>
      {menuOpen && <button className="dashboard-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-icon-button dashboard-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="dashboard-topbar-heading"><span>Administration</span><small>System control</small></div>
          <div className="dashboard-topbar-actions"><NotificationIndicator unreadCount={unreadCount} onUnreadChange={onUnreadChange} /><DashboardIdentity user={user} /></div>
        </header>
        {logoutError && <div className="dashboard-toast-error" role="alert">{logoutError}</div>}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;