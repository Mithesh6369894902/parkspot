import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Car, Bike, ArrowLeft, CreditCard } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { landId } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    vehicleType: 'four_wheeler',
    vehicleCount: 1,
  });
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLand, setFetchingLand] = useState(true);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const { data } = await api.get(`/lands/${landId}`);
        setLand(data.land);
      } catch (err) {
        toast.error('Land not found');
        navigate('/explore');
      } finally {
        setFetchingLand(false);
      }
    };
    fetchLand();
  }, [landId, navigate]);

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);

    // Calculate pricing when dates are set
    if (newForm.startDate && newForm.endDate && land) {
      calculatePricing(newForm);
    }
  };

  const calculatePricing = async (formData) => {
    try {
      const { data } = await api.post('/bookings/calculate', {
        landId,
        eventDate: { start: formData.startDate, end: formData.endDate },
        vehicleType: formData.vehicleType,
        vehicleCount: parseInt(formData.vehicleCount),
      });
      setPricing(data.pricing);
    } catch (err) {
      // Pricing calculation endpoint is optional - calculate locally
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      if (hours > 0) {
        const base = land.pricePerHour * hours * parseInt(formData.vehicleCount);
        const vehicleMult = formData.vehicleType === 'two_wheeler' ? 0.5 : formData.vehicleType === 'mixed' ? 0.75 : 1;
        setPricing({
          basePrice: land.pricePerHour,
          durationHours: hours,
          finalPrice: Math.round(base * vehicleMult),
          breakdown: { vehicleType: formData.vehicleType, vehicleMultiplier: vehicleMult },
        });
      }
    }
  };

  const handleBook = async () => {
    if (!form.startDate || !form.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        landId,
        eventDate: { start: form.startDate, end: form.endDate },
        vehicleType: form.vehicleType,
        vehicleCount: parseInt(form.vehicleCount),
      });

      // Create payment order
      const { data: orderData } = await api.post('/payments/create-order', {
        bookingId: data.booking._id,
      });

      // Initiate Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'ParkSpot',
        description: `Parking at ${land.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId,
            });
            toast.success('Payment successful!');
            navigate(`/booking-confirmation/${data.booking._id}`);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          contact: '',
          email: '',
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLand) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  if (!land) return null;

  const maxFourWheelers = land.fourWheelerSpots;
  const maxTwoWheelers = land.twoWheelerSpots;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Book {land.title}</h1>
      <p className="text-slate-500 mb-8">{land.location?.address}, {land.location?.city}</p>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" /> Event Dates
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">End Date & Time</label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg mt-1"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'four_wheeler', label: 'Four Wheeler', icon: <Car className="w-5 h-5" />, max: maxFourWheelers },
              { value: 'two_wheeler', label: 'Two Wheeler', icon: <Bike className="w-5 h-5" />, max: maxTwoWheelers },
              { value: 'mixed', label: 'Mixed', icon: <Car className="w-5 h-5" />, max: maxFourWheelers + maxTwoWheelers },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, vehicleType: opt.value, vehicleCount: 1 })}
                className={`p-4 rounded-lg border-2 text-center transition ${
                  form.vehicleType === opt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-center mb-2">{opt.icon}</div>
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-slate-500">Max: {opt.max}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Count */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Number of Vehicles</label>
          <input
            type="number"
            name="vehicleCount"
            value={form.vehicleCount}
            onChange={handleChange}
            min="1"
            max={form.vehicleType === 'two_wheeler' ? maxTwoWheelers : form.vehicleType === 'four_wheeler' ? maxFourWheelers : maxFourWheelers + maxTwoWheelers}
            className="w-full px-4 py-3 border rounded-lg text-lg"
          />
        </div>

        {/* Pricing Preview */}
        {pricing && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold">Price Breakdown</h3>
            <div className="flex justify-between text-sm">
              <span>Base Price</span>
              <span>₹{pricing.basePrice}/hr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duration</span>
              <span>{pricing.durationHours} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vehicle Count</span>
              <span>{form.vehicleCount} {form.vehicleType === 'two_wheeler' ? 'two-wheelers' : 'four-wheelers'}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-blue-600">₹{pricing.finalPrice}</span>
            </div>
          </div>
        )}

        {/* Capacity Warning */}
        {form.vehicleCount > (form.vehicleType === 'two_wheeler' ? maxTwoWheelers : form.vehicleType === 'four_wheeler' ? maxFourWheelers : maxFourWheelers + maxTwoWheelers) && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            Exceeds available capacity! Max: {form.vehicleType === 'two_wheeler' ? maxTwoWheelers : form.vehicleType === 'four_wheeler' ? maxFourWheelers : maxFourWheelers + maxTwoWheelers}
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={loading || !form.startDate || !form.endDate}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {loading ? 'Processing...' : `Pay ₹${pricing?.finalPrice || '---'}`}
        </button>

        <p className="text-xs text-slate-400 text-center">
          Secure payment via Razorpay — UPI, Cards, Net Banking supported
        </p>
      </div>
    </div>
  );
}
