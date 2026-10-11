import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Car, Bike, ArrowLeft, CreditCard, MapPin, ShieldCheck, Navigation } from 'lucide-react';
import api from '../services/api';
import { getLivePosition, haversineKm } from '../utils/geo';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { landId } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [dist, setDist] = useState(null);
  const [form, setForm] = useState({ startDate: '', endDate: '', vehicleType: 'four_wheeler', vehicleCount: 1 });
  const [pricing, setPricing] = useState(null);
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const deb = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/lands/${landId}`);
        setLand(data.land);
        try {
          const pos = await getLivePosition();
          const d = haversineKm([pos.coords.latitude, pos.coords.longitude], [data.land.location.coordinates[1], data.land.location.coordinates[0]]);
          setDist(d);
        } catch {}
        // default: tomorrow 10am -> 2pm
        const s = new Date(Date.now() + 24 * 3600 * 1000); s.setHours(10, 0, 0, 0);
        const e = new Date(s.getTime() + 4 * 3600 * 1000);
        const fmt = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setForm((f) => ({ ...f, startDate: fmt(s), endDate: fmt(e) }));
      } catch {
        toast.error('Land not found');
        navigate('/explore');
      }
    })();
  }, [landId, navigate]);

  const refreshQuote = async (fd = form) => {
    if (!fd.startDate || !fd.endDate || !land) return;
    try {
      setChecking(true);
      const [{ data: av }, { data: pr }] = await Promise.all([
        api.get('/bookings/availability', { params: { landId, startDate: new Date(fd.startDate).toISOString(), endDate: new Date(fd.endDate).toISOString(), vehicleType: fd.vehicleType, vehicleCount: fd.vehicleCount } }),
        api.post('/bookings/calculate', { landId, startDate: new Date(fd.startDate).toISOString(), endDate: new Date(fd.endDate).toISOString(), vehicleType: fd.vehicleType, vehicleCount: fd.vehicleCount }),
      ]);
      setAvail(av);
      setPricing(pr.finalPrice ? { finalPrice: pr.finalPrice, ...pr.pricing } : pr.pricing);
    } catch (e) {
      setAvail(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    clearTimeout(deb.current);
    deb.current = setTimeout(() => refreshQuote(), 600);
    // eslint-disable-next-line
  }, [form.startDate, form.endDate, form.vehicleType, form.vehicleCount, land]);

  const handleBook = async () => {
    if (!form.startDate || !form.endDate) return toast.error('Pick dates');
    if (avail && !avail.available) return toast.error(`Only ${avail.availableSpots} spots left for this slot`);
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        landId, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
        vehicleType: form.vehicleType, vehicleCount: parseInt(form.vehicleCount),
      });
      const bookingId = data.booking._id;
      const { data: orderData } = await api.post('/payments/create-order', { bookingId });

      // TEST MODE: mock Razorpay (no keys) -> auto-confirm without popup
      if (orderData.isMockMode) {
        await api.post('/payments/verify', { razorpayOrderId: orderData.order.id, razorpayPaymentId: `pay_mock_${Date.now()}`, razorpaySignature: 'mock' });
        toast.success('Booked! (test mode, no real charge)');
        return navigate(`/booking-confirmation/${bookingId}`);
      }

      if (!window.Razorpay) {
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.body.appendChild(s); });
      }
      const rzp = new window.Razorpay({
        key: orderData.key, amount: orderData.order.amount, currency: 'INR',
        name: 'ParkSpot', description: `Parking at ${land.title}`, order_id: orderData.order.id,
        handler: async (r) => {
          try {
            await api.post('/payments/verify', { razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
            toast.success('Payment successful!');
            navigate(`/booking-confirmation/${bookingId}`);
          } catch { toast.error('Verification failed. Contact support.'); }
        },
        theme: { color: '#2563eb' },
      });
      rzp.on('payment.failed', () => toast.error('Payment failed'));
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!land) return <div className="ps-loading">Loading live availability…</div>;
  const max = form.vehicleType === 'two_wheeler' ? land.twoWheelerSpots : form.vehicleType === 'four_wheeler' ? land.fourWheelerSpots : land.totalSpots;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="ps-back"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-extrabold">Book {land.title}</h1>
      <p className="text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {land.location?.address}, {land.location?.city} {dist != null && <b>• {dist.toFixed(1)} km from you</b>}</p>
      <a className="text-xs text-blue-600 flex items-center gap-1 mb-6" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${land.location.coordinates[1]},${land.location.coordinates[0]}`}><Navigation className="w-3 h-3" /> Get directions</a>

      <div className="ps-book-card">
        <div className={`ps-avail ${avail ? (avail.available ? 'ok' : 'no') : ''}`}>
          {checking ? 'Checking live availability…' : avail ? (avail.available ? `✅ ${avail.availableSpots} spots available for this slot` : `❌ Only ${avail.availableSpots} left — reduce vehicles or change time`) : 'Pick dates to check live availability'}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="ps-label">Start</label><input type="datetime-local" value={form.startDate} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="ps-input" /></div>
          <div><label className="ps-label">End</label><input type="datetime-local" value={form.endDate} min={form.startDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="ps-input" /></div>
        </div>

        <div>
          <label className="ps-label">Vehicle type</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ v: 'four_wheeler', l: 'Car', i: <Car className="w-5 h-5" />, m: land.fourWheelerSpots }, { v: 'two_wheeler', l: 'Bike', i: <Bike className="w-5 h-5" />, m: land.twoWheelerSpots }, { v: 'mixed', l: 'Mixed', i: <Car className="w-5 h-5" />, m: land.totalSpots }].map((o) => (
            <button key={o.v} onClick={() => setForm({ ...form, vehicleType: o.v, vehicleCount: 1 })} className={`ps-vehicle ${form.vehicleType === o.v ? 'on' : ''}`}>
              <div className="flex justify-center">{o.i}</div><div className="text-sm font-semibold">{o.l}</div><div className="text-[11px] text-slate-500">max {o.m}</div>
            </button>))}
          </div>
        </div>

        <div><label className="ps-label">Vehicles ({max} max)</label><input type="number" min="1" max={max} value={form.vehicleCount} onChange={(e) => setForm({ ...form, vehicleCount: e.target.value })} className="ps-input text-lg" /></div>

        {pricing && (
          <div className="ps-pricebox">
            <div className="row"><span>Rate</span><span>₹{pricing.basePrice ?? land.pricePerHour}/hr {pricing.multiplier > 1 && `(×${pricing.multiplier} peak)`}</span></div>
            <div className="row"><span>Duration</span><span>{pricing.hours ?? pricing.durationHours} hrs × {form.vehicleCount}</span></div>
            <div className="total"><span>Total</span><span>₹{pricing.finalPrice ?? pricing.totalAmount}</span></div>
          </div>
        )}

        <button onClick={handleBook} disabled={loading || (avail && !avail.available)} className="ps-pay"><CreditCard className="w-5 h-5" /> {loading ? 'Processing…' : `Pay ₹${pricing?.finalPrice ?? pricing?.totalAmount ?? '—'} & Book`}</button>
        <p className="ps-secure"><ShieldCheck className="w-3 h-3" /> UPI • Cards • NetBanking • 100% refund if land is fake <Calendar className="w-3 h-3" /></p>
      </div>
    </div>
  );
}

