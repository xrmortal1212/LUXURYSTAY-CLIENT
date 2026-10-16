import { useCallback, useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../../../Config/api';
import { ErrorState, Panel, Status } from '../DashboardParts';

const emptyHotel = {
  name: '',
  address: { street: '', city: '', state: '', zipCode: '', country: '' },
  contactDetails: { phone: '', email: '', website: '' },
  timings: { checkInTime: '14:00', checkOutTime: '11:00' },
  policies: []
};

const emptyProperty = {
  propertyName: '',
  propertyCode: '',
  address: { city: '', state: '', country: '', zipCode: '' },
  contactEmail: '',
  contactPhone: ''
};

const emptyPricingRule = {
  propertyId: '',
  roomTypeId: '',
  ruleName: '',
  minOccupancyPercentage: '80',
  multiplier: '1.2',
  isWeekendOnly: false
};

const AdministrationTools = () => {
  const [coupons, setCoupons] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [properties, setProperties] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);
  const [pricingRuleForm, setPricingRuleForm] = useState(emptyPricingRule);
  const [hotel, setHotel] = useState(null);
  const [hotelForm, setHotelForm] = useState(emptyHotel);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', usageLimit: 100
  });
  const [rates, setRates] = useState({});
  const [logo, setLogo] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState('');

  const load = useCallback(async () => {
    const [couponResult, roomResult, hotelResult, propertyResult, pricingRuleResult] = await Promise.allSettled([
      api.get('/coupons'),
      api.get('/rooms/types'),
      api.get('/hotels'),
      api.get('/properties'),
      api.get('/dynamic-pricing/rules')
    ]);
    const failed = [couponResult, roomResult, hotelResult, propertyResult, pricingRuleResult].find(result => result.status === 'rejected');
    if (failed) setError(getApiErrorMessage(failed.reason, 'Administration tools could not be loaded.'));
    if (couponResult.status === 'fulfilled') setCoupons(couponResult.value.data.coupons || []);
    if (roomResult.status === 'fulfilled') {
      const types = roomResult.value.data.roomTypes || [];
      setRoomTypes(types);
      setRates(Object.fromEntries(types.map(type => [type._id, String(type.basePrice)])));
    }
    if (hotelResult.status === 'fulfilled') {
      const records = hotelResult.value.data.hotels || [];
      setHotels(records);
      const selected = records[0] || null;
      setHotel(selected);
      if (selected) {
        setHotelForm({
          name: selected.name || '',
          address: { ...emptyHotel.address, ...selected.address },
          contactDetails: { ...emptyHotel.contactDetails, ...selected.contactDetails },
          timings: { ...emptyHotel.timings, ...selected.timings },
          policies: selected.policies || []
        });
      }
    }
    if (propertyResult.status === 'fulfilled') setProperties(propertyResult.value.data.properties || []);
    if (pricingRuleResult.status === 'fulfilled') setPricingRules(pricingRuleResult.value.data.rules || []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateCoupon = async coupon => {
    setWorking(coupon._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(current => current.map(item => item._id === coupon._id ? data.coupon : item));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Coupon could not be updated.'));
    } finally {
      setWorking('');
    }
  };

  const createCoupon = async event => {
    event.preventDefault();
    setWorking('coupon');
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/coupons', {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        usageLimit: Number(couponForm.usageLimit),
        startDate: new Date(couponForm.startDate).toISOString(),
        endDate: new Date(couponForm.endDate).toISOString(),
        isActive: true
      });
      setCoupons(current => [data.coupon, ...current]);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', usageLimit: 100 });
      setMessage('Coupon created.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Coupon could not be created.'));
    } finally {
      setWorking('');
    }
  };

  const saveRate = async roomType => {
    setWorking(roomType._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/rooms/type/${roomType._id}`, { basePrice: Number(rates[roomType._id]) });
      setRoomTypes(current => current.map(item => item._id === roomType._id ? data.roomType : item));
      setMessage(`${roomType.title} rate updated.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Room rate could not be saved.'));
    } finally {
      setWorking('');
    }
  };

  const saveHotel = async event => {
    event.preventDefault();
    setWorking('hotel');
    setError('');
    setMessage('');
    try {
      const payload = {
        ...hotelForm,
        policies: Array.isArray(hotelForm.policies) ? hotelForm.policies : hotelForm.policies.split('\n').map(line => line.trim()).filter(Boolean)
      };
      const { data } = hotel
        ? await api.put(`/hotels/${hotel._id}`, payload)
        : await api.post('/hotels', payload);
      setHotel(data.hotel);
      setHotels(current => hotel ? current.map(item => item._id === hotel._id ? data.hotel : item) : [data.hotel, ...current]);
      setHotelForm(current => ({ ...current, policies: data.hotel.policies || [] }));
      setMessage('Hotel profile and policies saved.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Hotel profile could not be saved.'));
    } finally {
      setWorking('');
    }
  };

  const uploadBranding = async event => {
    event.preventDefault();
    if (!hotel?._id || (!logo && images.length === 0)) return;
    const form = event.currentTarget;
    setWorking('branding');
    setError('');
    setMessage('');
    try {
      const body = new FormData();
      if (logo) body.append('logo', logo);
      images.forEach(image => body.append('images', image));
      const { data } = await api.post(`/uploads/hotels/${hotel._id}/branding`, body);
      setHotel(current => ({ ...current, branding: data.branding }));
      setLogo(null);
      setImages([]);
      form.reset();
      setMessage('Hotel branding assets uploaded.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Hotel branding could not be uploaded. Check server Cloudinary configuration.'));
    } finally {
      setWorking('');
    }
  };

  const createProperty = async event => {
    event.preventDefault();
    setWorking('property');
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/properties', {
        ...propertyForm,
        propertyCode: propertyForm.propertyCode.trim().toUpperCase()
      });
      setProperties(current => [...current, data.property].sort((first, second) => first.propertyName.localeCompare(second.propertyName)));
      setPropertyForm(emptyProperty);
      setMessage('Property added. Assign rooms to it from Room inventory.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Property could not be created.'));
    } finally {
      setWorking('');
    }
  };

  const togglePropertyStatus = async property => {
    setWorking(property._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.put(`/properties/${property._id}`, {
        status: property.status === 'Active' ? 'Inactive' : 'Active'
      });
      setProperties(current => current.map(item => item._id === property._id ? { ...item, ...data.property } : item));
      setMessage(`${property.propertyName} is now ${data.property.status.toLowerCase()}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Property status could not be changed.'));
    } finally {
      setWorking('');
    }
  };

  const createPricingRule = async event => {
    event.preventDefault();
    setWorking('pricing-rule');
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/dynamic-pricing/rules', {
        ...pricingRuleForm,
        minOccupancyPercentage: Number(pricingRuleForm.minOccupancyPercentage),
        multiplier: Number(pricingRuleForm.multiplier)
      });
      setPricingRules(current => [data.rule, ...current]);
      setPricingRuleForm(emptyPricingRule);
      setMessage('Dynamic pricing rule created.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Pricing rule could not be created.'));
    } finally {
      setWorking('');
    }
  };

  const togglePricingRule = async rule => {
    setWorking(rule._id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/dynamic-pricing/rules/${rule._id}`, { isActive: !rule.isActive });
      setPricingRules(current => current.map(item => item._id === rule._id ? data.rule : item));
      setMessage(`${rule.ruleName} is now ${data.rule.isActive ? 'active' : 'inactive'}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Pricing rule could not be updated.'));
    } finally {
      setWorking('');
    }
  };

  return (
    <div className="dash-stack">
      {error && <ErrorState message={error} onRetry={() => { setError(''); void load(); }} />}
      {message && <div className="dash-note" role="status">{message}</div>}
      <Panel id="properties" title="Properties & branches" meta={`${properties.length} managed properties`}>
        <form className="dash-panel-body dash-stack" onSubmit={createProperty}>
          <div className="dash-form-grid">
            <label className="dash-field">Property name<input required maxLength="120" value={propertyForm.propertyName} onChange={event => setPropertyForm(current => ({ ...current, propertyName: event.target.value }))} /></label>
            <label className="dash-field">Property code<input required maxLength="32" pattern="[A-Za-z0-9_-]+" value={propertyForm.propertyCode} onChange={event => setPropertyForm(current => ({ ...current, propertyCode: event.target.value.toUpperCase() }))} /></label>
            <label className="dash-field">City<input value={propertyForm.address.city} onChange={event => setPropertyForm(current => ({ ...current, address: { ...current.address, city: event.target.value } }))} /></label>
            <label className="dash-field">State / region<input value={propertyForm.address.state} onChange={event => setPropertyForm(current => ({ ...current, address: { ...current.address, state: event.target.value } }))} /></label>
            <label className="dash-field">Country<input value={propertyForm.address.country} onChange={event => setPropertyForm(current => ({ ...current, address: { ...current.address, country: event.target.value } }))} /></label>
            <label className="dash-field">Postal code<input value={propertyForm.address.zipCode} onChange={event => setPropertyForm(current => ({ ...current, address: { ...current.address, zipCode: event.target.value } }))} /></label>
            <label className="dash-field">Contact email<input type="email" value={propertyForm.contactEmail} onChange={event => setPropertyForm(current => ({ ...current, contactEmail: event.target.value }))} /></label>
            <label className="dash-field">Contact phone<input value={propertyForm.contactPhone} onChange={event => setPropertyForm(current => ({ ...current, contactPhone: event.target.value }))} /></label>
          </div>
          <button className="dash-button" type="submit" disabled={working === 'property'}>{working === 'property' ? 'Adding…' : 'Add property'}</button>
        </form>
        <div className="dash-panel-body dash-list">{properties.map(property => <div className="dash-list-item" key={property._id}>
          <div className="dash-list-main"><strong>{property.propertyName} · {property.propertyCode}</strong><span>{property.address?.city || 'Location not set'} · {property.totalRooms || 0} rooms</span></div>
          <div className="dash-toolbar"><Status value={property.status} /><button className="dash-button-secondary" type="button" disabled={Boolean(working)} onClick={() => togglePropertyStatus(property)}>{working === property._id ? 'Saving…' : property.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div>
        </div>)}</div>
      </Panel>
      <Panel id="room-rates" title="Room rates" meta={`${roomTypes.length} room types`}>
        <div className="dash-panel-body dash-list">{roomTypes.map(type => <div className="dash-list-item" key={type._id}>
          <div className="dash-list-main"><strong>{type.title}</strong><span>{type.maxGuests} guests · {type.bedType}</span></div>
          <div className="dash-toolbar"><label className="dash-field">Base rate<input aria-label={`${type.title} nightly rate`} min="0" step="0.01" type="number" value={rates[type._id] ?? ''} onChange={event => setRates(current => ({ ...current, [type._id]: event.target.value }))} /></label><button className="dash-button-secondary" type="button" disabled={working === type._id} onClick={() => saveRate(type)}>{working === type._id ? 'Saving…' : 'Save rate'}</button></div>
        </div>)}</div>
      </Panel>
      <Panel id="pricing-rules" title="Dynamic pricing rules" meta={`${pricingRules.length} configured`}>
        <form className="dash-panel-body dash-stack" onSubmit={createPricingRule}>
          <div className="dash-form-grid">
            <label className="dash-field">Property<select required value={pricingRuleForm.propertyId} onChange={event => setPricingRuleForm(current => ({ ...current, propertyId: event.target.value }))}><option value="">Choose property</option>{properties.filter(property => property.status === 'Active').map(property => <option key={property._id} value={property._id}>{property.propertyName}</option>)}</select></label>
            <label className="dash-field">Room type<select required value={pricingRuleForm.roomTypeId} onChange={event => setPricingRuleForm(current => ({ ...current, roomTypeId: event.target.value }))}><option value="">Choose room type</option>{roomTypes.map(type => <option key={type._id} value={type._id}>{type.title}</option>)}</select></label>
            <label className="dash-field">Rule name<input required maxLength="120" value={pricingRuleForm.ruleName} onChange={event => setPricingRuleForm(current => ({ ...current, ruleName: event.target.value }))} /></label>
            <label className="dash-field">Minimum occupancy (%)<input required type="number" min="0" max="100" step="1" value={pricingRuleForm.minOccupancyPercentage} onChange={event => setPricingRuleForm(current => ({ ...current, minOccupancyPercentage: event.target.value }))} /></label>
            <label className="dash-field">Rate multiplier<input required type="number" min="0.1" max="10" step="0.01" value={pricingRuleForm.multiplier} onChange={event => setPricingRuleForm(current => ({ ...current, multiplier: event.target.value }))} /></label>
            <label className="dash-field">Weekend only<select value={String(pricingRuleForm.isWeekendOnly)} onChange={event => setPricingRuleForm(current => ({ ...current, isWeekendOnly: event.target.value === 'true' }))}><option value="false">No</option><option value="true">Yes</option></select></label>
          </div>
          <button className="dash-button" type="submit" disabled={working === 'pricing-rule' || properties.every(property => property.status !== 'Active') || !roomTypes.length}>{working === 'pricing-rule' ? 'Creating…' : 'Create pricing rule'}</button>
        </form>
        <div className="dash-panel-body dash-list">{pricingRules.map(rule => <div className="dash-list-item" key={rule._id}>
          <div className="dash-list-main"><strong>{rule.ruleName}</strong><span>{rule.propertyId?.propertyName || 'Property'} · {rule.roomTypeId?.title || 'Room type'} · {rule.minOccupancyPercentage}% occupancy · ×{rule.multiplier}{rule.isWeekendOnly ? ' · weekends' : ''}</span></div>
          <div className="dash-toolbar"><Status value={rule.isActive ? 'active' : 'inactive'} /><button className="dash-button-secondary" type="button" disabled={Boolean(working)} onClick={() => togglePricingRule(rule)}>{working === rule._id ? 'Saving…' : rule.isActive ? 'Deactivate' : 'Activate'}</button></div>
        </div>)}</div>
      </Panel>
      <Panel id="coupons" title="Coupons" meta={`${coupons.length} configured`}>
        <form className="dash-panel-body dash-stack" onSubmit={createCoupon}>
          <div className="dash-form-grid">
            <label className="dash-field">Code<input required maxLength="32" value={couponForm.code} onChange={event => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} /></label>
            <label className="dash-field">Discount type<select value={couponForm.discountType} onChange={event => setCouponForm({ ...couponForm, discountType: event.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
            <label className="dash-field">Discount value<input required min="0" max={couponForm.discountType === 'percentage' ? '100' : undefined} step="0.01" type="number" value={couponForm.discountValue} onChange={event => setCouponForm({ ...couponForm, discountValue: event.target.value })} /></label>
            <label className="dash-field">Usage limit<input required min="1" step="1" type="number" value={couponForm.usageLimit} onChange={event => setCouponForm({ ...couponForm, usageLimit: event.target.value })} /></label>
            <label className="dash-field">Starts<input required type="date" value={couponForm.startDate} onChange={event => setCouponForm({ ...couponForm, startDate: event.target.value })} /></label>
            <label className="dash-field">Ends<input required type="date" value={couponForm.endDate} onChange={event => setCouponForm({ ...couponForm, endDate: event.target.value })} /></label>
          </div>
          <button className="dash-button" type="submit" disabled={working === 'coupon'}>{working === 'coupon' ? 'Creating…' : 'Create coupon'}</button>
        </form>
        <div className="dash-panel-body dash-list">{coupons.map(coupon => <div className="dash-list-item" key={coupon._id}>
          <div className="dash-list-main"><strong>{coupon.code}</strong><span>{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} · {coupon.usedCount}/{coupon.usageLimit} used</span></div>
          <div className="dash-toolbar"><Status value={coupon.isActive ? 'active' : 'inactive'} /><button className="dash-button-secondary" type="button" disabled={working === coupon._id} onClick={() => updateCoupon(coupon)}>{coupon.isActive ? 'Deactivate' : 'Activate'}</button></div>
        </div>)}</div>
      </Panel>
      <Panel id="hotel-profile" title="Hotel policies & profile" meta={hotel?.name || 'Create hotel profile'}>
        {hotels.length > 1 && <label className="dash-panel-body dash-field">Hotel<select value={hotel?._id || ''} onChange={event => {
          const selected = hotels.find(item => item._id === event.target.value);
          setHotel(selected);
          if (selected) setHotelForm({
            name: selected.name || '',
            address: { ...emptyHotel.address, ...selected.address },
            contactDetails: { ...emptyHotel.contactDetails, ...selected.contactDetails },
            timings: { ...emptyHotel.timings, ...selected.timings },
            policies: selected.policies || []
          });
        }}>{hotels.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>}
        <form className="dash-panel-body dash-stack" onSubmit={saveHotel}>
          <label className="dash-field">Hotel name<input required value={hotelForm.name} onChange={event => setHotelForm({ ...hotelForm, name: event.target.value })} /></label>
          <div className="dash-form-grid">
            {Object.keys(emptyHotel.address).map(field => <label className="dash-field" key={field}>{field}<input required value={hotelForm.address[field]} onChange={event => setHotelForm(current => ({ ...current, address: { ...current.address, [field]: event.target.value } }))} /></label>)}
            <label className="dash-field">Contact phone<input required value={hotelForm.contactDetails.phone} onChange={event => setHotelForm(current => ({ ...current, contactDetails: { ...current.contactDetails, phone: event.target.value } }))} /></label>
            <label className="dash-field">Contact email<input required type="email" value={hotelForm.contactDetails.email} onChange={event => setHotelForm(current => ({ ...current, contactDetails: { ...current.contactDetails, email: event.target.value } }))} /></label>
            <label className="dash-field">Website<input value={hotelForm.contactDetails.website} onChange={event => setHotelForm(current => ({ ...current, contactDetails: { ...current.contactDetails, website: event.target.value } }))} /></label>
            <label className="dash-field">Check-in<input required type="time" value={hotelForm.timings.checkInTime} onChange={event => setHotelForm(current => ({ ...current, timings: { ...current.timings, checkInTime: event.target.value } }))} /></label>
            <label className="dash-field">Check-out<input required type="time" value={hotelForm.timings.checkOutTime} onChange={event => setHotelForm(current => ({ ...current, timings: { ...current.timings, checkOutTime: event.target.value } }))} /></label>
          </div>
          <label className="dash-field">Hotel policies (one per line)<textarea required value={Array.isArray(hotelForm.policies) ? hotelForm.policies.join('\n') : hotelForm.policies} onChange={event => setHotelForm({ ...hotelForm, policies: event.target.value })} /></label>
          <button className="dash-button" type="submit" disabled={working === 'hotel'}>{working === 'hotel' ? 'Saving…' : 'Save hotel profile'}</button>
        </form>
        <form className="dash-panel-body dash-stack" onSubmit={uploadBranding}>
          <strong>Brand assets {hotel?.branding?.logoUrl ? '· Logo uploaded' : ''}</strong>
          {hotel?.branding?.images?.length > 0 && <span>{hotel.branding.images.length} image(s) currently stored</span>}
          <label className="dash-field">Logo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => setLogo(event.target.files?.[0] || null)} /></label>
          <label className="dash-field">Hotel images<input multiple type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => setImages(Array.from(event.target.files || []))} /></label>
          <button className="dash-button-secondary" type="submit" disabled={!hotel?._id || (!logo && images.length === 0) || working === 'branding'}>{working === 'branding' ? 'Uploading…' : 'Upload branding'}</button>
        </form>
      </Panel>
    </div>
  );
};

export default AdministrationTools;
