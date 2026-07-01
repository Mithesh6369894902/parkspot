import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../services/booking';
import { createOrder, verifyPayment } from '../services/payment';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateTime, statusColors } from '../utils/helpers';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { CreditCard, Shield, ChevronLeft, CheckCircle, MapPin } from 'lucide-react';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getBookingById(id).then(res => { setBooking(res.data.booking); setLoading(false); });
  }, [id]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
        return;
      }

      const orderRes = await createOrder({ bookingId: id });
      const { order, key, payment } = orderRes.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'ParkSpot',
        description: `Parking at ${booking.land?.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            navigate(`/booking/${id}`);
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error('Payment failed: ' + response.error?.description);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) return <Loading fullPage />;
  if (!booking) return <div className="text-center py-20 text-gray-500">Booking not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 mb-6">
        <ChevronLeft className="h-5 w-5" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-emerald-100 mt-1">Secure checkout via Razorpay</p>
        </div>

        {/* Booking Summary */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-bold">{booking.land?.title}</h2>
              <p className="text-sm text-gray-500">{booking.land?.location?.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDateTime(booking.eventDate?.start)} - {formatDateTime(booking.eventDate?.end)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Vehicle Type</p>
              <p className="font-medium capitalize">{booking.vehicleType?.replace('_', ' ')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Vehicles</p>
              <p className="font-medium">{booking.vehicleCount}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">{booking.duration} hours</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-emerald-600">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>

          {booking.status === 'pending' ? (
            <button onClick={handlePayment} disabled={processing}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              {processing ? 'Processing...' : `Pay ${formatCurrency(booking.totalAmount)}`}
            </button>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-700">Payment Already Completed</p>
              <button onClick={() => navigate(`/booking/${id}`)} className="mt-3 text-emerald-600 font-medium hover:underline">
                View Booking Details
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center pt-2">
            <Shield className="h-4 w-4" /> Payments are processed securely by Razorpay. We never store your card details.
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              {['UPI (GPay, PhonePe, Paytm)', 'Debit Card', 'Credit Card', 'Net Banking'].map(m => (
                <span key={m} className="bg-white px-3 py-1 rounded-full text-xs border">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
