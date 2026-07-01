import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Car, Clock, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(bookings.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No bookings found.</p>
          <Link to="/explore" className="text-blue-600 hover:underline">Explore parking lands</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.land?.title || 'Land'}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {booking.land?.location?.city}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="font-medium">{new Date(booking.eventDate?.start).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Duration</p>
                  <p className="font-medium">{booking.duration}hrs</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Vehicles</p>
                  <p className="font-medium">{booking.vehicleCount} {booking.vehicleType?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Amount</p>
                  <p className="font-bold text-blue-600">₹{booking.totalAmount}</p>
                </div>
              </div>

              {booking.qrCode && (
                <div className="mt-3 text-sm">
                  <span className="text-slate-500">QR: </span>
                  <span className="font-mono font-semibold">{booking.qrCode}</span>
                </div>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
