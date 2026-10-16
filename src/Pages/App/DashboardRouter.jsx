import GuestDashboard from './Dashboards/GuestDashboard';
import HousekeepingDashboard from './Dashboards/HousekeepingDashboard';
import ManagerDashboard from './Dashboards/ManagerDashboard';
import ReceptionistDashboard from './Dashboards/ReceptionistDashboard';

const DashboardRouter = ({ role, user }) => {
  if (role === 'manager') return <ManagerDashboard user={user} />;
  if (role === 'receptionist') return <ReceptionistDashboard user={user} />;
  if (role === 'housekeeping') return <HousekeepingDashboard user={user} />;
  if (role === 'guest') return <GuestDashboard user={user} />;
  return null;
};

export default DashboardRouter;
