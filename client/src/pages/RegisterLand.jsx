import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMapEvents, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { createLand } from '../services/land';
import { amenitiesList } from '../utils/helpers';
import { getLivePosition, reverseGeocode } from '../utils/geo';
import toast from 'react-hot-toast';
import { MapPin, Upload, Check, ArrowLeft, ArrowRight, LocateFixed, Zap } from 'lucide-react';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function Recenter({ center }) {
  const map = useMapEvents({});
  useEffect(() => { if (center) map.flyTo(center, 16, { duration: 1 }); }, [center, map]);
  return null;
}

export default function RegisterLand() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', lat: '', lng: '', address: '', city: '', state: '',
    pricePerHour: '50', areaSqFt: '5000', amenities: [], images: [],
  });
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState(null);
  const [previews, setPreviews] = useState([]);

  const pick = async (lat, lng, autoFill = false) => {
    setMarker([lat, lng]);
    setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
    if (autoFill) {
      const geo = await reverseGeocode(lat, lng);
      setForm((f) => ({ ...f, address: f.address || geo.address, city: f.city || geo.city, state: f.state || geo.state }));
    }
  };

  const useGPS = async () => {
    try {
      setGpsLoading(true);
      const pos = await getLivePosition();
      await pick(pos.coords.latitude, pos.coords.longitude, true);
      toast.success(`GPS locked (±${Math.round(pos.coords.accuracy)}m)`);
    } catch {
      toast.error('GPS blocked. Tap the map manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => { useGPS(); // eslint-disable-next-line
  }, []);

  const spots = (() => {
    const a = parseFloat(form.areaSqFt) || 0;
    return { two: Math.floor((a * 0.6) / 30), four: Math.floor((a * 0.4) / 120), total: Math.floor((a * 0.6) / 30) + Math.floor((a * 0.4) / 120) };
  })();

  const toggleAmenity = (a) => setForm((p) => ({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a] }));

  const onFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setForm((p) => ({ ...p, images: files }));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.lat || !form.lng || !form.address || !form.city || !form.state || !form.pricePerHour) {
      return toast.error('Fill all required fields (title, description, location, price)');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('lat', form.lat);
      fd.append('lng', form.lng);
      fd.append('address', form.address);
      fd.append('city', form.city);
      fd.append('state', form.state);
      fd.append('pricePerHour', form.pricePerHour);
      fd.append('areaSqFt', form.areaSqFt);
      fd.append('amenities', JSON.stringify(form.amenities));
      form.images.forEach((f) => fd.append('images', f));
      const { data } = await createLand(fd);
      toast.success(data.autoApproved ? 'Live! Your land is now visible on the map.' : 'Submitted for verification!');
      navigate('/my-lands');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register land');
    } finally {
      setLoading(false);
    }
  };

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const steps = [{ num: 1, title: 'Details' }, { num: 2, title: 'GPS Location' }, { num: 3, title: 'Price & Size' }, { num: 4, title: 'Photos' }];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">List Your Land <span className="ps-live-badge"><Zap className="w-3 h-3" /> goes live instantly</span></h1>
      <p className="text-slate-500 mb-6">Drop your GPS pin — customers nearby will see it in real time on Explore.</p>

      <div className="flex items-center mb-6 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{step > s.num ? <Check className="h-4 w-4" /> : s.num}</div>
              <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-10 h-0.5 mx-2 ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="ps-form-card">
        {step === 1 && (
          <div className="space-y-4">
            <div><label className="ps-label">Land Title *</label><input value={form.title} onChange={update('title')} className="ps-input" placeholder="e.g. Green Field Parking – Near HSR BDA Complex" /></div>
            <div><label className="ps-label">Description *</label><textarea value={form.description} onChange={update('description')} rows={4} className="ps-input" placeholder="Landmarks, entry gate width, ground type, waterlogging in rain?" /></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={useGPS} disabled={gpsLoading} className="ps-btn-primary"><LocateFixed className="w-4 h-4" /> {gpsLoading ? 'Locating…' : 'Use my GPS location'}</button>
              <span className="text-xs text-slate-500 self-center">or tap the map</span>
            </div>
            <div className="h-96 rounded-xl overflow-hidden border">
              <MapContainer center={marker || [20.5937, 78.9629]} zoom={marker ? 16 : 5} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onPick={(la, ln) => pick(la, ln, false)} />
                <Recenter center={marker} />
                {marker && <><Marker position={marker} icon={markerIcon} /><Circle center={marker} radius={30} pathOptions={{ color: '#2563eb', fillOpacity: 0.15 }} /></>}
              </MapContainer>
            </div>
            {marker && <div className="ps-gps-ok">📍 {marker[0].toFixed(6)}, {marker[1].toFixed(6)} — verify address below matches</div>}
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className="ps-label">Address *</label><input value={form.address} onChange={update('address')} className="ps-input" /></div>
              <div><label className="ps-label">City *</label><input value={form.city} onChange={update('city')} className="ps-input" /></div>
              <div><label className="ps-label">State *</label><input value={form.state} onChange={update('state')} className="ps-input" /></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="ps-label">Price per hour (₹) *</label><input type="number" min="1" value={form.pricePerHour} onChange={update('pricePerHour')} className="ps-input" /></div>
              <div><label className="ps-label">Land area (sq ft) *</label><input type="number" min="500" value={form.areaSqFt} onChange={update('areaSqFt')} className="ps-input" /></div>
            </div>
            <div className="ps-capacity">Auto capacity → <b>{spots.total} spots</b> (🏍 {spots.two} + 🚗 {spots.four}) • Peak 1.5x • Weekend 1.3x auto-applied</div>
            <div><label className="ps-label">Amenities</label>
              <div className="flex flex-wrap gap-2">{amenitiesList.map((a) => (<button key={a} type="button" onClick={() => toggleAmenity(a)} className={`ps-chip ${form.amenities.includes(a) ? 'on' : ''}`}>{a}</button>))}</div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <label className="ps-upload">
              <Upload className="h-8 w-8 text-slate-400" /><span>Tap to add up to 10 GPS-daylight photos</span>
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
            <div className="grid grid-cols-5 gap-2">{previews.map((u, i) => <img key={i} src={u} alt="" className="w-full h-20 object-cover rounded-lg" />)}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Tip: stand at the entry gate, keep GPS on — builds trust + faster bookings.</p>
          </div>
        )}
        <div className="flex justify-between mt-6">
          {step > 1 ? <button onClick={() => setStep(step - 1)} className="ps-btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button> : <div />}
          {step < 4 ? <button onClick={() => setStep(step + 1)} className="ps-btn-primary">Next <ArrowRight className="h-4 w-4" /></button>
            : <button onClick={handleSubmit} disabled={loading} className="ps-btn-primary big">{loading ? 'Publishing…' : 'Publish Live on Map'}</button>}
        </div>
      </div>
    </div>
  );
}

