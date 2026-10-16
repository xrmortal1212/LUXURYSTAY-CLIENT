import { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '../../Config/api';
import { EmptyState, ErrorState } from './DashboardParts';
import { money } from './DashboardUtils';

const ReservationTools = ({ guestUserId, canAssignRoom = false, onCreated }) => {
  const [criteria, setCriteria] = useState({ propertyId: '', checkInDate: '', checkOutDate: '', guests: 1 });
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [searching, setSearching] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/properties/locations')
      .then(({ data }) => {
        if (!mounted) return;
        const availableLocations = data.locations || [];
        setLocations(availableLocations);
        if (availableLocations.length === 1) {
          setCriteria(current => ({ ...current, propertyId: availableLocations[0]._id }));
        }
      })
      .catch(requestError => {
        if (mounted) setError(getApiErrorMessage(requestError, 'Hotel locations could not be loaded.'));
      })
      .finally(() => {
        if (mounted) setLoadingLocations(false);
      });
    return () => { mounted = false; };
  }, []);

  const search = async event => {
    event.preventDefault();
    setSearching(true);
    setError('');
    setResults(null);
    setSelected(null);
    try {
      if (!criteria.propertyId) {
        setError('Choose a hotel location before searching.');
        return;
      }
      if (criteria.checkOutDate <= criteria.checkInDate) {
        setError('Check-out must be after check-in.');
        return;
      }
      const availabilityRequest = api.get('/rooms/search', { params: criteria });
      const readinessRequest = canAssignRoom
        ? api.get('/rooms/calendar', { params: { startDate: criteria.checkInDate, endDate: criteria.checkOutDate } })
        : Promise.resolve(null);
      const [availabilityResult, readinessResult] = await Promise.all([availabilityRequest, readinessRequest]);
      const readiness = new Map((readinessResult?.data.calendar || [])
        .filter(room => room.isClean && room.status === 'available')
        .map(room => [String(room.roomId), room]));
      const rooms = availabilityResult.data.data || [];
      setResults(canAssignRoom
        ? rooms.map(result => ({
          ...result,
          assignableRooms: (result.availableRooms || []).filter(room => readiness.has(String(room.id)))
        }))
        : rooms);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room availability could not be checked.'));
    } finally {
      setSearching(false);
    }
  };

  const selectRoomType = result => {
    if (selected?.roomType?._id !== result.roomType._id) setSelectedRoomId('');
    setCouponValidation(null);
    setSelected(result);
  };

  const validateCoupon = async () => {
    const normalizedCode = couponCode.trim();
    if (!normalizedCode || !selected || validatingCoupon) return;
    setValidatingCoupon(true);
    setCouponValidation(null);
    try {
      const { data } = await api.post('/coupons/validate', {
        couponCode: normalizedCode,
        roomTypeId: selected.roomType._id,
        propertyId: criteria.propertyId,
        checkInDate: criteria.checkInDate,
        checkOutDate: criteria.checkOutDate
      });
      setCouponValidation(data);
    } catch (requestError) {
      setCouponValidation({ valid: false, message: getApiErrorMessage(requestError, 'Coupon could not be validated.') });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const createReservation = async event => {
    event.preventDefault();
    if (!selected || working) return;
    setWorking(true);
    setError('');
    try {
      const payload = {
        roomTypeId: selected.roomType._id,
        propertyId: criteria.propertyId,
        checkInDate: criteria.checkInDate,
        checkOutDate: criteria.checkOutDate,
        adults: Number(criteria.guests),
        children: 0,
        couponCode: couponCode.trim() || undefined,
        ...(guestUserId ? { guestUserId } : {}),
        ...(canAssignRoom && selectedRoomId ? { roomId: selectedRoomId } : {})
      };
      const { data } = await api.post('/bookings', payload);
      toast.success(`Reservation ${data.booking?.bookingReference || ''} confirmed.`);
      setResults(null);
      setSelected(null);
      setCouponCode('');
      setCouponValidation(null);
      onCreated?.(data.booking);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Reservation could not be created. Check the dates and coupon, then try again.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="reservation-tools">
      {error && <ErrorState message={error} />}
      <form className="dash-panel-body dash-form-row" onSubmit={search}>
        <label className="dash-field"><span><MapPin size={14} /> Hotel location</span>
          <select
            required
            value={criteria.propertyId}
            disabled={loadingLocations || locations.length === 0}
            onChange={event => {
              setCriteria(current => ({ ...current, propertyId: event.target.value }));
              setResults(null);
              setSelected(null);
            }}
          >
            <option value="">{loadingLocations ? 'Loading locations…' : 'Choose a hotel'}</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.propertyName}{location.address?.city ? ` · ${location.address.city}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="dash-field">Check-in<input required type="date" min={new Date().toISOString().slice(0, 10)} value={criteria.checkInDate} onChange={event => setCriteria({ ...criteria, checkInDate: event.target.value })} /></label>
        <label className="dash-field">Check-out<input required type="date" min={criteria.checkInDate || new Date().toISOString().slice(0, 10)} value={criteria.checkOutDate} onChange={event => setCriteria({ ...criteria, checkOutDate: event.target.value })} /></label>
        <label className="dash-field">Guests<input min="1" required type="number" value={criteria.guests} onChange={event => setCriteria({ ...criteria, guests: event.target.value })} /></label>
        <button className="dash-button" type="submit" disabled={searching || loadingLocations || locations.length === 0}>{searching ? 'Searching…' : <><Search size={14} /> Search rooms</>}</button>
      </form>
      {results && <div className="dash-panel-body dash-list">
        {results.length === 0 ? <EmptyState>No rooms available for those dates.</EmptyState> : results.map(result => {
          const roomType = result.roomType || {};
          const roomImages = (result.availableRooms || []).flatMap(room => room.images || []);
          const images = roomImages.length ? [...new Set(roomImages)] : (Array.isArray(roomType.images) ? roomType.images : []);
          const assignableRooms = result.assignableRooms || [];
          return <article className="reservation-room" key={roomType._id}>
            <div className="reservation-room-gallery">
              {images.length ? images.slice(0, 5).map((image, index) => {
                const src = typeof image === 'string' ? image : image.url;
                return src ? <img key={`${src}-${index}`} src={src} alt={`${roomType.title || 'Room'} gallery ${index + 1}`} loading="lazy" /> : null;
              }) : <div className="reservation-room-placeholder">Room gallery unavailable</div>}
            </div>
            <div className="reservation-room-details">
              <div><strong>{roomType.title || 'Room'}</strong><span>{result.property?.propertyName || 'Selected hotel'}{result.property?.address?.city ? ` · ${result.property.address.city}` : ''} · {money(roomType.basePrice)} per night · {result.availableCount} available</span></div>
              {roomType.description && <p>{roomType.description}</p>}
              {roomType.amenities?.length > 0 && <span>{roomType.amenities.map(item => item.name || item.title || item).join(' · ')}</span>}
              {canAssignRoom && <label className="dash-field">Assign a room<select value={selected?.roomType?._id === roomType._id ? selectedRoomId : ''} onChange={event => { selectRoomType(result); setSelectedRoomId(event.target.value); }}>
                <option value="">Select a clean, available room</option>
                {assignableRooms.map(room => <option key={room.id} value={room.id}>Room {room.roomNumber}{room.floor ? ` · Floor ${room.floor}` : ''}</option>)}
              </select></label>}
              {canAssignRoom && assignableRooms.length === 0 && <span className="dash-room-warning">No clean, available rooms can be assigned for these dates.</span>}
              <button className="dash-button-secondary" type="button" onClick={() => selectRoomType(result)} aria-pressed={selected?.roomType?._id === roomType._id}>Choose room type</button>
            </div>
          </article>;
        })}
      </div>}
      {selected && <form className="dash-panel-body dash-form-row reservation-checkout" onSubmit={createReservation}>
        <div className="dash-list-main"><strong>Complete reservation: {selected.roomType.title}</strong><span>{criteria.checkInDate} – {criteria.checkOutDate}</span></div>
        <label className="dash-field">Coupon code<input value={couponCode} onChange={event => { setCouponCode(event.target.value); setCouponValidation(null); }} placeholder="Optional" autoComplete="off" /></label>
        <button className="dash-button-secondary" type="button" onClick={validateCoupon} disabled={!couponCode.trim() || validatingCoupon || working}>{validatingCoupon ? 'Checking…' : 'Apply coupon'}</button>
        {couponValidation?.valid && <p className="dash-note" role="status">{couponValidation.couponCode} applied: {money(couponValidation.discountAmount)} off before tax. Discounted subtotal: {money(couponValidation.discountedSubtotal)}.</p>}
        {couponValidation && !couponValidation.valid && <p className="dash-error" role="alert">{couponValidation.message || 'This coupon is invalid.'}</p>}
        <p className="dash-metric-note">The server validates the coupon again when you confirm the reservation.</p>
        <button className="dash-button" type="submit" disabled={working || (canAssignRoom && !selectedRoomId) || (couponCode.trim() && couponValidation?.valid === false)}>{working ? 'Confirming…' : 'Confirm reservation'}</button>
      </form>}
    </div>
  );
};

export default ReservationTools;
