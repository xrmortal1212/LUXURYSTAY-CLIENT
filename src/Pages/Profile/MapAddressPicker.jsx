import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, LoaderCircle, MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const markerIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

let nominatimQueue = Promise.resolve();
let lastNominatimRequest = 0;

const requestNominatim = params => {
  const request = nominatimQueue.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastNominatimRequest));
    if (wait) await new Promise(resolve => window.setTimeout(resolve, wait));
    lastNominatimRequest = Date.now();

    const url = new URL('https://nominatim.openstreetmap.org/' + params.endpoint);
    Object.entries(params.query).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`OpenStreetMap lookup failed (${response.status}).`);
    return response.json();
  });
  nominatimQueue = request.catch(() => {});
  return request;
};

const getAddressParts = result => {
  const parts = result.address || {};
  const road = parts.road || parts.pedestrian || parts.footway || parts.path || '';
  const houseNumber = parts.house_number || '';
  return {
    street: [houseNumber, road].filter(Boolean).join(' '),
    unit: parts.unit || parts.subpremise || '',
    city: parts.city || parts.town || parts.village || parts.municipality || parts.county || '',
    state: parts.state || parts.region || '',
    zipCode: parts.postcode || '',
    country: parts.country || ''
  };
};

const getSearchAddress = address =>
  [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(', ');

const getPosition = address =>
  address.latitude !== null && address.latitude !== undefined && address.latitude !== '' &&
  address.longitude !== null && address.longitude !== undefined && address.longitude !== '' &&
  Number.isFinite(Number(address.latitude)) && Number.isFinite(Number(address.longitude))
    ? [Number(address.latitude), Number(address.longitude)]
    : null;

function MapAddressPicker({ address, onAddressChange }) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onAddressChangeRef = useRef(onAddressChange);
  const addressRef = useRef(address);
  const [query, setQuery] = useState(() => getSearchAddress(address));
  const [status, setStatus] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    addressRef.current = address;
  }, [address, onAddressChange]);

  useEffect(() => {
    if (!mapElement.current) return undefined;

    const savedPosition = getPosition(addressRef.current);
    const map = L.map(mapElement.current, {
      center: savedPosition || [20, 0],
      zoom: savedPosition ? 15 : 2,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;
    if (savedPosition) ensureMarker(savedPosition);
    map.on('click', event => void updatePin(event.latlng.lat, event.latlng.lng));

    const existingAddress = getSearchAddress(addressRef.current);
    if (!savedPosition && existingAddress) {
      void requestNominatim({
        endpoint: 'search',
        query: { q: existingAddress, format: 'jsonv2', addressdetails: '1', limit: '1' }
      }).then(results => {
        const result = results[0];
        if (!result || !mapRef.current) return;
        const position = [Number(result.lat), Number(result.lon)];
        ensureMarker(position);
        map.setView(position, 15);
      }).catch(error => setStatus(error.message || 'Unable to find the saved address on the map.'));
    }

    const timer = window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  function ensureMarker(position) {
    const map = mapRef.current;
    if (!map) return null;
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: markerIcon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', event => {
        const markerPosition = event.target.getLatLng();
        void updatePin(markerPosition.lat, markerPosition.lng);
      });
    } else {
      markerRef.current.setLatLng(position);
    }
    return markerRef.current;
  }

  async function updatePin(latitude, longitude) {
    const position = [latitude, longitude];
    const map = mapRef.current;
    if (!map) return;
    ensureMarker(position);
    map.setView(position, 16);
    onAddressChangeRef.current({ latitude, longitude });
    setIsSearching(true);
    setStatus('');
    try {
      const result = await requestNominatim({
        endpoint: 'reverse',
        query: { lat: String(latitude), lon: String(longitude), format: 'jsonv2', addressdetails: '1' }
      });
      if (!result.address) throw new Error('No postal address is available for this pin.');
      onAddressChangeRef.current({ ...getAddressParts(result), latitude, longitude });
      setQuery(result.display_name || getSearchAddress(getAddressParts(result)));
    } catch (error) {
      setStatus(`${error.message} The pin is saved; you can complete the address fields manually.`);
    } finally {
      setIsSearching(false);
    }
  }

  const searchAddress = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setStatus('');
    try {
      const results = await requestNominatim({
        endpoint: 'search',
        query: { q: query.trim(), format: 'jsonv2', addressdetails: '1', limit: '1' }
      });
      const result = results[0];
      if (!result) {
        setStatus('Address not found. Try adding a city or country.');
        return;
      }
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      const position = [latitude, longitude];
      const map = mapRef.current;
      if (!map) return;
      ensureMarker(position);
      map.setView(position, 16);
      onAddressChangeRef.current({ ...getAddressParts(result), latitude, longitude });
      setQuery(result.display_name || query);
    } catch (error) {
      setStatus(error.message || 'Address search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Location is not available in this browser.');
      return;
    }
    setStatus('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void updatePin(coords.latitude, coords.longitude),
      () => setStatus('Location permission was not granted. You can still search or place the pin manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateAddressInput = (event, field, affectsMap = true) => {
    const { value } = event.currentTarget;
    onAddressChange({ [field]: value });
    if (affectsMap && getPosition(address)) {
      setStatus('Address edited. Search it to move the map pin; the selected coordinates are kept until then.');
    }
    setQuery(getSearchAddress({ ...address, [field]: value }));
  };

  return (
    <div className="ls-map-picker">
      <div className="ls-map-search-row">
        <label className="ls-map-search">
          <Search size={17} />
          <input
            value={query}
            onChange={event => setQuery(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void searchAddress();
              }
            }}
            placeholder="Search street, city or place"
            aria-label="Search for an address"
          />
          <button type="button" onClick={() => void searchAddress()} aria-label="Search address" disabled={isSearching}>
            {isSearching ? <LoaderCircle size={16} className="ls-profile-spin" /> : <Search size={16} />}
          </button>
        </label>
        <button className="ls-map-locate" type="button" onClick={useMyLocation} disabled={isSearching}>
          <LocateFixed size={16} /> Use my location
        </button>
      </div>
      <p className="ls-map-hint">
        <MapPin size={14} /> Search for an address or click the map to place a pin. Map data © OpenStreetMap contributors.
      </p>
      <div className="ls-map-canvas-wrap">
        <div ref={mapElement} className="ls-map-canvas" aria-label="Interactive OpenStreetMap for selecting your address" />
      </div>
      {status && <p className="ls-map-status" role="status">{status}</p>}
      {getPosition(address) && (
        <p className="ls-map-pin-coordinates">
          <MapPin size={13} /> Pin selected · {Number(address.latitude).toFixed(5)}, {Number(address.longitude).toFixed(5)}
        </p>
      )}
      <div className="ls-map-address-fields">
        <label className="ls-profile-field ls-map-street">
          <span>Street address</span>
          <input className="ls-profile-input" value={address.street || ''} onChange={event => updateAddressInput(event, 'street')} placeholder="House number and street" autoComplete="address-line1" />
        </label>
        <label className="ls-profile-field ls-map-street">
          <span>Apartment, suite or unit <small className="ls-map-optional">(optional)</small></span>
          <input className="ls-profile-input" value={address.unit || ''} onChange={event => updateAddressInput(event, 'unit', false)} placeholder="Apartment or unit number" autoComplete="address-line2" />
        </label>
        <label className="ls-profile-field">
          <span>City</span>
          <input className="ls-profile-input" value={address.city || ''} onChange={event => updateAddressInput(event, 'city')} placeholder="City" autoComplete="address-level2" />
        </label>
        <label className="ls-profile-field">
          <span>State / region</span>
          <input className="ls-profile-input" value={address.state || ''} onChange={event => updateAddressInput(event, 'state')} placeholder="State or region" autoComplete="address-level1" />
        </label>
        <label className="ls-profile-field">
          <span>Postal code</span>
          <input className="ls-profile-input" value={address.zipCode || ''} onChange={event => updateAddressInput(event, 'zipCode')} placeholder="Postal code" autoComplete="postal-code" />
        </label>
        <label className="ls-profile-field">
          <span>Country</span>
          <input className="ls-profile-input" value={address.country || ''} onChange={event => updateAddressInput(event, 'country')} placeholder="Country" autoComplete="country-name" />
        </label>
      </div>
    </div>
  );
}

export default MapAddressPicker;
