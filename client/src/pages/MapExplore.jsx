import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Car, Star } from 'lucide-react';
import api from '../services/api';

// Custom marker icon
const createPriceIcon = (price) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">₹${price}/hr</div>`,
  iconSize: [80, 30],
  iconAnchor: [40, 15],
});

function MapEvents({ onBoundsChange }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    };
    map.on('moveend', handler);
    handler();
    return () => map.off('moveend', handler);
  }, [map, onBoundsChange]);
  return null;
}

export default function MapExplore() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // India center

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {} // fallback to India center
    );
  }, []);

  const fetchLands = async (bounds) => {
    try {
      setLoading(true);
      const params = { ...bounds };
      if (filters.priceMin) params.priceMin = filters.priceMin;
      if (filters.priceMax) params.priceMax = filters.priceMax;
      const { data } = await api.get('/lands', { params });
      setLands(data.lands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r overflow-y-auto flex-shrink-0 hidden md:block">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">Explore Parking Lands</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {showFilters && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-2">{lands.length} lands found</p>
        </div>

        <div className="divide-y">
          {lands.map((land) => (
            <Link
              key={land._id}
              to={`/land/${land._id}`}
              className="block p-4 hover:bg-slate-50 transition"
            >
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {land.images?.[0] ? (
                    <img src={land.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Car className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{land.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {land.location?.city}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-600 font-bold text-sm">₹{land.pricePerHour}/hr</span>
                    <span className="text-xs text-green-600">{land.totalSpots} spots</span>
                    {land.averageRating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                        <Star className="w-3 h-3 fill-yellow-400" /> {land.averageRating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!loading && lands.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No parking lands found in this area.</p>
              <p className="text-sm mt-1">Try zooming out or moving the map.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={userLocation} zoom={5} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onBoundsChange={fetchLands} />
          {lands.map((land) => (
            <Marker
              key={land._id}
              position={[land.location.coordinates[1], land.location.coordinates[0]]}
              icon={createPriceIcon(land.pricePerHour)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold mb-1">{land.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{land.location?.city}, {land.location?.state}</p>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-blue-600">₹{land.pricePerHour}/hr</span>
                    <span className="text-green-600">{land.totalSpots} spots</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    🏍 {land.twoWheelerSpots} two-wheelers | 🚗 {land.fourWheelerSpots} four-wheelers
                  </p>
                  <Link
                    to={`/land/${land._id}`}
                    className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm font-medium z-[1000]">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
