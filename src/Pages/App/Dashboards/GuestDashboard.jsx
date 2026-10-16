import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Award, BedDouble, CalendarDays, CarFront, ConciergeBell, RefreshCw, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../../Config/api';
import { BookingTable, EmptyState, ErrorState, LoadingState, Metric, PageHeading, Panel, Status, Table } from '../DashboardParts';
import { dateLabel, dateTimeLabel, titleCase } from '../DashboardUtils';
import ReservationTools from '../ReservationTools';
import BillingWorkflow from '../BillingWorkflow';
import AIConcierge from '../AIConcierge';
import { SERVICE_TYPES } from '../OperationsUtils';

const DAY_MS = 24 * 60 * 60 * 1000;

const nightsBetween = (start, end) => Math.max(1, Math.round((new Date(end) - new Date(start)) / DAY_MS));
const daysUntil = date => Math.max(0, Math.ceil((new Date(date) - new Date()) / DAY_MS));

/**
 * At-a-glance stay card: live progress for an active stay, an arrival countdown
 * for the next reservation, or a friendly prompt when nothing is booked yet.
 */
const GuestStayHero = ({ activeStay, nextStay }) => {
  if (activeStay) {
    const nights = nightsBetween(activeStay.checkInDate, activeStay.checkOutDate);
    const nightsDone = Math.min(nights, Math.max(0, Math.floor((new Date() - new Date(activeStay.checkInDate)) / DAY_MS)));
    const nightsLeft = Math.max(0, nights - nightsDone);
    const progress = Math.round((nightsDone / nights) * 100);
    return (
      <section className="guest-hero" aria-label="Current stay">
        <div className="guest-hero-copy">
          <span className="guest-hero-eyebrow">CURRENT STAY</span>
          <h2>Room {activeStay.room?.roomNumber || 'assigned'} · {activeStay.room?.roomType?.title || activeStay.room?.roomType || 'Room'}</h2>
          <p>Reference {activeStay.bookingReference} · {dateLabel(activeStay.checkInDate)} – {dateLabel(activeStay.checkOutDate)}</p>
        </div>
        <div className="guest-hero-progress">
          <div className="guest-hero-progress-head">
            <strong>{nightsLeft === 0 ? 'Checking out today' : `${nightsLeft} night${nightsLeft === 1 ? '' : 's'} remaining`}</strong>
            <span>{nightsDone} of {nights} nights</span>
          </div>
          <div className="guest-progress" role="img" aria-label={`Stay progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <ol className="guest-hero-timeline">
            <li className="is-done"><span aria-hidden="true" />Checked in</li>
            <li className="is-active"><span aria-hidden="true" />Enjoying your stay</li>
            <li><span aria-hidden="true" />Check-out</li>
          </ol>
        </div>
      </section>
    );
  }

  if (nextStay) {
    const arrivalIn = daysUntil(nextStay.checkInDate);
    const nights = nightsBetween(nextStay.checkInDate, nextStay.checkOutDate);
    return (
      <section className="guest-hero guest-hero--upcoming" aria-label="Upcoming stay">
        <div className="guest-hero-copy">
          <span className="guest-hero-eyebrow">UPCOMING STAY</span>
          <h2>{arrivalIn === 0 ? 'Arriving today' : `${arrivalIn} day${arrivalIn === 1 ? '' : 's'} to check-in`}</h2>
          <p>{dateLabel(nextStay.checkInDate)} – {dateLabel(nextStay.checkOutDate)} · {nights} night{nights === 1 ? '' : 's'} · Reference {nextStay.bookingReference}</p>
        </div>
        <div className="guest-hero-progress">
          <div className="guest-hero-progress-head">
            <strong>We're preparing for your arrival</strong>
            <span>{nextStay.room?.roomNumber ? `Room ${nextStay.room.roomNumber}` : 'Room to be assigned'}</span>
          </div>
          <ol className="guest-hero-timeline guest-hero-timeline--upcoming">
            <li className="is-active"><span aria-hidden="true" />Reservation confirmed</li>
            <li><span aria-hidden="true" />Welcome & check-in</li>
            <li><span aria-hidden="true" />Check-out</li>
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="guest-hero guest-hero--empty" aria-label="Plan your stay">
      <div className="guest-hero-copy">
        <span className="guest-hero-eyebrow">PLAN YOUR STAY</span>
        <h2>No stay booked yet</h2>
        <p>Browse live room availability and pick the dates that suit you — your reservation will appear here the moment it is confirmed.</p>
      </div>
      <a className="dash-button" href="#room-search"><BedDouble size={14} /> Find a room</a>
    </section>
  );
};

const GuestDashboard = ({ user }) => {
  const [stayHistory, setStayHistory] = useState([]);
  const [loyalty, setLoyalty] = useState({ loyaltyPoints: 0, lifetimePoints: 0, tier: 'Bronze', pointsHistory: [] });
  const [selectedRewardBooking, setSelectedRewardBooking] = useState('');
  const [rewardPoints, setRewardPoints] = useState('100');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [maintenanceReports, setMaintenanceReports] = useState([]);
  const [profile, setProfile] = useState({ name: user.name || '', phone: user.phone || '', dietary: user.preferences?.dietary || '', specialRequests: user.preferences?.specialRequests || '' });
  const [serviceForm, setServiceForm] = useState({ requestType: 'room_service', description: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ category: 'general', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [bookingWorkingId, setBookingWorkingId] = useState('');
  const [feedbackForms, setFeedbackForms] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState({});

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }
    const [profileResult, servicesResult, maintenanceResult, loyaltyResult] = await Promise.allSettled([
      api.get('/users/profile'),
      api.get('/services'),
      api.get('/maintenance'),
      api.get('/loyalty/me')
    ]);
    if (profileResult.status === 'fulfilled') {
      const data = profileResult.value.data;
      setStayHistory(data.stayHistory || []);
      setProfile({ name: data.user.name || '', phone: data.user.phone || '', dietary: data.user.preferences?.dietary || '', specialRequests: data.user.preferences?.specialRequests || '' });
      const upcomingBookings = (data.stayHistory || []).filter(booking => new Date(booking.checkInDate) >= new Date() && ['confirmed', 'pending'].includes(booking.status));
      setSelectedRewardBooking(current => upcomingBookings.some(booking => booking._id === current) ? current : upcomingBookings[0]?._id || '');
    }
    if (servicesResult.status === 'fulfilled') setServiceRequests(servicesResult.value.data.requests || []);
    if (maintenanceResult.status === 'fulfilled') setMaintenanceReports(maintenanceResult.value.data.issues || []);
    if (loyaltyResult.status === 'fulfilled') setLoyalty(loyaltyResult.value.data.loyalty || { loyaltyPoints: 0, lifetimePoints: 0, tier: 'Bronze', pointsHistory: [] });
    const panelFailures = [
      ['profile', profileResult, 'Your stays could not be loaded.'],
      ['services', servicesResult, 'Service requests could not be loaded.'],
      ['maintenance', maintenanceResult, 'Maintenance reports could not be loaded.'],
      ['loyalty', loyaltyResult, 'Rewards could not be loaded.']
    ];
    const nextErrors = {};
    panelFailures.forEach(([key, result, message]) => {
      if (result.status === 'rejected') nextErrors[key] = getApiErrorMessage(result.reason, message);
    });
    setLoadErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);
  const upcoming = useMemo(() => stayHistory.filter(booking => new Date(booking.checkInDate) >= new Date() && ['confirmed', 'pending'].includes(booking.status)), [stayHistory]);
  const activeStay = stayHistory.find(booking => booking.status === 'checked_in');

  const saveProfile = async event => {
    event.preventDefault();
    setWorking(true);
    setError('');
    try {
      await api.put('/users/profile', { name: profile.name, phone: profile.phone, preferences: { ...user.preferences, dietary: profile.dietary, specialRequests: profile.specialRequests } });
      setMessage('Profile saved.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Profile could not be saved.'));
    } finally {
      setWorking(false);
    }
  };

  const submitService = async event => {
    event.preventDefault();
    setWorking(true);
    setError('');
    setMessage('');
    try {
      await api.post('/services/request', { bookingId: activeStay._id, serviceType: serviceForm.requestType, description: serviceForm.description });
      setServiceForm(current => ({ ...current, description: '' }));
      setMessage('Service request sent.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Service request could not be sent.'));
    } finally {
      setWorking(false);
    }
  };

  const submitMaintenance = async event => {
    event.preventDefault();
    const roomId = activeStay?.room?._id || activeStay?.room;
    if (!roomId || working) return;
    setWorking(true);
    setError('');
    setMessage('');
    try {
      await api.post('/maintenance/report', { roomId, bookingId: activeStay._id, ...maintenanceForm });
      setMaintenanceForm(current => ({ ...current, description: '' }));
      setMessage('Maintenance issue reported. You can follow its status below and through live notifications.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Maintenance issue could not be reported.'));
    } finally {
      setWorking(false);
    }
  };

  const cancelReservation = async booking => {
    if (bookingWorkingId) return;
    setBookingWorkingId(booking._id);
    setError('');
    try {
      await api.patch(`/bookings/${booking._id}/cancel`, {});
      setMessage(`Reservation ${booking.bookingReference} cancelled.`);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'This reservation could not be cancelled. The cancellation policy is checked by the hotel.'));
    } finally {
      setBookingWorkingId('');
    }
  };

  const submitFeedback = async (event, booking) => {
    event.preventDefault();
    if (bookingWorkingId) return;
    const form = feedbackForms[booking._id] || { rating: 5, category: 'overall', comment: '' };
    setBookingWorkingId(booking._id);
    setError('');
    try {
      await api.post('/feedback', { bookingId: booking._id, ...form, rating: Number(form.rating) });
      setMessage('Thank you for sharing your feedback.');
      setFeedbackForms(current => ({ ...current, [booking._id]: { ...form, submitted: true } }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Feedback could not be submitted.'));
    } finally {
      setBookingWorkingId('');
    }
  };

  const redeemRewards = async event => {
    event.preventDefault();
    const points = Number(rewardPoints);
    if (!selectedRewardBooking || !Number.isSafeInteger(points) || points < 100 || points % 100 !== 0) {
      setError('Choose an upcoming reservation and enter points in multiples of 100 (minimum 100).');
      return;
    }
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/loyalty/redeem', { bookingId: selectedRewardBooking, points });
      setLoyalty(data.loyalty);
      setMessage(`${data.pointsRedeemed} points applied to your reservation.`);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Rewards could not be applied.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="guest-dashboard">
      <PageHeading eyebrow="GUEST ACCOUNT" title={`Welcome, ${user.name?.split(' ')[0] || 'Guest'}`} description="Your upcoming stays, requests and personal details." action={<button className="dash-button-secondary" type="button" onClick={() => load(true)}><RefreshCw size={14} /> Refresh</button>} />
      {error && <ErrorState message={error} onRetry={() => load(true)} />}
      {message && <div className="dash-note" role="status">{message}</div>}
      {loading ? <LoadingState label="Loading your stay details…" /> : (
        <>
          <GuestStayHero activeStay={activeStay} nextStay={upcoming[0]} />
          <Panel id="room-search" title="Find your next stay" meta="Live room availability">
            <ReservationTools onCreated={() => { setMessage('Your reservation is confirmed.'); void load(); }} />
          </Panel>
          <div className="dash-metrics" id="overview">
            <Metric label="Upcoming stays" value={upcoming.length} note="Confirmed reservations" icon={CalendarDays} />
            <Metric label="Completed stays" value={stayHistory.filter(booking => ['checked_out', 'completed'].includes(booking.status)).length} note="Stay history" icon={Award} />
            <Metric label="Open requests" value={serviceRequests.filter(request => !['fulfilled', 'cancelled'].includes(request.status)).length} note="Guest services" icon={ConciergeBell} />
            <Metric label="Current stay" value={activeStay ? `Room ${activeStay.room?.roomNumber || 'assigned'}` : 'Not checked in'} note={activeStay ? `Check-out ${dateLabel(activeStay.checkOutDate)}` : 'We look forward to hosting you'} icon={BedDouble} />
          </div>
          <Panel id="loyalty-rewards" title="Stay rewards" meta="Earn points on completed stays" error={loadErrors.loyalty} onRetry={() => load(true)} lazy>
            <div className="dash-panel-body dash-stack">
              <div className="dash-metrics">
                <Metric label="Available points" value={loyalty.loyaltyPoints || 0} note="Ready to redeem" />
                <Metric label="Lifetime points" value={loyalty.lifetimePoints || 0} note="Your membership progress" />
                <Metric label="Member tier" value={loyalty.tier || 'Bronze'} note="Based on lifetime points" />
              </div>
              <form className="dash-toolbar" onSubmit={redeemRewards}>
                <label className="dash-field">Upcoming reservation
                  <select value={selectedRewardBooking} onChange={event => setSelectedRewardBooking(event.target.value)} disabled={!upcoming.length}>
                    {!upcoming.length && <option value="">No eligible upcoming reservation</option>}
                    {upcoming.map(booking => <option key={booking._id} value={booking._id}>{booking.bookingReference} · {dateLabel(booking.checkInDate)}</option>)}
                  </select>
                </label>
                <label className="dash-field">Points to redeem
                  <input type="number" min="100" step="100" value={rewardPoints} onChange={event => setRewardPoints(event.target.value)} disabled={!upcoming.length || loyalty.loyaltyPoints < 100} />
                </label>
                <button className="dash-button" type="submit" disabled={working || !upcoming.length || loyalty.loyaltyPoints < 100}>Redeem points</button>
              </form>
              <p className="dash-stay-tip"><Award size={15} aria-hidden="true" /> 100 points apply one unit of discount to an unpaid upcoming reservation. Points are awarded after checkout.</p>
              <Table rows={loyalty.pointsHistory || []} columns={[
                { label: 'Activity', render: item => <strong>{item.activity === 'earned' ? 'Earned' : item.activity === 'reversed' ? 'Returned' : 'Redeemed'}</strong> },
                { label: 'Points', render: item => item.activity === 'earned' ? item.pointsEarned : item.activity === 'reversed' ? item.pointsReversed : item.pointsRedeemed },
                { label: 'Reservation', render: item => item.bookingId?.bookingReference || (item.bookingId ? String(item.bookingId).slice(-8) : '—') },
                { label: 'Date', render: item => dateTimeLabel(item.date) }
              ]} empty="Your rewards activity will appear here." />
            </div>
          </Panel>
          <AIConcierge activeStay={activeStay} />
          <div className="dash-grid-2">
            <div className="dash-stack">
              {activeStay && <Panel id="current-stay" title="Current stay details" meta={`Room ${activeStay.room?.roomNumber || 'assigned'}`} error={loadErrors.profile} onRetry={() => load(true)}>
                <div className="dash-panel-body dash-list">
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Booking reference</strong><span>{activeStay.bookingReference}</span></div><Status value={activeStay.status} /></div>
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Room</strong><span>{activeStay.room?.roomNumber || 'Assigned by the front desk'} · {activeStay.room?.roomType?.title || activeStay.room?.roomType || 'Room details'}</span></div></div>
                  <div className="dash-list-item"><div className="dash-list-main"><strong>Check-in</strong><span>{dateTimeLabel(activeStay.checkInDate)}</span></div><div className="dash-list-main"><strong>Check-out</strong><span>{dateTimeLabel(activeStay.checkOutDate)}</span></div></div>
                </div>
              </Panel>}
              <Panel id="stay-inspiration" title="Make this stay yours" meta="A few ideas from our concierge" lazy>
                <div className="dash-panel-body dash-stay-inspiration">
                  <p className="dash-stay-inspiration-intro">
                    Add a little something special to your visit.
                  </p>
                  <div className="dash-stay-ideas">
                    
                    <Link to="/services" className="dash-stay-idea">
                      <span className="dash-stay-idea-icon"><Utensils size={17} /></span>
                      <span><strong>Dining experiences</strong><small>Explore in-house dining ideas</small></span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                    <Link to="/contact" className="dash-stay-idea">
                      <span className="dash-stay-idea-icon"><CarFront size={17} /></span>
                      <span><strong>Plan the details</strong><small>Ask the concierge for a hand</small></span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                  <p className="dash-stay-tip"><strong>Tip</strong> Let us know your preferred time when you send a request.</p>
                </div>
              </Panel>
              <Panel id="reservations" title="Upcoming reservations" meta={`${upcoming.length} planned`} error={loadErrors.profile} onRetry={() => load(true)} lazy>
                <BookingTable bookings={upcoming} actions={booking => {
                  const canCancel = ['confirmed', 'pending'].includes(booking.status) && new Date(booking.checkInDate) > new Date();
                  return canCancel ? <button className="dash-button-danger" type="button" disabled={bookingWorkingId === booking._id} onClick={() => cancelReservation(booking)}>{bookingWorkingId === booking._id ? 'Cancelling…' : 'Cancel'}</button> : <span>Cancellation unavailable</span>;
                }} />
              </Panel>
              <Panel id="feedback" title="Share feedback" meta="For a current or completed stay" error={loadErrors.profile} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">
                  {stayHistory.filter(booking => ['checked_in', 'checked_out', 'completed'].includes(booking.status)).map(booking => {
                    const form = feedbackForms[booking._id] || { rating: 5, category: 'overall', comment: '' };
                    return <form className="dash-feedback-form" key={booking._id} onSubmit={event => submitFeedback(event, booking)}>
                      <strong>{booking.bookingReference}</strong>
                      {form.submitted ? <div className="dash-note">Feedback submitted. Thank you.</div> : <>
                        <label className="dash-field">Rating<select value={form.rating} onChange={event => setFeedbackForms(current => ({ ...current, [booking._id]: { ...form, rating: event.target.value } }))}>{[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
                        <label className="dash-field">Category<select value={form.category} onChange={event => setFeedbackForms(current => ({ ...current, [booking._id]: { ...form, category: event.target.value } }))}><option value="overall">Overall</option><option value="cleanliness">Cleanliness</option><option value="service">Service</option><option value="amenities">Amenities</option></select></label>
                        <label className="dash-field">Comment<textarea required maxLength="1000" value={form.comment} onChange={event => setFeedbackForms(current => ({ ...current, [booking._id]: { ...form, comment: event.target.value } }))} /></label>
                        <button className="dash-button" type="submit" disabled={bookingWorkingId === booking._id}>{bookingWorkingId === booking._id ? 'Submitting…' : 'Submit feedback'}</button>
                      </>}
                    </form>;
                  })}
                  {!stayHistory.some(booking => ['checked_in', 'checked_out', 'completed'].includes(booking.status)) && <EmptyState>Feedback is available for an active or completed stay.</EmptyState>}
                </div>
              </Panel>
              <Panel id="service-requests" title="Service request status" meta={`${serviceRequests.length} requests`} error={loadErrors.services} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-stack">
                  {serviceRequests.length > 0 && (
                    <div className="guest-request-summary">
                      <span className="guest-request-stat"><strong>{serviceRequests.filter(request => !['fulfilled', 'cancelled'].includes(request.status)).length}</strong>Open</span>
                      <span className="guest-request-stat"><strong>{serviceRequests.filter(request => request.status === 'fulfilled').length}</strong>Fulfilled</span>
                      <span className="guest-request-stat"><strong>{serviceRequests.filter(request => request.status === 'cancelled').length}</strong>Cancelled</span>
                    </div>
                  )}
                  <div className="dash-table-wrap"><Table rows={serviceRequests} columns={[
                    { label: 'Request', render: request => <strong>{titleCase(request.requestType)}</strong> },
                    { label: 'Room', render: request => request.room?.roomNumber || '—' },
                    { label: 'Details', key: 'description' },
                    { label: 'Status', render: request => <Status value={request.status} /> },
                    { label: 'Requested', render: request => dateTimeLabel(request.createdAt) }
                  ]} empty="No service requests yet." /></div>
                </div>
              </Panel>
              <Panel title="Request a service" meta="Available during an active stay" lazy>
                {activeStay ? <form className="dash-panel-body dash-stack" onSubmit={submitService}>
                  <label className="dash-field">Service<select value={serviceForm.requestType} onChange={event => setServiceForm({ ...serviceForm, requestType: event.target.value })}>{SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label className="dash-field">Details<textarea required maxLength="500" value={serviceForm.description} onChange={event => setServiceForm({ ...serviceForm, description: event.target.value })} placeholder="Tell our team what you need" /></label>
                  <button className="dash-button" type="submit" disabled={working}>{working ? 'Sending…' : 'Send request'}</button>
                </form> : <EmptyState>Service requests are available after check-in.</EmptyState>}
              </Panel>
              <Panel id="maintenance-report" title="Report a room issue" meta="Available during an active stay" error={loadErrors.maintenance} onRetry={() => load(true)} lazy>
                {activeStay ? <>
                  <form className="dash-panel-body dash-stack" onSubmit={submitMaintenance}>
                    <label className="dash-field">Issue type<input maxLength="80" value={maintenanceForm.category} onChange={event => setMaintenanceForm({ ...maintenanceForm, category: event.target.value })} /></label>
                    <label className="dash-field">Priority<select value={maintenanceForm.priority} onChange={event => setMaintenanceForm({ ...maintenanceForm, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
                    <label className="dash-field">What needs attention?<textarea required maxLength="500" value={maintenanceForm.description} onChange={event => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} /></label>
                    <button className="dash-button-secondary" type="submit" disabled={working}>{working ? 'Reporting…' : 'Report issue'}</button>
                  </form>
                  <div className="dash-panel-body dash-list">
                    {maintenanceReports.map(issue => <div className="dash-list-item" key={issue._id}><div className="dash-list-main"><strong>{titleCase(issue.category)} · Room {issue.room?.roomNumber || activeStay.room?.roomNumber || 'current room'}</strong><span>{issue.issueDescription} · {dateTimeLabel(issue.createdAt)}</span></div><Status value={issue.status} /></div>)}
                    {!maintenanceReports.length && <EmptyState>No maintenance reports yet.</EmptyState>}
                  </div>
                </> : <EmptyState>Room issue reporting is available after check-in.</EmptyState>}
              </Panel>
            </div>
            <div className="dash-stack">
              <Panel id="profile" title="Personal profile" meta="Visible only to your account" error={loadErrors.profile} onRetry={() => load(true)}>
                <form className="dash-panel-body dash-stack" onSubmit={saveProfile}>
                  <label className="dash-field">Full name<input required value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label>
                  <label className="dash-field">Phone<input value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} /></label>
                  <label className="dash-field">Dietary preferences<input value={profile.dietary} onChange={event => setProfile({ ...profile, dietary: event.target.value })} /></label>
                  <label className="dash-field">Stay notes<textarea value={profile.specialRequests} onChange={event => setProfile({ ...profile, specialRequests: event.target.value })} /></label>
                  <button className="dash-button" type="submit" disabled={working}>{working ? 'Saving…' : 'Save profile'}</button>
                </form>
              </Panel>
              <Panel title="Stay history" meta={`${stayHistory.length} reservations`} error={loadErrors.profile} onRetry={() => load(true)} lazy>
                <div className="dash-panel-body dash-list">{stayHistory.slice(0, 8).map(booking => <div className="dash-list-item" key={booking._id}><div className="dash-list-main"><strong>{booking.bookingReference}</strong><span>{dateLabel(booking.checkInDate)} – {dateLabel(booking.checkOutDate)}</span></div><Status value={booking.status} /></div>)}{stayHistory.length === 0 && <EmptyState>Your completed and upcoming stays will appear here.</EmptyState>}</div>
              </Panel>
              <BillingWorkflow id="guest-billing" title="My bills, payment status & invoices" guestView allowEmail />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuestDashboard;
