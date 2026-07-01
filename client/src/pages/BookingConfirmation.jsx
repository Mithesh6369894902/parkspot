import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Car, Download, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${id}`);
        setBooking(data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  if (!booking) return <div className="text-center py-20">Booking not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500">Your parking has been booked successfully</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {/* QR Code */}
        {booking.qrCode && (
          <div className="text-center bg-slate-50 rounded-lg p-6">
            <p className="text-sm text-slate-500 mb-2">Show this QR code at entry</p>
            <div className="text-2xl font-mono font-bold text-slate-800 bg-white px-6 py-3 rounded-lg inline-block border-2 border-dashed">
              {booking.qrCode}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-1">Land</p>
            <p className="font-semibold">{booking.land?.title}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-1">Location</p>
            <p className="font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {booking.land?.location?.city}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-1">Date & Time</p>
            <p className="font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(booking.eventDate?.start).toLocaleDateString()} - {new Date(booking.eventDate?.end).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 mb-1">Vehicles</p>
            <p className="font-semibold flex items-center gap-1">
              <Car className="w-3 h-3" /> {booking.vehicleCount} {booking.vehicleType?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-green-700">₹{booking.totalAmount}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="text-blue-800 font-medium">Booking ID: {booking._id}</p>
          <p className="text-blue-600 mt-1">Duration: {booking.duration} hours</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link to="/my-bookings" className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
          View My Bookings
        </Link>
        <Link to="/explore" className="flex-1 text-center border py-3 rounded-lg font-medium hover:bg-slate-50">
          Explore More
        </Link>
      </div>
    </div>
  );
}
