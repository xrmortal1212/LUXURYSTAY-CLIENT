import { startTransition, useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { api, getApiErrorMessage } from '../../../Config/api';
import { EmptyState, ErrorState, LoadingState, Metric, PageHeading, Panel, Status, Table } from './AdminParts';
import DashboardChart from '../DashboardCharts';
import { dateLabel, dateTimeLabel } from '../DashboardUtils';
import BillingWorkflow from '../BillingWorkflow';
import AdministrationTools from '../Dashboards/AdministrationTools';
import RoomManagement from '../RoomManagement';
import RoomTypeManagement from '../RoomTypeManagement';
import AIManagementTools from '../AIManagementTools';
import StaffManagement from '../StaffManagement';

const AdminDashboard = () => {
  const [staff, setStaff] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);
  const [health, setHealth] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationPagination, setReservationPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [bookingActivity, setBookingActivity] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [housekeepingHistory, setHousekeepingHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [reservationFilter, setReservationFilter] = useState('all');
  const [reservationWorkingId, setReservationWorkingId] = useState('');
  const [loadingMoreReservations, setLoadingMoreReservations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState({});
  const [working, setWorking] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    const [staffResult, permissionsResult, settingsResult, healthResult, bookingResult, reservationResult, feedbackResult, activityResult, servicesResult, maintenanceResult, tasksResult, historyResult, auditResult] = await Promise.allSettled([
      api.get('/users/staff'),
      api.get('/users/role-permissions'),
      api.get('/system/settings'),
      fetch(`${api.defaults.baseURL.replace(/\/api\/v1$/, '')}/api/health`).then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.status || 'Health check unavailable');
        return body;
      }),
      api.get('/analytics/kpis'),
      api.get('/bookings', { params: { limit: 100, page: 1 } }),
      api.get('/feedback', { params: { limit: 10 } }),
      api.get('/bookings', { params: { limit: 10, sort: 'activity' } }),
      api.get('/services'),
      api.get('/maintenance'),
      api.get('/housekeeping/tasks', { params: { limit: 100 } }),
      api.get('/housekeeping/tasks/history', { params: { limit: 100 } }),
      api.get('/reports/audit-logs', { params: { limit: 15 } })
    ]);
    if (staffResult.status === 'fulfilled') setStaff(staffResult.value.data.staff || []);
    if (permissionsResult.status === 'fulfilled') setPermissions(permissionsResult.value.data);
    if (settingsResult.status === 'fulfilled') {
      const settingsData = settingsResult.value.data;
      setSettings(settingsData);
      setSettingsForm({
        taxPercentage: settingsData.taxPercentage ?? 18,
        baseCurrency: settingsData.baseCurrency || 'USD',
        checkInTime: settingsData.checkInTime || '14:00',
        checkOutTime: settingsData.checkOutTime || '11:00',
        cancellationPolicyDays: settingsData.cancellationPolicyDays ?? 1
      });
    }
    if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
    if (bookingResult.status === 'fulfilled') setBookingStats(bookingResult.value.data.bookingStats);
    if (reservationResult.status === 'fulfilled') {
      setReservations(reservationResult.value.data.bookings || []);
      setReservationPagination(reservationResult.value.data.pagination || { page: 1, pages: 1, total: 0 });
    }
    if (feedbackResult.status === 'fulfilled') setFeedback(feedbackResult.value.data.feedbacks || []);
    if (activityResult.status === 'fulfilled') setBookingActivity(activityResult.value.data.bookings || []);
    if (servicesResult.status === 'fulfilled') setServiceRequests(servicesResult.value.data.requests || []);
    if (maintenanceResult.status === 'fulfilled') setMaintenanceIssues(maintenanceResult.value.data.issues || []);
    if (tasksResult.status === 'fulfilled') setHousekeepingTasks(tasksResult.value.data.tasks || []);
    if (historyResult.status === 'fulfilled') setHousekeepingHistory(historyResult.value.data.tasks || []);
    if (auditResult.status === 'fulfilled') setAuditLogs(auditResult.value.data.logs || []);
    const panelFailures = [
      ['staff', staffResult, 'Staff records could not be loaded.'],
      ['permissions', permissionsResult, 'Role permissions could not be loaded.'],
      ['settings', settingsResult, 'System settings could not be loaded.'],
      ['health', healthResult, 'System health could not be checked.'],
      ['bookingStats', bookingResult, 'Booking statistics could not be loaded.'],
      ['reservations', reservationResult, 'Reservations could not be loaded.'],
      ['feedback', feedbackResult, 'Guest feedback could not be loaded.'],
      ['activity', activityResult, 'Booking activity could not be loaded.'],
      ['services', servicesResult, 'Service requests could not be loaded.'],
      ['maintenance', maintenanceResult, 'Maintenance issues could not be loaded.'],
      ['tasks', tasksResult, 'Housekeeping tasks could not be loaded.'],
      ['history', historyResult, 'Housekeeping history could not be loaded.'],
      ['audit', auditResult, 'Audit activity could not be loaded.']
    ];
    const nextErrors = {};
    panelFailures.forEach(([key, result, message]) => {
      if (result.status === 'rejected') nextErrors[key] = getApiErrorMessage(result.reason, message);
    });
    setLoadErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);

  const saveSettings = async event => {
    event.preventDefault();
    setWorking(true);
    setError('');
    try {
      const { data } = await api.put('/system/settings', {
        ...settingsForm,
        taxPercentage: Number(settingsForm.taxPercentage),
        cancellationPolicyDays: Number(settingsForm.cancellationPolicyDays)
      });
      setSettings(data.settings);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'System settings could not be saved.'));
    } finally {
      setWorking(false);
    }
  };

  const downloadAudit = async () => {
    try {
      const { data } = await api.get('/reports/audit-logs/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'luxurystay-audit-log.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Audit report could not be downloaded.'));
    }
  };

  const cancelReservation = async booking => {
    if (reservationWorkingId) return;
    setReservationWorkingId(booking._id);
    setError('');
    try {
      await api.patch(`/bookings/${booking._id}/cancel`, {});
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Reservation could not be cancelled.'));
    } finally {
      setReservationWorkingId('');
    }
  };

  const loadMoreReservations = async () => {
    if (loadingMoreReservations || reservationPagination.page >= reservationPagination.pages) return;
    setLoadingMoreReservations(true);
    setError('');
    try {
      const { data } = await api.get('/bookings', {
        params: { limit: 100, page: reservationPagination.page + 1 }
      });
      setReservations(current => [...current, ...(data.bookings || [])]);
      setReservationPagination(data.pagination || reservationPagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'More reservations could not be loaded.'));
    } finally {
      setLoadingMoreReservations(false);
    }
  };

  const visibleReservations = reservationFilter === 'all'
    ? reservations
    : reservations.filter(booking => booking.status === reservationFilter);
  const housekeepingEvents = housekeepingHistory.flatMap(task => (task.history || []).map(event => ({
    ...event,
    id: `${task._id}-${event._id || event.timestamp}`,
    task
  }))).sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp)).slice(0, 20);
  const reservationStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'];
  const staffRoles = [...new Set(staff.map(member => member.role))].sort();

  return (
    <div className="admin-dashboard">
      <PageHeading
        eyebrow="PROPERTY ADMINISTRATION"
        title="Administration overview"
        description="Manage property operations, staff access, reservations, and system settings."
        action={<button className="dash-button-secondary" type="button" onClick={() => load(true)} disabled={loading}><RefreshCw size={14} /> Refresh data</button>}
      />
      {error && <ErrorState message={error} onRetry={() => load(true)} />}
      {loading ? <LoadingState label="Loading administration data…" /> : (
        <>
          <div className="admin-section-heading">
            <span>At a glance</span>
            <h2>Property overview</h2>
          </div>
          <div className="dash-metrics" id="overview">
            <Metric label="API status" value={health?.status || 'Unknown'} note={health?.dependencies?.database === 'connected' ? 'Database connected' : 'Database unavailable'} />
            <Metric label="Active staff" value={staff.filter(member => member.accountStatus === 'active').length} note={`${staff.length} staff accounts`} />
            <Metric label="Role groups" value={Object.keys(permissions?.roles || {}).length || 0} note="Configured access profiles" />
            <Metric label="Tax rate" value={settings ? `${settings.taxPercentage}%` : '—'} note={settings?.baseCurrency || 'System setting'} />
            <Metric label="Reservations" value={bookingStats?.totalBookings ?? reservations.length} note={`${bookingStats?.pendingBookings || 0} awaiting arrival`} />
          </div>

          <div className="admin-section-heading admin-section-heading--subsection">
            <span>Live analytics</span>
            <h2>Reservations & team</h2>
          </div>
          <div className="dash-grid-2 dash-chart-grid">
            <Panel title="Reservation status" meta="Loaded reservations" error={loadErrors.reservations} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body">
                <DashboardChart
                  type="doughnut"
                  theme="admin"
                  labels={reservationStatuses.map(status => status.replaceAll('_', ' '))}
                  datasets={[{ label: 'Reservations', data: reservationStatuses.map(status =>
                    reservations.filter(booking => booking.status === status).length
                  ) }]}
                  height={260}
                />
              </div>
            </Panel>
            <Panel title="Staff by role" meta={`${staff.filter(member => member.accountStatus === 'active').length} active accounts`} error={loadErrors.staff} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body">
                <DashboardChart
                  type="bar"
                  theme="admin"
                  labels={staffRoles.map(role => role.replaceAll('_', ' '))}
                  datasets={[{ label: 'Active staff', data: staffRoles.map(role =>
                    staff.filter(member => member.role === role && member.accountStatus === 'active').length
                  ) }]}
                  height={260}
                />
              </div>
            </Panel>
          </div>

          <div className="dash-grid-2">
            <div className="dash-stack">
              <div className="admin-section-heading admin-section-heading--column">
                <span>Workspace</span>
                <h2>People, property & bookings</h2>
              </div>
              <StaffManagement staff={staff} onChanged={() => load()} />

              <Panel id="settings" title="System settings" meta="Current property configuration" error={loadErrors.settings} onRetry={() => load(true)} lazy>
                {settings && settingsForm ? <form className="dash-panel-body dash-stack" onSubmit={saveSettings}>
                  <div className="dash-form-grid">
                    <label className="dash-field">Tax percentage<input type="number" min="0" max="100" step="0.01" value={settingsForm.taxPercentage} onChange={event => setSettingsForm({ ...settingsForm, taxPercentage: event.target.value })} /></label>
                    <label className="dash-field">Currency<input required minLength="3" maxLength="3" value={settingsForm.baseCurrency} onChange={event => setSettingsForm({ ...settingsForm, baseCurrency: event.target.value.toUpperCase() })} /></label>
                    <label className="dash-field">Check-in<input type="time" value={settingsForm.checkInTime} onChange={event => setSettingsForm({ ...settingsForm, checkInTime: event.target.value })} /></label>
                    <label className="dash-field">Check-out<input type="time" value={settingsForm.checkOutTime} onChange={event => setSettingsForm({ ...settingsForm, checkOutTime: event.target.value })} /></label>
                    <label className="dash-field">Cancellation notice (days)<input type="number" min="0" max="365" value={settingsForm.cancellationPolicyDays} onChange={event => setSettingsForm({ ...settingsForm, cancellationPolicyDays: event.target.value })} /></label>
                  </div>
                  <button className="dash-button" type="submit" disabled={working}>{working ? 'Saving…' : 'Save system settings'}</button>
                </form> : <EmptyState>System settings unavailable.</EmptyState>}
              </Panel>

              <RoomTypeManagement />
              <RoomManagement />
              <AIManagementTools feedback={feedback} />
              <AdministrationTools />

              <Panel id="reservation-activity" title="Recent booking activity" meta={`${bookingActivity.length} latest reservation updates`} error={loadErrors.activity} onRetry={() => load(true)} lazy>
                <Table rows={bookingActivity} empty="No recent booking activity." columns={[
                  { label: 'Reference', render: booking => <strong>{booking.bookingReference}</strong> },
                  { label: 'Guest', render: booking => booking.user?.name || 'Guest' },
                  { label: 'Status', render: booking => <Status value={booking.status} /> },
                  { label: 'Updated', render: booking => dateTimeLabel(booking.updatedAt || booking.createdAt) }
                ]} />
              </Panel>

              <Panel id="reservations" title="Reservation management" meta={`${reservations.length} of ${reservationPagination.total} records`} error={loadErrors.reservations} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body"><label className="dash-field">Filter by status<select value={reservationFilter} onChange={event => setReservationFilter(event.target.value)}><option value="all">All reservations</option>{['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'].map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label></div>
                <Table rows={visibleReservations} empty="No reservations match this status." columns={[
                  { label: 'Reference', render: booking => <strong>{booking.bookingReference}</strong> },
                  { label: 'Guest', render: booking => booking.user?.name || 'Guest' },
                  { label: 'Room', render: booking => booking.room?.roomNumber || '—' },
                  { label: 'Check-in', render: booking => dateLabel(booking.checkInDate) },
                  { label: 'Status', render: booking => <Status value={booking.status} /> },
                  { label: 'Manage', render: booking => ['pending', 'confirmed'].includes(booking.status) ? <button className="dash-button-danger" type="button" disabled={reservationWorkingId === booking._id} onClick={() => cancelReservation(booking)}>{reservationWorkingId === booking._id ? 'Cancelling…' : 'Cancel'}</button> : '—' }
                ]} />
                {reservationPagination.page < reservationPagination.pages && <div className="dash-panel-body"><button className="dash-button-secondary" type="button" disabled={loadingMoreReservations} onClick={loadMoreReservations}>{loadingMoreReservations ? 'Loading…' : 'Load more reservations'}</button></div>}
              </Panel>
            </div>

            <div className="dash-stack">
              <div className="admin-section-heading admin-section-heading--column">
                <span>Operations</span>
                <h2>Service & audit activity</h2>
              </div>
              <Panel id="request-history" title="Service & maintenance" meta={`${serviceRequests.length + maintenanceIssues.length} active requests`} error={loadErrors.services || loadErrors.maintenance} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-stack">
                  <div className="dash-panel-grid">
                    <div>
                      <h3>Service requests</h3>
                      {serviceRequests.length === 0 ? <EmptyState>No service requests.</EmptyState> : <ul className="dash-list">{serviceRequests.slice(0, 4).map(request => <li key={request._id}><strong>{request.serviceType || 'Service'}</strong><span>{request.status}</span></li>)}</ul>}
                    </div>
                    <div>
                      <h3>Maintenance issues</h3>
                      {maintenanceIssues.length === 0 ? <EmptyState>No maintenance alerts.</EmptyState> : <ul className="dash-list">{maintenanceIssues.slice(0, 4).map(issue => <li key={issue._id}><strong>{issue.title || 'Issue'}</strong><span>{issue.status}</span></li>)}</ul>}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel id="operations-history" title="Housekeeping operations" meta={`${housekeepingTasks.length} current tasks`} error={loadErrors.tasks || loadErrors.history} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-stack">
                  <div className="dash-panel-grid">
                    <div>
                      <h3>Open tasks</h3>
                      {housekeepingTasks.length === 0 ? <EmptyState>No housekeeping tasks.</EmptyState> : <ul className="dash-list">{housekeepingTasks.slice(0, 4).map(task => <li key={task._id}><strong>{task.room?.roomNumber || 'Room'}</strong><span>{task.status}</span></li>)}</ul>}
                    </div>
                    <div>
                      <h3>Recent history</h3>
                      {housekeepingEvents.length === 0 ? <EmptyState>No recent history.</EmptyState> : <ul className="dash-list">{housekeepingEvents.slice(0, 4).map(event => <li key={event.id}><strong>{event.task?.room?.roomNumber || 'Room'}</strong><span>{event.action || 'Updated'}</span></li>)}</ul>}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel id="audit" title="Audit activity" meta={`${auditLogs.length} entries`} error={loadErrors.audit} onRetry={() => load(true)} lazy action={<button className="dash-button-secondary" type="button" onClick={downloadAudit}><Download size={14} /> Report</button>}>
                <Table rows={auditLogs} empty="No audit entries found." columns={[
                  { label: 'Action', render: log => <strong>{log.action}</strong> },
                  { label: 'User', render: log => log.user?.name || log.user || 'System' },
                  { label: 'When', render: log => dateTimeLabel(log.createdAt) }
                ]} />
              </Panel>
            </div>
          </div>

          <BillingWorkflow />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
