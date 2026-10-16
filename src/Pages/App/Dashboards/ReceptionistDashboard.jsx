import { startTransition, useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { api, getApiErrorMessage } from '../../../Config/api';
import { BookingTable, EmptyState, ErrorState, LoadingState, Metric, PageHeading, Panel, Status, Table } from '../DashboardParts';
import { dateTimeLabel, downloadBlob, localDayBounds, money } from '../DashboardUtils';
import DashboardChart from '../DashboardCharts';
import ReservationTools from '../ReservationTools';
import BillingWorkflow from '../BillingWorkflow';
import PermissionTools from '../PermissionTools';
import BranchScopeBadge from '../BranchScopeBadge';
import { SERVICE_TYPES, getServiceActions } from '../OperationsUtils';

const ReceptionistDashboard = ({ user }) => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);
  const [housekeepers, setHousekeepers] = useState([]);
  const [serviceForm, setServiceForm] = useState({ bookingId: '', serviceType: 'room_service', description: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', bookingId: '', category: 'general', description: '', priority: 'medium' });
  const [guestSearch, setGuestSearch] = useState('');
  const [guests, setGuests] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [availability, setAvailability] = useState(null);
  const [searchDates, setSearchDates] = useState({ checkInDate: '', checkOutDate: '', guests: 1 });
  const [bookingEdits, setBookingEdits] = useState({});
  const [verified, setVerified] = useState({});
  const [workingId, setWorkingId] = useState('');
  const [stayMessage, setStayMessage] = useState('');
  const [keyRecord, setKeyRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState({});

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    const bounds = localDayBounds();
    const [arrivalResult, departureResult, roomResult, serviceResult, maintenanceResult, staffResult] = await Promise.allSettled([
      api.get('/bookings', { params: { checkInFrom: bounds.startDate, checkInTo: bounds.endDate, limit: 100 } }),
      api.get('/bookings', { params: { checkOutFrom: bounds.startDate, checkOutTo: bounds.endDate, limit: 100 } }),
      api.get('/rooms/calendar', { params: bounds }),
      api.get('/services'),
      api.get('/maintenance'),
      api.get('/users/staff', { params: { status: 'active' } })
    ]);
    if (arrivalResult.status === 'fulfilled') setArrivals((arrivalResult.value.data.bookings || []).filter(booking => ['confirmed', 'pending'].includes(booking.status)));
    if (departureResult.status === 'fulfilled') setDepartures((departureResult.value.data.bookings || []).filter(booking => booking.status === 'checked_in'));
    if (roomResult.status === 'fulfilled') setRooms(roomResult.value.data.calendar || []);
    if (serviceResult.status === 'fulfilled') setServiceRequests(serviceResult.value.data.requests || []);
    if (maintenanceResult.status === 'fulfilled') setMaintenanceIssues(maintenanceResult.value.data.issues || []);
    if (staffResult.status === 'fulfilled') setHousekeepers((staffResult.value.data.staff || []).filter(member => member.role === 'housekeeping' && member.accountStatus === 'active'));
    const panelFailures = [
      ['arrivals', arrivalResult, 'Arrivals could not be loaded.'],
      ['departures', departureResult, 'Departures could not be loaded.'],
      ['rooms', roomResult, 'Room calendar could not be loaded.'],
      ['services', serviceResult, 'Service requests could not be loaded.'],
      ['maintenance', maintenanceResult, 'Maintenance requests could not be loaded.'],
      ['housekeepers', staffResult, 'Housekeeping staff could not be loaded.']
    ];
    const nextErrors = {};
    panelFailures.forEach(([key, result, message]) => {
      if (result.status === 'rejected') nextErrors[key] = getApiErrorMessage(result.reason, message);
    });
    setLoadErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);
  useEffect(() => {
    const openToolsForAnchor = () => {
      const targetId = window.location.hash.slice(1);
      const section = document.getElementById(targetId)?.closest('.receptionist-tool-section');
      if (section instanceof HTMLDetailsElement) section.open = true;
    };
    openToolsForAnchor();
    window.addEventListener('hashchange', openToolsForAnchor);
    return () => window.removeEventListener('hashchange', openToolsForAnchor);
  }, []);

  const findGuests = async event => {
    event.preventDefault();
    try {
      const { data } = await api.get('/users/guests', { params: { search: guestSearch, limit: 10 } });
      setGuests(data.guests || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Guest search failed.'));
    }
  };

  const searchRooms = async event => {
    event.preventDefault();
    try {
      const { data } = await api.get('/rooms/search', { params: searchDates });
      setAvailability(data.data || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room availability could not be checked.'));
    }
  };

  const exportReservations = async () => {
    setError('');
    try {
      const bounds = localDayBounds();
      const { data } = await api.get('/reports/bookings/csv', {
        params: { startDate: bounds.startDate, endDate: bounds.endDate },
        responseType: 'blob'
      });
      downloadBlob(data, `reservations-${bounds.startDate.slice(0, 10)}.csv`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Reservation report could not be downloaded.'));
    }
  };

  const updateStay = async (booking, action) => {
    setWorkingId(booking._id);
    setError('');
    setStayMessage('');
    try {
      if (action === 'check-in') {
        const { data } = await api.post(`/bookings/${booking._id}/check-in`, { identityVerified: true });
        setKeyRecord({
          bookingReference: booking.bookingReference,
          roomNumber: data.roomNumber || booking.room?.roomNumber || 'Assigned',
          keyIssued: Boolean(data.keyIssuedAt || data.booking?.keyIssuedAt),
          keyIssuedAt: data.keyIssuedAt || data.booking?.keyIssuedAt
        });
        setStayMessage(`Check-in completed for ${booking.bookingReference}. Room ${data.roomNumber || booking.room?.roomNumber || 'assignment confirmed'}; key handoff ${data.keyIssuedAt ? 'recorded by server' : 'not reported'}.`);
      } else {
        const { data } = await api.post(`/bookings/${booking._id}/check-out`);
        setStayMessage(data.message || `Check-out completed for ${booking.bookingReference}.`);
      }
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, `Could not ${action} this guest.`));
    } finally {
      setWorkingId('');
    }
  };

  const confirmReservation = async booking => {
    setWorkingId(booking._id);
    setError('');
    try {
      await api.patch(`/bookings/${booking._id}/confirm`, {});
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Reservation could not be confirmed.'));
    } finally {
      setWorkingId('');
    }
  };

  const createServiceRequest = async event => {
    event.preventDefault();
    setWorkingId('service-create');
    setError('');
    try {
      await api.post('/services/request', serviceForm);
      setServiceForm(current => ({ ...current, description: '' }));
      setStayMessage('Service request created and added to the operations queue.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Service request could not be created.'));
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

  const createMaintenanceIssue = async event => {
    event.preventDefault();
    setWorkingId('maintenance-create');
    setError('');
    try {
      await api.post('/maintenance/report', maintenanceForm);
      setMaintenanceForm(current => ({ ...current, description: '' }));
      setStayMessage('Maintenance issue reported and added to the operations queue.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Maintenance issue could not be reported.'));
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
      setError(getApiErrorMessage(requestError, 'Maintenance issue could not be updated.'));
    } finally {
      setWorkingId('');
    }
  };

  const saveBookingEdit = async booking => {
    const edit = bookingEdits[booking._id];
    if (!edit || workingId) return;
    setWorkingId(booking._id);
    setError('');
    try {
      await api.put(`/bookings/${booking._id}`, edit);
      setBookingEdits(current => { const next = { ...current }; delete next[booking._id]; return next; });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Reservation changes could not be saved.'));
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="receptionist-dashboard">
      <PageHeading eyebrow="FRONT DESK" title={`Welcome, ${user.name?.split(' ')[0] || 'Team'}`} description="Arrivals, departures and room readiness for today." meta={<BranchScopeBadge user={user} />} action={<div className="dash-toolbar"><button className="dash-button-secondary" type="button" onClick={exportReservations}>Reservation report</button><button className="dash-button-secondary" type="button" onClick={() => load(true)}><RefreshCw size={14} /> Refresh</button></div>} />
      {error && <ErrorState message={error} onRetry={() => load(true)} />}
      {stayMessage && <div className="dash-note" role="status">{stayMessage}</div>}
      {keyRecord && <Panel title="Latest room & key record" meta={keyRecord.bookingReference}><div className="dash-panel-body">Room {keyRecord.roomNumber} · Key handoff {keyRecord.keyIssued ? `recorded at ${new Date(keyRecord.keyIssuedAt).toLocaleString()}` : 'not reported by the check-in service'}. No physical key identifier is configured.</div></Panel>}
      <div className="dash-metrics" id="overview">
        <Metric label="Today's arrivals" value={arrivals.length} note="Confirmed check-ins" />
        <Metric label="Today's departures" value={departures.length} note="Guests currently checked in" />
        <Metric label="Occupied rooms" value={rooms.filter(room => room.status === 'occupied').length} note="Current occupancy" />
        <Metric label="Available rooms" value={rooms.filter(room => room.status === 'available' && room.isClean).length} note="Ready to assign" />
        <Metric label="Pending arrivals" value={arrivals.filter(booking => booking.status === 'pending').length} note="Awaiting confirmation today" />
        <Metric label="Rooms in service" value={rooms.filter(room => ['cleaning', 'maintenance'].includes(room.status)).length} note="Cleaning or maintenance" />
      </div>
      <PermissionTools user={user} exclude={['reservations']} />
      {loading ? <LoadingState label="Loading front-desk queue…" /> : (
        <div className="dash-grid-2">
          <div className="dash-stack">
            <Panel id="arrivals" title="Today's arrivals" meta={`${arrivals.length} expected`} error={loadErrors.arrivals} onRetry={() => load(true)}>
              <div className="dash-table-wrap">
                {arrivals.length === 0 ? <EmptyState>No arrivals scheduled today.</EmptyState> : <table className="dash-table"><thead><tr><th>Booking</th><th>Guest / room</th><th>Verification</th><th>Action</th></tr></thead><tbody>{arrivals.map(booking => {
                  const edit = bookingEdits[booking._id];
                  return <tr key={booking._id}><td><strong>{booking.bookingReference}</strong><br />{dateTimeLabel(booking.checkInDate)}
                    {booking.status === 'confirmed' && <details className="dash-booking-edit"><summary>Modify dates / room</summary><div className="dash-booking-edit-fields">
                      <label className="dash-field">Check-in<input type="date" value={edit?.checkInDate || String(booking.checkInDate).slice(0, 10)} onChange={event => setBookingEdits(current => ({ ...current, [booking._id]: { ...edit, checkInDate: event.target.value } }))} /></label>
                      <label className="dash-field">Check-out<input type="date" value={edit?.checkOutDate || String(booking.checkOutDate).slice(0, 10)} onChange={event => setBookingEdits(current => ({ ...current, [booking._id]: { ...edit, checkOutDate: event.target.value } }))} /></label>
                      <label className="dash-field">Reassign to ready room<select value={edit?.roomId || ''} onChange={event => setBookingEdits(current => ({ ...current, [booking._id]: { ...edit, roomId: event.target.value } }))}><option value="">Keep assigned room</option>{rooms.filter(room => room.isClean && room.status === 'available').map(room => <option key={room.roomId} value={room.roomId}>Room {room.roomNumber} · {room.type}</option>)}</select></label>
                      <button className="dash-button-secondary" type="button" disabled={workingId === booking._id} onClick={() => saveBookingEdit(booking)}>{workingId === booking._id ? 'Saving…' : 'Save changes'}</button>
                    </div></details>}
                  </td><td>{booking.user?.name || 'Guest'}<br />Room {booking.room?.roomNumber || 'pending'}</td><td><label><input type="checkbox" checked={Boolean(verified[booking._id])} onChange={event => setVerified({ ...verified, [booking._id]: event.target.checked })} /> ID checked</label></td><td>{booking.status === 'pending'
                    ? <button className="dash-button" type="button" disabled={workingId === booking._id} onClick={() => confirmReservation(booking)}>{workingId === booking._id ? 'Working…' : 'Confirm booking'}</button>
                    : <button className="dash-button" type="button" disabled={!verified[booking._id] || workingId === booking._id} onClick={() => updateStay(booking, 'check-in')}>{workingId === booking._id ? 'Working…' : 'Check in'}</button>}</td></tr>;
                })}</tbody></table>}
              </div>
            </Panel>
            <Panel id="departures" title="Today's departures" meta={`${departures.length} due out`} error={loadErrors.departures} onRetry={() => load(true)}>
              <BookingTable bookings={departures} actions={booking => <button className="dash-button-secondary" type="button" disabled={workingId === booking._id} onClick={() => updateStay(booking, 'check-out')}>{workingId === booking._id ? 'Working…' : 'Check out'}</button>} />
            </Panel>
            <div className="dash-grid-2 dash-chart-grid">
              <Panel title="Arrival queue" meta="Bookings requiring front-desk handling" error={loadErrors.arrivals} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body">
                  <DashboardChart
                    type="doughnut"
                    theme="receptionist"
                    labels={['Awaiting confirmation', 'Confirmed']}
                    datasets={[{ label: 'Arrivals', data: [
                      arrivals.filter(booking => booking.status === 'pending').length,
                      arrivals.filter(booking => booking.status === 'confirmed').length
                    ] }]}
                    height={250}
                  />
                </div>
              </Panel>
              <Panel title="Room status" meta="Today's room calendar" error={loadErrors.rooms} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body">
                  <DashboardChart
                    type="doughnut"
                    theme="receptionist"
                    labels={['Occupied', 'Ready', 'Needs cleaning', 'Cleaning', 'Maintenance']}
                    datasets={[{ label: 'Rooms', data: [
                      rooms.filter(room => room.status === 'occupied').length,
                      rooms.filter(room => room.status === 'available' && room.isClean).length,
                      rooms.filter(room => room.status === 'available' && !room.isClean).length,
                      rooms.filter(room => room.status === 'cleaning').length,
                      rooms.filter(room => room.status === 'maintenance').length
                    ] }]}
                    height={250}
                  />
                </div>
              </Panel>
            </div>
          </div>
          <div className="dash-stack">
            <details className="receptionist-tool-section" id="receptionist-reservations">
              <summary><span><strong>Guest & reservation tools</strong><small>Find guests, check availability and create reservations</small></span></summary>
              <div className="receptionist-tool-content dash-stack">
                <Panel id="guest-search" title="Find a guest" meta="Search active guest profiles">
              <form className="dash-inline-form" onSubmit={findGuests}><input minLength="2" required value={guestSearch} onChange={event => setGuestSearch(event.target.value)} placeholder="Name, email or phone" aria-label="Search guests" /><button className="dash-button" type="submit"><Search size={14} /> Find</button></form>
              {guests.length > 0 && <div className="dash-panel-body dash-list">{guests.map(guest => <div className="dash-list-item" key={guest._id}><div className="dash-list-main"><strong>{guest.name}</strong><span>{guest.email} · {guest.phone}</span></div><button className="dash-button-secondary" type="button" aria-pressed={selectedGuestId === guest._id} onClick={() => { setSelectedGuestId(guest._id); setGuestSearch(guest.email); }}>{selectedGuestId === guest._id ? 'Selected' : 'Use guest'}</button></div>)}</div>}
              {guests.length === 0 && <EmptyState>Search to find a guest profile.</EmptyState>}
            </Panel>
                <Panel id="room-search" title="Room availability" meta="Check a date range">
                  <form className="dash-panel-body dash-form-row" onSubmit={searchRooms}>
                    <label className="dash-field">Check-in<input required type="date" value={searchDates.checkInDate} onChange={event => setSearchDates({ ...searchDates, checkInDate: event.target.value })} /></label>
                    <label className="dash-field">Check-out<input required type="date" value={searchDates.checkOutDate} onChange={event => setSearchDates({ ...searchDates, checkOutDate: event.target.value })} /></label>
                    <label className="dash-field">Guests<input min="1" required type="number" value={searchDates.guests} onChange={event => setSearchDates({ ...searchDates, guests: event.target.value })} /></label>
                    <button className="dash-button" type="submit"><Search size={14} /> Search</button>
                  </form>
                  {availability && <div className="dash-panel-body dash-list">{availability.length ? availability.map(result => <div className="dash-list-item" key={result.roomType._id}><div className="dash-list-main"><strong>{result.roomType.title}</strong><span>{money(result.roomType.basePrice)} per night</span></div><Status value={`${result.availableCount} available`} /></div>) : <EmptyState>No rooms available for those dates.</EmptyState>}</div>}
                </Panel>
                <Panel id="new-booking" title="Create reservation" meta={selectedGuestId ? 'Guest selected' : 'Select a guest to book on their behalf'}>
                  {selectedGuestId ? <ReservationTools guestUserId={selectedGuestId} canAssignRoom onCreated={() => { void load(); }} /> : <EmptyState>Choose a guest profile before starting a reservation.</EmptyState>}
                </Panel>
              </div>
            </details>
            <details className="receptionist-tool-section" id="receptionist-room-billing">
              <summary><span><strong>Room readiness & billing</strong><small>Check room status and manage guest balances</small></span></summary>
              <div className="receptionist-tool-content dash-stack">
            <Panel title="Room readiness" meta="Today's room calendar" error={loadErrors.rooms} onRetry={() => load(true)} lazy>
              <div className="dash-panel-body dash-list">{rooms.length ? rooms.slice(0, 8).map(room => <div className="dash-list-item" key={room.roomId}><div className="dash-list-main"><strong>Room {room.roomNumber}</strong><span>{room.type} · {room.isClean ? 'Clean' : 'Needs cleaning'}</span></div><Status value={room.status} /></div>) : <EmptyState>Room calendar unavailable.</EmptyState>}</div>
            </Panel>
            <BillingWorkflow title="Bills, room/service charges & balances" allowEmail allowPaymentRecording allowCharges />
              </div>
            </details>
            <details className="receptionist-tool-section" id="receptionist-operations">
              <summary><span><strong>Service & maintenance</strong><small>Track guest requests and report room issues</small></span></summary>
              <div className="receptionist-tool-content dash-stack">
            <Panel id="service-requests" title="Guest service requests" meta={`${serviceRequests.length} requests · ${serviceRequests.filter(request => !['fulfilled', 'cancelled'].includes(request.status)).length} open`} error={loadErrors.services} onRetry={() => load(true)} lazy>
              <form className="dash-panel-body dash-stack" onSubmit={createServiceRequest}>
                <label className="dash-field">Checked-in guest<select required value={serviceForm.bookingId} onChange={event => setServiceForm({ ...serviceForm, bookingId: event.target.value })}><option value="">Select an active stay</option>{departures.map(booking => <option key={booking._id} value={booking._id}>{booking.user?.name || 'Guest'} · Room {booking.room?.roomNumber || '—'} · {booking.bookingReference}</option>)}</select></label>
                <label className="dash-field">Service<select value={serviceForm.serviceType} onChange={event => setServiceForm({ ...serviceForm, serviceType: event.target.value })}>{SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="dash-field">Details<textarea required maxLength="500" value={serviceForm.description} onChange={event => setServiceForm({ ...serviceForm, description: event.target.value })} /></label>
                <button className="dash-button" type="submit" disabled={workingId === 'service-create' || !serviceForm.bookingId}>{workingId === 'service-create' ? 'Creating…' : 'Create request'}</button>
              </form>
              <Table rows={serviceRequests} empty="No guest service requests." columns={[
                { label: 'Request', render: request => <strong>{request.requestType?.replaceAll('_', ' ')}</strong> },
                { label: 'Guest / room', render: request => `${request.requestedBy?.name || 'Guest'} · ${request.room?.roomNumber || '—'}` },
                { label: 'Details', key: 'description' },
                { label: 'Assigned to', render: request => {
                  const terminal = ['fulfilled', 'cancelled'].includes(request.status);
                  return <select aria-label={`Assign ${request.requestType} service request`} value={request.assignedTo?._id || ''} disabled={terminal || workingId === request._id} onChange={event => updateServiceRequest(request, { assignedTo: event.target.value })}>
                    <option value="" disabled>{request.assignedTo?.name || 'Unassigned'}</option>
                    {housekeepers.map(member => <option key={member._id} value={member._id}>{member.name}</option>)}
                  </select>;
                } },
                { label: 'Status', render: request => <Status value={request.status} /> },
                { label: 'Advance status', render: request => {
                  const actions = getServiceActions(request.status);
                  return actions.length ? <select className="dash-status-select" aria-label={`Update ${request.requestType} request`} value="" disabled={workingId === request._id} onChange={event => updateServiceRequest(request, { status: event.target.value })}><option value="">Choose action</option>{actions.map(status => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select> : '—';
                } }
              ]} />
            </Panel>
            <Panel id="maintenance-requests" title="Maintenance requests" meta={`${maintenanceIssues.filter(issue => issue.status !== 'resolved').length} unresolved`} error={loadErrors.maintenance} onRetry={() => load(true)} lazy>
              <form className="dash-panel-body dash-stack" onSubmit={createMaintenanceIssue}>
                <label className="dash-field">Checked-in guest (optional)<select value={maintenanceForm.bookingId} onChange={event => {
                  const booking = departures.find(item => item._id === event.target.value);
                  setMaintenanceForm(current => ({ ...current, bookingId: event.target.value, roomId: booking?.room?._id || current.roomId }));
                }}><option value="">Room issue without a linked guest</option>{departures.map(booking => <option key={booking._id} value={booking._id}>{booking.user?.name || 'Guest'} · Room {booking.room?.roomNumber || '—'} · {booking.bookingReference}</option>)}</select></label>
                <label className="dash-field">Room<select required disabled={Boolean(maintenanceForm.bookingId)} value={maintenanceForm.roomId} onChange={event => setMaintenanceForm({ ...maintenanceForm, roomId: event.target.value })}><option value="">Select a room</option>{rooms.map(room => <option key={room.roomId} value={room.roomId}>Room {room.roomNumber} · {room.type}</option>)}</select></label>
                <div className="dash-form-grid">
                  <label className="dash-field">Category<input value={maintenanceForm.category} onChange={event => setMaintenanceForm({ ...maintenanceForm, category: event.target.value })} /></label>
                  <label className="dash-field">Priority<select value={maintenanceForm.priority} onChange={event => setMaintenanceForm({ ...maintenanceForm, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
                </div>
                <label className="dash-field">Issue details<textarea required maxLength="500" value={maintenanceForm.description} onChange={event => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} /></label>
                <button className="dash-button-secondary" type="submit" disabled={workingId === 'maintenance-create' || !maintenanceForm.roomId}>{workingId === 'maintenance-create' ? 'Reporting…' : 'Report maintenance'}</button>
              </form>
              <Table rows={maintenanceIssues} empty="No maintenance reports." columns={[
                { label: 'Room / issue', render: issue => <><strong>Room {issue.room?.roomNumber || '—'} · {issue.category}</strong><br />{issue.issueDescription}</> },
                { label: 'Priority', render: issue => <Status value={issue.priority} /> },
                { label: 'Status', render: issue => <Status value={issue.status} /> },
                { label: 'Forward to housekeeping', render: issue => <select aria-label={`Assign maintenance for room ${issue.room?.roomNumber || ''}`} value={issue.assignedStaff?._id || ''} disabled={issue.status === 'resolved' || workingId === issue._id} onChange={event => updateMaintenanceIssue(issue, { assignedTo: event.target.value })}><option value="" disabled>{issue.assignedStaff ? issue.assignedStaff.name : 'Unassigned'}</option>{housekeepers.map(member => <option key={member._id} value={member._id}>{member.name}</option>)}</select> }
              ]} />
            </Panel>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
