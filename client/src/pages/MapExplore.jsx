import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Search, MapPin, Car, Star, LocateFixed, RefreshCw, Navigation, BadgeCheck } from 'lucide-react';
import api from '../services/api';
import { getLivePosition, searchPlaces, haversineKm, imageUrl } from '../utils/geo';
import toast from 'react-hot-toast';

const priceIcon = (price, live) => L.divIcon({
  className: 'ps-marker',
  html: `<div class="ps-price ${live ? 'ps-live' : ''}">₹${price}/hr${live ? '<span class="ps-dot"></span>' : ''}</div>`,
  iconSize: [90, 32],
  iconAnchor: [45, 16],
});

const meIcon = L.divIcon({
  className: 'ps-me',
  html: `<div class="ps-me-dot"><div class="ps-me-pulse"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 1 }); }, [center, map]);
  return null;
}

function BoundsFetcher({ onBounds }) {
  const map = useMap();
  useEffect(() => {
    let t;
    const emit = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const b = map.getBounds();
        onBounds({ minLat: b.getSouth(), maxLat: b.getNorth(), minLng: b.getWest(), maxLng: b.getEast() });
      }, 400);
    };
    map.on('moveend', emit);
    return () => { map.off('moveend', emit); clearTimeout(t); };
  }, [map, onBounds]);
  return null;
}

export default function MapExplore() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpsState, setGpsState] = useState('idle'); // idle|locating|live|off
  const [me, setMe] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [query, setQuery] = useState('');
  const [suggest, setSuggest] = useState([]);
  const [radius, setRadius] = useState(25);
  const [priceMax, setPriceMax] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const timer = useRef(null);
  const watchId = useRef(null);

  const fetchLands = useCallback(async (extra = {}) => {
    try {
      setLoading(true);
      const b = extra.bounds || bounds;
      const loc = extra.me !== undefined ? extra.me : me;
      const params = { limit: 50 };
      if (loc) { params.lat = loc[0]; params.lng = loc[1]; params.radius = extra.radius || radius; }
      else if (b) Object.assign(params, b);
      if (extra.priceMax !== undefined ? extra.priceMax : priceMax) params.maxPrice = extra.priceMax !== undefined ? extra.priceMax : priceMax;
      if (extra.vehicle !== undefined ? extra.vehicle : vehicle) params.vehicleType = extra.vehicle !== undefined ? extra.vehicle : vehicle;
      const { data } = await api.get('/lands', { params });
      let list = data.lands || [];
      // client-side distance fallback
      if (loc) {
        list = list.map((l) => ({
          ...l,
          _dist: l.distanceKm ?? haversineKm(loc, [l.location?.coordinates?.[1], l.location?.coordinates?.[0]]),
        })).sort((a, b) => (a._dist ?? 9999) - (b._dist ?? 9999));
      }
      setLands(list);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [bounds, me, radius, priceMax, vehicle]);

  // initial GPS
  useEffect(() => {
    locate(true);
    return () => { if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current); if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line
  }, []);

  // live refresh every 20s (real-time bookings change availability)
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => fetchLands(), 20000);
    return () => clearInterval(timer.current);
  }, [fetchLands]);

  useEffect(() => { if (bounds || me) fetchLands(); }, [bounds]); // eslint-disable-line

  const locate = async (silent = false) => {
    try {
      setGpsState('locating');
      const pos = await getLivePosition();
      const ll = [pos.coords.latitude, pos.coords.longitude];
      setMe(ll);
      setAccuracy(pos.coords.accuracy);
      setFlyTo(ll);
      setGpsState('live');
      fetchLands({ me: ll });
      // live track movement
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = navigator.geolocation.watchPosition(
        (p) => setMe([p.coords.latitude, p.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
      if (!silent) toast.success('GPS locked — showing nearby lands');
    } catch {
      setGpsState('off');
      if (!silent) toast.error('GPS blocked. Allow location or search a city.');
      fetchLands();
    }
  };

  const onSearch = async (v) => {
    setQuery(v);
    if (v.length < 3) return setSuggest([]);
    setSuggest(await searchPlaces(v));
  };

  const pickPlace = (p) => {
    const ll = [parseFloat(p.lat), parseFloat(p.lon)];
    setFlyTo(ll);
    setMe(ll);
    setSuggest([]);
    setQuery(p.display_name.split(',').slice(0, 2).join(','));
    fetchLands({ me: ll });
  };

  return (
    <div className="ps-explore">
      {/* Top search bar */}
      <div className="ps-searchbar">
        <div className="ps-searchbox">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={query} onChange={(e) => onSearch(e.target.value)} placeholder="Search city, area, venue… (e.g. HSR Bangalore)" />
          {query && <button onClick={() => { setQuery(''); setSuggest([]); }}>✕</button>}
        </div>
        <button onClick={() => locate()} className={`ps-gps ${gpsState === 'live' ? 'on' : ''}`} title="Use my GPS location">
          <LocateFixed className="w-4 h-4" /> {gpsState === 'locating' ? '…' : gpsState === 'live' ? 'Live' : 'Near me'}
        </button>
        <button onClick={() => fetchLands()} className="ps-gps" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {suggest.length > 0 && (
          <div className="ps-suggest">
            {suggest.map((s, i) => (
              <button key={i} onClick={() => pickPlace(s)}><MapPin className="w-3 h-3" /> {s.display_name.slice(0, 70)}…</button>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="ps-chips">
        <label>Within
          <select value={radius} onChange={(e) => { setRadius(e.target.value); fetchLands({ radius: e.target.value }); }}>
            <option value={5}>5 km</option><option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option><option value={200}>200 km</option>
          </select>
        </label>
        <label>Max ₹<input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} onBlur={() => fetchLands()} placeholder="200" /></label>
        <label>Vehicle
          <select value={vehicle} onChange={(e) => { setVehicle(e.target.value); fetchLands({ vehicle: e.target.value }); }}>
            <option value="">All</option><option value="two_wheeler">🏍 2-wheeler</option><option value="four_wheeler">🚗 4-wheeler</option>
          </select>
        </label>
        <span className="ps-updated">{loading ? 'Updating…' : lastUpdated ? `Live • ${lands.length} lands • ${lastUpdated.toLocaleTimeString()}` : ''}</span>
      </div>

      <div className="ps-body">
        {/* List */}
        <div className="ps-list">
          {lands.map((land) => (
            <Link key={land._id} to={`/land/${land._id}`} className="ps-card">
              <div className="ps-thumb">
                {land.images?.[0] ? <img src={imageUrl(land.images[0])} alt="" loading="lazy" /> : <Car className="w-6 h-6 text-slate-300" />}
                <span className="ps-price-tag">₹{land.pricePerHour}/hr</span>
                {land.verificationDetails?.verificationTier !== 'unverified' && <span className="ps-verified"><BadgeCheck className="w-3 h-3" /> Verified</span>}
              </div>
              <div className="ps-info">
                <h3>{land.title}</h3>
                <p><MapPin className="w-3 h-3" /> {land.location?.city} {land._dist != null && <b>• {land._dist.toFixed(1)} km</b>}</p>
                <div className="ps-meta">
                  <span className="spots">{land.totalSpots} spots</span>
                  <span>🏍 {land.twoWheelerSpots} • 🚗 {land.fourWheelerSpots}</span>
                  {land.averageRating > 0 && <span className="rate"><Star className="w-3 h-3" /> {land.averageRating}</span>}
                </div>
              </div>
            </Link>
          ))}
          {!loading && lands.length === 0 && (
            <div className="ps-empty">
              <MapPin className="w-10 h-10" />
              <p>No lands here yet.</p>
              <p>Zoom out, increase radius, or be the first to <Link to="/register-land">list this area</Link>.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="ps-map">
          <MapContainer center={me || [20.5937, 78.9629]} zoom={me ? 13 : 5} className="h-full w-full">
            <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {flyTo && <FlyTo center={flyTo} />}
            <BoundsFetcher onBounds={setBounds} />
            {me && <><Marker position={me} icon={meIcon} /><Circle center={me} radius={accuracy || 60} pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.12 }} /></>}
            {lands.map((land) => (
              <Marker key={land._id} position={[land.location.coordinates[1], land.location.coordinates[0]]} icon={priceIcon(land.pricePerHour, true)}>
                <Popup>
                  <div className="ps-pop">
                    <h3>{land.title}</h3>
                    <p>{land.location?.city} {land._dist != null && `• ${land._dist.toFixed(1)} km away`}</p>
                    <div className="ps-pop-row"><b>₹{land.pricePerHour}/hr</b><span>{land.totalSpots} spots</span></div>
                    <Link to={`/land/${land._id}`}>View & Book →</Link>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${land.location.coordinates[1]},${land.location.coordinates[0]}`} target="_blank" rel="noreferrer" className="ps-nav"><Navigation className="w-3 h-3" /> Directions</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

