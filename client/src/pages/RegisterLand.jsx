import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import { createLand } from '../services/land';
import { MAP_CENTER } from '../utils/constants';
import { amenitiesList } from '../utils/helpers';
import toast from 'react-hot-toast';
import { MapPin, Upload, Check, ArrowLeft, ArrowRight } from 'lucide-react';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function RegisterLand() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', lat: '', lng: '', address: '', city: '', state: '',
    pricePerHour: '', amenities: [], images: [],
  });
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState(null);

  const handleMapClick = (lat, lng) => {
    setMarker([lat, lng]);
    setForm({ ...form, lat: lat.toFixed(6), lng: lng.toFixed(6) });
  };

  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setForm(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.lat || !form.pricePerHour) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'images') {
          form.images.forEach(f => formData.append('images', f));
        } else if (key === 'amenities') {
          formData.append('amenities', JSON.stringify(form.amenities));
        } else {
          formData.append(key, form[key]);
        }
      });
      await createLand(formData);
      toast.success('Land submitted for verification!');
      navigate('/my-lands');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register land');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Location' },
    { num: 3, title: 'Pricing & Amenities' },
    { num: 4, title: 'Photos' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">List Your Land</h1>
      <p className="text-gray-500 mb-8">Register your land for temporary parking rentals</p>

      <div className="flex items-center mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Title *</label>
              <input type="text" value={form.title} onChange={update('title')} required
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Green Field Parking - Near Convention Center" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={update('description')} rows={4}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Describe your land, nearby landmarks, access points..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-4">Location on Map</h2>
            <p className="text-sm text-gray-500 mb-2">Click on the map to mark your land location</p>
            <div className="h-96 rounded-xl overflow-hidden border">
              <MapContainer center={MAP_CENTER} zoom={5} className="h-full w-full">
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onLocationSelect={handleMapClick} />
                {marker && <Marker position={marker} icon={markerIcon} />}
              </MapContainer>
            </div>
            {marker && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-emerald-700 font-medium">Selected: {marker[0].toFixed(6)}, {marker[1].toFixed(6)}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input type="text" value={form.address} onChange={update('address')} required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" value={form.city} onChange={update('city')} required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input type="text" value={form.state} onChange={update('state')} required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="State" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-4">Pricing & Amenities</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (Rs.) *</label>
              <input type="number" value={form.pricePerHour} onChange={update('pricePerHour')} required min="1"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., 50" />
              <p className="text-xs text-gray-400 mt-1">Dynamic pricing (peak hours, weekends) will be applied automatically</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-4 py-2 rounded-full text-sm border transition ${form.amenities.includes(a) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-4">Upload Photos</h2>
            <p className="text-sm text-gray-500">Upload up to 10 photos of your land</p>
            <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 transition text-center flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-gray-500">Click to upload images</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 5MB each)</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((f, i) => (
                  <div key={i} className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center text-xs text-emerald-700">
                    {f.name?.slice(0, 8)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-6 py-3 border rounded-xl font-medium hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
