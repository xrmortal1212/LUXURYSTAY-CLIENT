import { startTransition, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, getApiErrorMessage } from '../../../Config/api';
import { BookingTable, EmptyState, ErrorState, LoadingState, Metric, PageHeading, Panel, Status, Table } from '../DashboardParts';
import { dateLabel, dateTimeLabel, downloadBlob, money, titleCase } from '../DashboardUtils';
import DashboardChart from '../DashboardCharts';
import BillingWorkflow from '../BillingWorkflow';
import { getServiceActions } from '../OperationsUtils';
import RoomManagement from '../RoomManagement';
import AIManagementTools from '../AIManagementTools';
import StaffManagement from '../StaffManagement';
import BranchScopeBadge from '../BranchScopeBadge';

const getInitialReportRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
};

const ManagerDashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [bookingActivity, setBookingActivity] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [housekeepingPerformance, setHousekeepingPerformance] = useState([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [reportRange, setReportRange] = useState(getInitialReportRange);
  const [appliedRange, setAppliedRange] = useState(getInitialReportRange);
  const [pricingRoomTypeId, setPricingRoomTypeId] = useState('');
  const [pricingInsight, setPricingInsight] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ roomId: '', assignedTo: '', priority: 'medium', notes: '' });
  const [workingId, setWorkingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState({});

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    const [kpis, performance, reservations, revenueReport, staffResult, feedbackResult, activityResult, tasksResult, housekeepingPerformanceResult, maintenanceResult, servicesResult, roomsResult, forecastResult, popularityResult, roomTypesResult] = await Promise.allSettled([
      api.get('/analytics/kpis'),
      api.get('/analytics/performance'),
      api.get('/bookings', { params: { limit: 100 } }),
      api.get('/analytics/revenue', { params: { period: 'daily', ...appliedRange } }),
      api.get('/users/staff', { params: { status: 'active' } }),
      api.get('/feedback', { params: { limit: 10, ...appliedRange } }),
      api.get('/bookings', { params: { limit: 10, sort: 'activity' } }),
      api.get('/housekeeping/tasks', { params: { limit: 100 } }),
      api.get('/housekeeping/performance'),
      api.get('/maintenance'),
      api.get('/services'),
      api.get('/rooms/calendar', { params: { startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) } }),
      api.get('/analytics/forecast'),
      api.get('/analytics/popularity'),
      api.get('/rooms/types')
    ]);
    if (kpis.status === 'fulfilled') setData(kpis.value.data);
    if (performance.status === 'fulfilled') setData(current => ({ ...current, performance: performance.value.data }));
    if (reservations.status === 'fulfilled') setBookings(reservations.value.data.bookings || []);
    if (revenueReport.status === 'fulfilled') setRevenue(revenueReport.value.data.data || []);
    if (staffResult.status === 'fulfilled') setStaff(staffResult.value.data.staff || []);
    if (feedbackResult.status === 'fulfilled') setFeedback(feedbackResult.value.data.feedbacks || []);
    if (activityResult.status === 'fulfilled') setBookingActivity(activityResult.value.data.bookings || []);
    if (tasksResult.status === 'fulfilled') setHousekeepingTasks(tasksResult.value.data.tasks || []);
    if (housekeepingPerformanceResult.status === 'fulfilled') setHousekeepingPerformance(housekeepingPerformanceResult.value.data.performance || []);
    if (maintenanceResult.status === 'fulfilled') setMaintenanceIssues(maintenanceResult.value.data.issues || []);
    if (servicesResult.status === 'fulfilled') setServiceRequests(servicesResult.value.data.requests || []);
    if (roomsResult.status === 'fulfilled') {
      const calendar = roomsResult.value.data.calendar || [];
      setRooms(calendar);
      setAssignmentForm(current => ({ ...current, roomId: current.roomId || calendar[0]?.roomId || '' }));
    }
    if (forecastResult.status === 'fulfilled') setForecast(forecastResult.value.data.forecast || []);
    if (popularityResult.status === 'fulfilled') setPopularRooms(popularityResult.value.data.popularRoomTypes || []);
    if (roomTypesResult.status === 'fulfilled') {
      const types = roomTypesResult.value.data.roomTypes || [];
      setRoomTypes(types);
      setPricingRoomTypeId(current => current || types[0]?._id || '');
    }
    const panelFailures = [
      ['kpis', kpis, 'Operational metrics could not be loaded.'],
      ['performance', performance, 'Performance analytics could not be loaded.'],
      ['reservations', reservations, 'Reservations could not be loaded.'],
      ['revenue', revenueReport, 'Revenue report could not be loaded.'],
      ['staff', staffResult, 'Staff records could not be loaded.'],
      ['feedback', feedbackResult, 'Guest feedback could not be loaded.'],
      ['activity', activityResult, 'Booking activity could not be loaded.'],
      ['tasks', tasksResult, 'Housekeeping tasks could not be loaded.'],
      ['housekeeping', housekeepingPerformanceResult, 'Housekeeping performance could not be loaded.'],
      ['maintenance', maintenanceResult, 'Maintenance issues could not be loaded.'],
      ['services', servicesResult, 'Service requests could not be loaded.'],
      ['rooms', roomsResult, 'Room readiness could not be loaded.'],
      ['forecast', forecastResult, 'Demand forecast could not be loaded.'],
      ['popularity', popularityResult, 'Room utilization could not be loaded.'],
      ['roomTypes', roomTypesResult, 'Room types could not be loaded.']
    ];
    const nextErrors = {};
    panelFailures.forEach(([key, result, message]) => {
      if (result.status === 'rejected') nextErrors[key] = getApiErrorMessage(result.reason, message);
    });
    setLoadErrors(nextErrors);
    setLoading(false);
  }, [appliedRange]);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);
  const assignHousekeepingTask = async event => {
    event.preventDefault();
    if (!assignmentForm.roomId || !assignmentForm.assignedTo || workingId) return;
    setWorkingId('task-assignment');
    setError('');
    try {
      await api.post('/housekeeping/assign', { ...assignmentForm, priority: assignmentForm.priority });
      setAssignmentForm(current => ({ ...current, notes: '' }));
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Housekeeping task could not be assigned.'));
    } finally {
      setWorkingId('');
    }
  };
  const updateMaintenanceIssue = async (issue, patch) => {
    setWorkingId(issue._id);
    setError('');
    try {
      await api.patch(`/maintenance/${issue._id}/status`, patch);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Maintenance request could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };
  const updateServiceRequest = async (request, patch) => {
    setWorkingId(request._id);
    setError('');
    try {
      await api.patch(`/services/${request._id}/status`, patch);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Service request could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };
  const applyReportRange = event => {
    event.preventDefault();
    setAppliedRange(reportRange);
  };
  const exportReport = async type => {
    setError('');
    try {
      const { data: report } = await api.get(`/reports/${type}/csv`, {
        params: appliedRange,
        responseType: 'blob'
      });
      downloadBlob(report, `${type}-report-${appliedRange.startDate}-${appliedRange.endDate}.csv`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Report could not be downloaded.'));
    }
  };
  const calculatePricingInsight = async () => {
    const room = rooms.find(item => item.roomTypeId === pricingRoomTypeId);
    if (!room || !pricingRoomTypeId) {
      setError('No room of this type is available for a property pricing preview.');
      return;
    }
    setWorkingId('pricing');
    setError('');
    try {
      const { data: insight } = await api.post('/dynamic-pricing/calculate', {
        propertyId: room.propertyId,
        roomTypeId: pricingRoomTypeId,
        date: new Date().toISOString()
      });
      setPricingInsight(insight);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Pricing insight could not be calculated.'));
    } finally {
      setWorkingId('');
    }
  };
  const performance = data?.performance;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const arrivals = bookings.filter(booking => ['confirmed', 'pending'].includes(booking.status) && new Date(booking.checkInDate) >= today)
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
  const departures = bookings.filter(booking => booking.status === 'checked_in' && new Date(booking.checkOutDate) >= today)
    .sort((a, b) => new Date(a.checkOutDate) - new Date(b.checkOutDate));
  const history = bookings.filter(booking => ['checked_out', 'completed', 'cancelled'].includes(booking.status))
    .sort((a, b) => new Date(b.checkOutDate) - new Date(a.checkOutDate));

  const revenueSeries = revenue.map(item => Number(item.totalCollected) || 0);
  const latestRevenue = revenueSeries[revenueSeries.length - 1] ?? 0;
  const previousRevenue = revenueSeries[revenueSeries.length - 2] ?? 0;
  const revenueTrend = previousRevenue > 0 ? Math.round(((latestRevenue - previousRevenue) / previousRevenue) * 100) : undefined;
  const occupancyTrend = forecast.length >= 2 && Number(forecast[0].occupancyRate) > 0
    ? Math.round(((Number(forecast[1].occupancyRate) - Number(forecast[0].occupancyRate)) / Number(forecast[0].occupancyRate)) * 100)
    : undefined;

  return (
    <div className="manager-dashboard">
      <PageHeading eyebrow="MANAGEMENT" title="Operations overview" description={`Property performance and reservations, ${user.name?.split(' ')[0] || 'Manager'}.`} meta={<BranchScopeBadge user={user} />} action={<button className="dash-button-secondary" type="button" onClick={() => load(true)}><RefreshCw size={14} /> Refresh</button>} />
      {error && <ErrorState message={error} onRetry={() => load(true)} />}
      {loading ? <LoadingState label="Loading management overview…" /> : (
        <>
          <div className="dash-metrics" id="overview">
            <Metric label="Occupancy" value={`${data?.occupancyRate ?? 0}%`} note={`${data?.roomSummary?.occupied || 0} occupied rooms`} trend={occupancyTrend} trendLabel="proj." />
            <Metric label="Today's collected" value={money(data?.todayRevenue)} note="Completed and partial payments" trend={revenueTrend} trendLabel="vs prev day" />
            <Metric label="Active stays" value={data?.bookingStats?.activeBookings ?? 0} note={`${data?.bookingStats?.pendingBookings || 0} confirmed arrivals`} />
            <Metric label="Guest rating" value={Number(performance?.feedback?.avgRating || 0).toFixed(1)} note={`${performance?.feedback?.totalReviews || 0} reviews`} />
          </div>
          <div className="dash-grid-2 dash-chart-grid">
            <Panel title="Revenue trend" meta="Daily collected revenue" error={loadErrors.revenue} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body">
                <DashboardChart
                  type="line"
                  theme="manager"
                  labels={revenue.map(item => dateLabel(item._id))}
                  datasets={[{ label: 'Collected', data: revenue.map(item => Number(item.totalCollected) || 0) }]}
                  height={260}
                />
              </div>
            </Panel>
            <Panel title="Occupancy forecast" meta="Projected occupancy · next 14 days" error={loadErrors.forecast} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body">
                <DashboardChart
                  type="line"
                  theme="manager"
                  labels={forecast.slice(0, 14).map(item => dateLabel(item.date))}
                  datasets={[{ label: 'Occupancy %', data: forecast.slice(0, 14).map(item => Number(item.occupancyRate) || 0) }]}
                  height={260}
                />
              </div>
            </Panel>
          </div>
          <Panel id="reports" title="Analytics report filters & exports" meta="Revenue, feedback and reservation reports">
            <form className="dash-panel-body dash-form-row" onSubmit={applyReportRange}>
              <label className="dash-field">From<input required type="date" value={reportRange.startDate} onChange={event => setReportRange(current => ({ ...current, startDate: event.target.value }))} /></label>
              <label className="dash-field">To<input required type="date" value={reportRange.endDate} onChange={event => setReportRange(current => ({ ...current, endDate: event.target.value }))} /></label>
              <button className="dash-button" type="submit">Apply filters</button>
              <button className="dash-button-secondary" type="button" onClick={() => exportReport('revenue')}>Export revenue CSV</button>
              <button className="dash-button-secondary" type="button" onClick={() => exportReport('bookings')}>Export reservations CSV</button>
            </form>
          </Panel>
          <div className="dash-grid-2">
            <div className="dash-stack">
              <Panel id="reservations" title="Upcoming arrivals" meta={`${arrivals.length} planned arrivals`} error={loadErrors.reservations} onRetry={() => load(true)}>
                <BookingTable bookings={arrivals.slice(0, 10)} />
              </Panel>
              <Panel id="departures" title="Upcoming departures" meta={`${departures.length} active departures`} error={loadErrors.reservations} onRetry={() => load(true)}>
                <BookingTable bookings={departures.slice(0, 10)} />
              </Panel>
            </div>
            <div className="dash-stack">
              <Panel id="history" title="Reservation history" meta={`${history.length} completed / cancelled`} error={loadErrors.reservations} onRetry={() => load(true)} lazy>
                <BookingTable bookings={history.slice(0, 10)} />
              </Panel>
              <Panel id="forecast" title="Demand forecast" meta={`${forecast.length} days · based on current reservations`} error={loadErrors.forecast} onRetry={() => load(true)} lazy>
                <Table rows={forecast.slice(0, 14)} empty="No forecast data." columns={[
                  { label: 'Date', render: item => dateLabel(item.date) },
                  { label: 'Booked rooms', key: 'bookedRooms' },
                  { label: 'Occupancy', render: item => `${item.occupancyRate}%` },
                  { label: 'Arrivals / departures', render: item => `${item.arrivals} / ${item.departures}` }
                ]} />
              </Panel>
              <Panel id="popular-rooms" title="Room utilization" meta="Most reserved room types" error={loadErrors.popularity} onRetry={() => load(true)} lazy>
                <Table rows={popularRooms.slice(0, 8)} empty="No room utilization data." columns={[
                  { label: 'Room type', render: item => item.roomTypeName || 'Room type' },
                  { label: 'Reservations', key: 'totalBookings' }
                ]} />
              </Panel>
              <Panel id="activity" title="Recent booking activity" meta={`${bookingActivity.length} latest reservation updates`} error={loadErrors.activity} onRetry={() => load(true)} lazy>
                <Table rows={bookingActivity} empty="No recent booking activity." columns={[
                  { label: 'Reference', render: booking => <strong>{booking.bookingReference}</strong> },
                  { label: 'Guest', render: booking => booking.user?.name || 'Guest' },
                  { label: 'Status', render: booking => <Status value={booking.status} /> },
                  { label: 'Updated', render: booking => dateTimeLabel(booking.updatedAt || booking.createdAt) }
                ]} />
              </Panel>
              <Panel title="Recent guest feedback" meta={`${feedback.length} feedback records`} error={loadErrors.feedback} onRetry={() => load(true)} lazy>
                <Table rows={feedback} empty="No recent guest feedback." columns={[
                  { label: 'Guest', render: item => item.guest?.name || 'Guest' },
                  { label: 'Rating', render: item => `${item.rating} / 5` },
                  { label: 'Feedback', render: item => item.comment || '—' },
                  { label: 'Received', render: item => dateTimeLabel(item.createdAt) }
                ]} />
              </Panel>
          <StaffManagement staff={staff} onChanged={() => load()} />
              <Panel id="operations" title="Housekeeping performance & assignments" meta={`${housekeepingTasks.filter(task => task.status === 'inspected').length} inspected / ${housekeepingTasks.length} tracked tasks`} error={loadErrors.tasks || loadErrors.housekeeping} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Queued / in progress</strong><span>Cleaning workload</span></div><strong>{housekeepingTasks.filter(task => ['queued', 'in_progress', 'cleaned'].includes(task.status)).length}</strong></div>
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Completed</strong><span>Cleaned or inspected in the reporting window</span></div><strong>{housekeepingPerformance.reduce((total, item) => total + item.completedTasks, 0)}</strong></div>
                  {housekeepingPerformance.map(item => {
                    const member = staff.find(person => String(person._id) === String(item._id));
                    return <div className="dash-list-item" key={item._id}><div className="dash-list-main"><strong>{member?.name || 'Housekeeping staff'}</strong><span>{item.inspectedTasks} inspected</span></div><strong>{item.completedTasks} completed</strong></div>;
                  })}
                  {staff.filter(member => member.role === 'housekeeping').map(member => <div className="dash-list-item" key={member._id}><div className="dash-list-main"><strong>{member.name}</strong><span>{housekeepingTasks.filter(task => String(task.assignedTo?._id || task.assignedTo) === String(member._id) && task.status !== 'cancelled').length} assigned tasks</span></div><Status value={member.role} /></div>)}
                </div>
                <form className="dash-panel-body dash-stack" onSubmit={assignHousekeepingTask}>
                  <strong>Assign room preparation</strong>
                  <div className="dash-form-grid">
                    <label className="dash-field">Room<select required value={assignmentForm.roomId} onChange={event => setAssignmentForm({ ...assignmentForm, roomId: event.target.value })}><option value="">Select room</option>{rooms.filter(room => !['occupied', 'maintenance'].includes(room.status) && !housekeepingTasks.some(task => String(task.room?._id || task.room) === String(room.roomId) && !['inspected', 'cancelled'].includes(task.status))).map(room => <option key={room.roomId} value={room.roomId}>Room {room.roomNumber} · {room.isClean ? 'Ready' : 'Needs cleaning'}</option>)}</select></label>
                    <label className="dash-field">Housekeeper<select required value={assignmentForm.assignedTo} onChange={event => setAssignmentForm({ ...assignmentForm, assignedTo: event.target.value })}><option value="">Select staff</option>{staff.filter(member => member.role === 'housekeeping').map(member => <option key={member._id} value={member._id}>{member.name}</option>)}</select></label>
                  </div>
                  <label className="dash-field">Priority<select value={assignmentForm.priority} onChange={event => setAssignmentForm({ ...assignmentForm, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                  <label className="dash-field">Notes<input value={assignmentForm.notes} onChange={event => setAssignmentForm({ ...assignmentForm, notes: event.target.value })} /></label>
                  <button className="dash-button" type="submit" disabled={workingId === 'task-assignment' || !assignmentForm.roomId || !assignmentForm.assignedTo}>{workingId === 'task-assignment' ? 'Assigning…' : 'Assign task'}</button>
                </form>
                <Table rows={housekeepingTasks.slice(0, 10)} empty="No housekeeping tasks." columns={[
                  { label: 'Room', render: task => task.room?.roomNumber || '—' },
                  { label: 'Assigned', render: task => task.assignedTo?.name || 'Unassigned' },
                  { label: 'Status', render: task => <Status value={task.status} /> },
                  { label: 'Priority', render: task => <Status value={task.priority} /> }
                ]} />
              </Panel>
              <Panel id="service-requests" title="Guest service monitoring" meta={`${serviceRequests.filter(request => !['fulfilled', 'cancelled'].includes(request.status)).length} open / ${serviceRequests.length} total`} error={loadErrors.services} onRetry={() => load(true)} lazy>
                <Table rows={serviceRequests} empty="No service requests to monitor." columns={[
                  { label: 'Request', render: request => <strong>{request.requestType?.replaceAll('_', ' ')}</strong> },
                  { label: 'Guest / room', render: request => `${request.requestedBy?.name || 'Guest'} · ${request.room?.roomNumber || '—'}` },
                  { label: 'Details', key: 'description' },
                  { label: 'Assigned to', render: request => {
                    const terminal = ['fulfilled', 'cancelled'].includes(request.status);
                    return <select aria-label={`Assign ${request.requestType} service request`} value={request.assignedTo?._id || ''} disabled={terminal || workingId === request._id} onChange={event => updateServiceRequest(request, { assignedTo: event.target.value })}>
                      <option value="" disabled>{request.assignedTo?.name || 'Unassigned'}</option>
                      {staff.filter(member => member.role === 'housekeeping' && member.accountStatus === 'active').map(member => <option key={member._id} value={member._id}>{member.name}</option>)}
                    </select>;
                  } },
                  { label: 'Status', render: request => <Status value={request.status} /> },
                  { label: 'Workflow', render: request => {
                    const actions = getServiceActions(request.status);
                    return actions.length ? <select className="dash-status-select" aria-label={`Update ${request.requestType} service request`} value="" disabled={workingId === request._id} onChange={event => updateServiceRequest(request, { status: event.target.value })}><option value="">Choose action</option>{actions.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select> : '—';
                  } }
                ]} />
              </Panel>
              <Panel id="maintenance" title="Unresolved maintenance" meta={`${maintenanceIssues.filter(issue => issue.status !== 'resolved').length} open`} error={loadErrors.maintenance} onRetry={() => load(true)} lazy>
                <Table rows={maintenanceIssues} empty="No maintenance issues." columns={[
                  { label: 'Room / issue', render: issue => <><strong>Room {issue.room?.roomNumber || '—'} · {issue.category}</strong><br />{issue.issueDescription}</> },
                  { label: 'Priority', render: issue => <Status value={issue.priority} /> },
                  { label: 'Assigned', render: issue => issue.assignedStaff?.name || 'Unassigned' },
                  { label: 'Status', render: issue => <Status value={issue.status} /> },
                  { label: 'Assign / update', render: issue => {
                    const nextStatus = issue.status === 'assigned' ? 'in_progress' : issue.status === 'in_progress' ? 'resolved' : '';
                    return <div className="dash-toolbar">
                      <select aria-label={`Assign maintenance for room ${issue.room?.roomNumber || ''}`} value={issue.assignedStaff?._id || ''} disabled={issue.status === 'resolved' || workingId === issue._id} onChange={event => updateMaintenanceIssue(issue, { assignedTo: event.target.value })}>
                        <option value="" disabled>{issue.assignedStaff ? issue.assignedStaff.name : 'Unassigned'}</option>
                        {staff.filter(member => member.role === 'housekeeping' && member.accountStatus === 'active').map(member => <option key={member._id} value={member._id}>{member.name}</option>)}
                      </select>
                      {nextStatus && <button className="dash-button-secondary" type="button" disabled={workingId === issue._id} onClick={() => updateMaintenanceIssue(issue, { status: nextStatus })}>{nextStatus === 'resolved' ? 'Mark resolved' : 'Start work'}</button>}
                    </div>;
                  } }
                ]} />
              </Panel>
              <Panel id="room-summary" title="Room status" meta="Live inventory" error={loadErrors.kpis} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">
                  {Object.entries(data?.roomSummary || {}).filter(([key]) => key !== 'total').map(([status, count]) => <div className="dash-list-item" key={status}><div className="dash-list-main"><strong>{titleCase(status)}</strong><span>Room inventory</span></div><strong>{count}</strong></div>)}
                  {!data?.roomSummary && <EmptyState>Room inventory unavailable.</EmptyState>}
                </div>
              </Panel>
              <Panel id="readiness" title="Room readiness" meta={`${rooms.filter(room => room.isClean && room.status === 'available').length} ready / ${rooms.length} rooms`} error={loadErrors.rooms} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">{rooms.slice(0, 10).map(room => <div className="dash-list-item" key={room.roomId}><div className="dash-list-main"><strong>Room {room.roomNumber}</strong><span>{room.type} · {room.isClean ? 'Clean' : 'Needs cleaning'}</span></div><Status value={room.status} /></div>)}{rooms.length === 0 && <EmptyState>Room readiness is unavailable.</EmptyState>}</div>
              </Panel>
              <Panel id="feedback" title="Operations & feedback" meta="Current service signals" error={loadErrors.performance} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Guest feedback</strong><span>Average rating</span></div><strong>{Number(performance?.feedback?.avgRating || 0).toFixed(1)} / 5</strong></div>
                  {(performance?.maintenanceBreakdown || []).map(item => <div className="dash-list-item" key={item._id}><div className="dash-list-main"><strong>{titleCase(item._id)} maintenance</strong><span>Open work items</span></div><strong>{item.count}</strong></div>)}
                </div>
              </Panel>
              <Panel id="pricing-insights" title="Dynamic pricing insight" meta="Authorized pricing preview" lazy>
                <div className="dash-panel-body dash-stack">
                  <label className="dash-field">Room type<select value={pricingRoomTypeId} onChange={event => setPricingRoomTypeId(event.target.value)}>{roomTypes.map(type => <option key={type._id} value={type._id}>{type.title}</option>)}</select></label>
                  <button className="dash-button-secondary" type="button" disabled={workingId === 'pricing' || !pricingRoomTypeId} onClick={calculatePricingInsight}>{workingId === 'pricing' ? 'Calculating…' : 'Calculate pricing insight'}</button>
                  {pricingInsight && <div className="dash-note">Base {money(pricingInsight.basePrice)} · Occupancy {pricingInsight.occupancyPercentage}% · Multiplier {pricingInsight.appliedMultiplier} · Suggested {money(pricingInsight.finalPrice)}</div>}
                </div>
              </Panel>
              <RoomManagement />
              <AIManagementTools feedback={feedback} />
              <Panel title="Collected by day" meta="Recent payment events" error={loadErrors.revenue} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">
                  {revenue.slice(-5).map(item => <div className="dash-list-item" key={item._id}><div className="dash-list-main"><strong>{dateLabel(item._id)}</strong><span>{item.transactionCount} payments</span></div><strong>{money(item.totalCollected)}</strong></div>)}
                  {!revenue.length && <EmptyState>No completed payments in this period.</EmptyState>}
                </div>
              </Panel>
              <BillingWorkflow title="Billing & outstanding balances" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
