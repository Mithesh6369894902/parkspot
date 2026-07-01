import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import { MapPin, Car, Star, Clock, Shield, ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LandDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const [landRes, reviewRes] = await Promise.all([
          api.get(`/lands/${id}`),
          api.get(`/reviews/land/${id}`),
        ]);
        setLand(landRes.data.land);
        setReviews(reviewRes.data.reviews || []);
      } catch (err) {
        toast.error('Land not found');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    fetchLand();
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  if (!land) return null;

  const center = [land.location.coordinates[1], land.location.coordinates[0]];
  const boundary = land.boundary?.map(([lng, lat]) => [lat, lng]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden h-64">
            {land.images?.length > 0 ? (
              land.images.slice(0, 4).map((img, i) => (
                <div key={i} className="bg-slate-200 overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-4 bg-slate-200 flex items-center justify-center text-slate-400">
                <Car className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden h-80 border">
            <MapContainer center={center} zoom={16} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={center} />
              {boundary.length > 2 && (
                <Polygon positions={boundary} pathOptions={{ color: '#2563eb', fillOpacity: 0.2 }} />
              )}
            </MapContainer>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-3">About This Parking Land</h2>
            <p className="text-slate-600 leading-relaxed">{land.description}</p>

            {land.amenities?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {land.amenities.map((amenity, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {review.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.user?.name}</p>
                        <StarRating rating={review.rating} readonly size="w-3 h-3" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{review.comment}</p>
                    {review.ownerReply && (
                      <div className="mt-2 ml-8 bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Owner Reply:</p>
                        <p className="text-sm text-slate-600">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
            <h1 className="text-2xl font-bold mb-2">{land.title}</h1>
            <p className="text-slate-500 flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4" /> {land.location?.address}, {land.location?.city}
            </p>

            {land.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={land.averageRating} readonly size="w-4 h-4" />
                <span className="text-sm text-slate-500">({land.reviewCount} reviews)</span>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">₹{land.pricePerHour}<span className="text-base font-normal text-slate-500">/hour</span></div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Peak hours (6-9AM, 5-9PM): {land.dynamicPricing?.peakMultiplier}x</p>
                <p>Weekends: {land.dynamicPricing?.weekendMultiplier}x</p>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-sm">Parking Capacity</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{land.twoWheelerSpots}</div>
                  <div className="text-xs text-slate-500">🏍 Two-wheelers</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{land.fourWheelerSpots}</div>
                  <div className="text-xs text-slate-500">🚗 Four-wheelers</div>
                </div>
              </div>
              <div className="text-center text-sm text-slate-500">
                Total Area: {land.areaSqFt?.toLocaleString()} sq ft
              </div>
            </div>

            {/* Book button */}
            {user ? (
              <button
                onClick={() => navigate(`/book/${land._id}`)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" /> Book Now
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Login to Book
              </button>
            )}

            {/* Owner info */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-slate-500">Listed by</p>
              <p className="font-medium">{land.owner?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
