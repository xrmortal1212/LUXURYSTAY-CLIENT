import { startTransition, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, getApiErrorMessage } from '../../../Config/api';
import { EmptyState, ErrorState, LoadingState, Metric, PageHeading, Panel, Status } from '../DashboardParts';
import DashboardChart from '../DashboardCharts';
import { localDayBounds } from '../DashboardUtils';
import { getServiceActions, getUserId } from '../OperationsUtils';
import PermissionTools from '../PermissionTools';
import BranchScopeBadge from '../BranchScopeBadge';

const HousekeepingDashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [performance, setPerformance] = useState({ totalCompleted: 0 });
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', category: 'general', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState({});

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    const taskBounds = localDayBounds();
    const rangeEnd = new Date();
    rangeEnd.setHours(0, 0, 0, 0);
    rangeEnd.setDate(rangeEnd.getDate() + 14);
    const [tasksResult, maintenanceResult, serviceResult, roomsResult, performanceResult] = await Promise.allSettled([
      api.get('/housekeeping/tasks', { params: { limit: 100 } }),
      api.get('/maintenance'),
      api.get('/services'),
      api.get('/rooms/calendar', { params: { startDate: taskBounds.startDate, endDate: rangeEnd.toISOString() } }),
      api.get('/housekeeping/performance', { params: taskBounds })
    ]);
    if (tasksResult.status === 'fulfilled') setTasks(tasksResult.value.data.tasks || []);
    if (maintenanceResult.status === 'fulfilled') setMaintenance(maintenanceResult.value.data.issues || []);
    if (serviceResult.status === 'fulfilled') setServiceRequests(serviceResult.value.data.requests || []);
    if (performanceResult.status === 'fulfilled') setPerformance(performanceResult.value.data);
    if (roomsResult.status === 'fulfilled') {
      const calendar = roomsResult.value.data.calendar || [];
      setRooms(calendar);
      setMaintenanceForm(current => ({ ...current, roomId: current.roomId || calendar[0]?.roomId || '' }));
    }
    const panelFailures = [
      ['tasks', tasksResult, 'Cleaning tasks could not be loaded.'],
      ['maintenance', maintenanceResult, 'Maintenance reports could not be loaded.'],
      ['services', serviceResult, 'Guest services could not be loaded.'],
      ['rooms', roomsResult, 'Room readiness could not be loaded.'],
      ['performance', performanceResult, 'Housekeeping performance could not be loaded.']
    ];
    const nextErrors = {};
    panelFailures.forEach(([key, result, message]) => {
      if (result.status === 'rejected') nextErrors[key] = getApiErrorMessage(result.reason, message);
    });
    setLoadErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);

  const advanceTask = async (task, action) => {
    setWorkingId(task._id);
    setError('');
    try {
      await api.patch(`/housekeeping/tasks/${task._id}/status`, { action });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Task could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };

  const reportMaintenance = async event => {
    event.preventDefault();
    setWorkingId('maintenance');
    setError('');
    try {
      await api.post('/maintenance/report', maintenanceForm);
      setMaintenanceForm(current => ({ ...current, description: '' }));
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Maintenance report could not be submitted.'));
    } finally {
      setWorkingId('');
    }
  };

  const setMaintenanceStatus = async (issue, status) => {
    setWorkingId(issue._id);
    setError('');
    try {
      await api.patch(`/maintenance/${issue._id}/status`, { status });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Maintenance status could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };

  const updateServiceRequest = async (request, status) => {
    setWorkingId(request._id);
    setError('');
    try {
      await api.patch(`/services/${request._id}/status`, { status });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Service request could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };

  const scheduleReservationCleaning = async reservation => {
    const roomId = reservation.room.roomId;
    if (workingId || !roomId) return;
    setWorkingId(roomId);
    setError('');
    try {
      await api.post('/housekeeping/assign', {
        roomId,
        priority: 'high',
        notes: `Prepare for reservation ${reservation.reference}, arriving ${new Date(reservation.checkInDate).toLocaleDateString()}.`
      });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Preparation cleaning could not be scheduled.'));
    } finally {
      setWorkingId('');
    }
  };

  const taskAction = task => {
    if (task.status === 'queued') return ['start', task.assignedTo ? 'Start' : 'Accept & start'];
    if (task.status === 'in_progress') return ['complete', 'Mark cleaned'];
    if (task.status === 'cleaned') return ['inspect_and_approve', 'Approve room'];
    return null;
  };
  const currentUserId = getUserId(user);
  const visibleMaintenance = maintenance.filter(issue =>
    String(issue.assignedStaff?._id || issue.assignedStaff) === String(currentUserId));
  const maintenanceHistory = visibleMaintenance.filter(issue => issue.status === 'resolved');
  const upcomingReservations = rooms.flatMap(room => (room.reservations || [])
    .filter(reservation => ['confirmed', 'pending'].includes(reservation.status) && new Date(reservation.checkInDate) > new Date())
    .map(reservation => ({ ...reservation, room })))
    .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));

  return (
    <div className="housekeeping-dashboard">
      <PageHeading eyebrow="HOUSEKEEPING" title="Room readiness" description={`Cleaning queue and maintenance handoffs, ${user.name?.split(' ')[0] || 'Team'}.`} meta={<BranchScopeBadge user={user} />} action={<button className="dash-button-secondary" type="button" onClick={() => load(true)}><RefreshCw size={14} /> Refresh</button>} />
      {error && <ErrorState message={error} onRetry={() => load(true)} />}
      <div className="dash-metrics">
        <Metric label="Queued" value={tasks.filter(task => task.status === 'queued').length} note="Ready to start" />
        <Metric label="In progress" value={tasks.filter(task => task.status === 'in_progress').length} note="Being cleaned" />
        <Metric label="Awaiting inspection" value={tasks.filter(task => task.status === 'cleaned').length} note="Staff approval needed" />
        <Metric label="Completed today" value={performance.totalCompleted || 0} note="Cleaning tasks completed" />
        <Metric label="Ready rooms" value={rooms.filter(room => room.status === 'available' && room.isClean).length} note="Available for occupancy" />
        <Metric label="Rooms under maintenance" value={rooms.filter(room => room.status === 'maintenance').length} note="Not assignable" />
        <Metric label="Open maintenance" value={visibleMaintenance.filter(issue => issue.status !== 'resolved').length} note="Assigned reports" />
      </div>
      <PermissionTools user={user} />
      {!loading && <div className="dash-grid-2 dash-chart-grid">
        <Panel title="Cleaning task progress" meta="Current task states" lazy>
          <div className="dash-panel-body">
            <DashboardChart
              type="bar"
              theme="housekeeping"
              labels={['Queued', 'In progress', 'Awaiting inspection', 'Completed']}
              datasets={[{ label: 'Tasks', data: [
                tasks.filter(task => task.status === 'queued').length,
                tasks.filter(task => task.status === 'in_progress').length,
                tasks.filter(task => task.status === 'cleaned').length,
                tasks.filter(task => task.status === 'inspected').length
              ] }]}
              height={260}
            />
          </div>
        </Panel>
        <Panel title="Room readiness breakdown" meta="Current room states" lazy>
          <div className="dash-panel-body">
            <DashboardChart
              type="doughnut"
              theme="housekeeping"
              labels={['Ready', 'Needs cleaning', 'Occupied', 'Maintenance']}
              datasets={[{ label: 'Rooms', data: [
                rooms.filter(room => room.status === 'available' && room.isClean).length,
                rooms.filter(room => room.status === 'available' && !room.isClean).length,
                rooms.filter(room => room.status === 'occupied').length,
                rooms.filter(room => room.status === 'maintenance').length
              ] }]}
              height={260}
            />
          </div>
        </Panel>
      </div>}
      {loading ? <LoadingState label="Loading work queue…" /> : (
        <div className="dash-grid-2">
          <Panel id="queue" title="Checkout & room cleaning queue" meta={`${tasks.length} assigned / queued tasks`} error={loadErrors.tasks} onRetry={() => load(true)}>
            <div className="dash-table-wrap">{tasks.length === 0 ? <EmptyState>No cleaning tasks assigned or waiting.</EmptyState> : <table className="dash-table"><thead><tr><th>Room</th><th>Priority</th><th>Assigned to</th><th>Status</th><th>Task</th></tr></thead><tbody>{tasks.map(task => { const action = taskAction(task); return <tr key={task._id}><td><strong>{task.room?.roomNumber || 'Room'}</strong><br />{task.room?.status}</td><td><Status value={task.priority} /></td><td>{task.assignedTo?.name || 'Unassigned'}</td><td><Status value={task.status} /></td><td>{action && <button className="dash-button" type="button" disabled={workingId === task._id} onClick={() => advanceTask(task, action[0])}>{workingId === task._id ? 'Saving…' : action[1]}</button>}</td></tr>; })}</tbody></table>}</div>
          </Panel>
          <div className="dash-stack">
            <Panel id="upcoming-readiness" title="Upcoming reservation readiness" meta="Next 14 days" error={loadErrors.rooms} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body dash-list">
                {upcomingReservations.map(reservation => {
                  const hasActiveTask = tasks.some(task =>
                    String(task.room?._id || task.room) === String(reservation.room.roomId)
                    && !['inspected', 'cancelled'].includes(task.status));
                  const canSchedule = !reservation.room.isClean
                    && !['occupied', 'maintenance'].includes(reservation.room.status)
                    && !hasActiveTask;
                  return <div className="dash-list-item" key={`${reservation.bookingId}-${reservation.room.roomId}`}>
                    <div className="dash-list-main">
                      <strong>Room {reservation.room.roomNumber} · {reservation.reference}</strong>
                      <span>{reservation.guestName || 'Guest'} · Arrives {new Date(reservation.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="dash-toolbar">
                      <Status value={reservation.room.isClean ? 'ready' : hasActiveTask ? 'cleaning' : 'needs_cleaning'} />
                      {canSchedule && <button className="dash-button-secondary" type="button" disabled={workingId === reservation.room.roomId} onClick={() => scheduleReservationCleaning(reservation)}>{workingId === reservation.room.roomId ? 'Scheduling…' : 'Schedule cleaning'}</button>}
                    </div>
                  </div>;
                })}
                {upcomingReservations.length === 0 && <EmptyState>No upcoming room assignments in the next 14 days.</EmptyState>}
              </div>
            </Panel>
            <Panel id="readiness" title="Room readiness" meta="Current task states" error={loadErrors.tasks} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body dash-list">{tasks.slice(0, 8).map(task => <div className="dash-list-item" key={task._id}><div className="dash-list-main"><strong>Room {task.room?.roomNumber || '—'}</strong><span>{task.status === 'cleaned' ? 'Inspection required' : task.status === 'inspected' ? 'Ready for allocation' : 'Cleaning workflow'}</span></div><Status value={task.status} /></div>)}{tasks.length === 0 && <EmptyState>No active room tasks.</EmptyState>}</div>
            </Panel>
            <Panel id="task-history" title="Completed cleaning history" meta={`${tasks.filter(task => task.status === 'inspected').length} inspected tasks`} lazy>
              <div className="dash-panel-body dash-list">{tasks.filter(task => task.status === 'inspected').slice(0, 10).map(task => <div className="dash-list-item" key={task._id}>
                <div className="dash-list-main"><strong>Room {task.room?.roomNumber || '—'}</strong><span>Completed {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '—'}</span></div>
                <Status value={task.status} />
              </div>)}{tasks.every(task => task.status !== 'inspected') && <EmptyState>No completed cleaning tasks in the current task list.</EmptyState>}</div>
            </Panel>
            <Panel id="maintenance" title="Assigned maintenance workflow" meta={`${visibleMaintenance.filter(issue => issue.status !== 'resolved').length} unresolved reports`} error={loadErrors.maintenance} onRetry={() => load(true)} lazy>
              <form className="dash-panel-body dash-stack" onSubmit={reportMaintenance}>
                <div className="dash-form-grid">
                  <label className="dash-field">Room<select required value={maintenanceForm.roomId} onChange={event => setMaintenanceForm({ ...maintenanceForm, roomId: event.target.value })}>{rooms.map(room => <option key={room.roomId} value={room.roomId}>Room {room.roomNumber} · {room.type}</option>)}</select></label>
                  <label className="dash-field">Priority<select value={maintenanceForm.priority} onChange={event => setMaintenanceForm({ ...maintenanceForm, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
                </div>
                <label className="dash-field">Issue details<textarea required maxLength="500" value={maintenanceForm.description} onChange={event => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} /></label>
                <button className="dash-button-secondary" type="submit" disabled={workingId === 'maintenance' || !maintenanceForm.roomId}>{workingId === 'maintenance' ? 'Submitting…' : 'Report issue'}</button>
              </form>
              <div className="dash-panel-body dash-list">{visibleMaintenance.slice(0, 8).map(issue => {
                const nextStatus = issue.status === 'assigned' ? 'in_progress' : issue.status === 'in_progress' ? 'resolved' : '';
                return <div className="dash-list-item" key={issue._id}>
                  <div className="dash-list-main"><strong>Room {issue.room?.roomNumber || '—'} · {issue.category}</strong><span>{issue.issueDescription}</span></div>
                  <div className="dash-toolbar"><Status value={issue.status} />{nextStatus && <button className="dash-button-secondary" type="button" onClick={() => setMaintenanceStatus(issue, nextStatus)} disabled={workingId === issue._id}>{nextStatus === 'resolved' ? 'Mark resolved' : 'Start work'}</button>}</div>
                </div>;
              })}{visibleMaintenance.length === 0 && <EmptyState>No maintenance issues assigned or waiting.</EmptyState>}</div>
            </Panel>
            <Panel id="service-requests" title="Assigned guest services" meta={`${serviceRequests.filter(request => !['fulfilled', 'cancelled'].includes(request.status)).length} open requests`} error={loadErrors.services} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body dash-list">{serviceRequests.slice(0, 10).map(request => {
                const actions = getServiceActions(request.status);
                return <div className="dash-list-item" key={request._id}>
                  <div className="dash-list-main"><strong>{request.requestType?.replaceAll('_', ' ')} · Room {request.room?.roomNumber || '—'}</strong><span>{request.description}</span></div>
                  <div className="dash-toolbar"><Status value={request.status} />{actions.length > 0 && <select className="dash-status-select" aria-label={`Update ${request.requestType} request`} value="" disabled={workingId === request._id} onChange={event => updateServiceRequest(request, event.target.value)}><option value="">Update</option>{actions.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select>}</div>
                </div>;
              })}{serviceRequests.length === 0 && <EmptyState>No guest service requests assigned.</EmptyState>}</div>
            </Panel>
            <Panel id="maintenance-history" title="Resolved maintenance history" meta={`${maintenanceHistory.length} completed`} lazy>
              <div className="dash-panel-body dash-list">{maintenanceHistory.slice(0, 10).map(issue => <div className="dash-list-item" key={issue._id}>
                <div className="dash-list-main"><strong>Room {issue.room?.roomNumber || '—'} · {issue.category}</strong><span>{issue.resolutionNotes || issue.issueDescription}</span></div>
                <Status value={issue.status} />
              </div>)}{maintenanceHistory.length === 0 && <EmptyState>No completed maintenance assigned to you.</EmptyState>}</div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingDashboard;
