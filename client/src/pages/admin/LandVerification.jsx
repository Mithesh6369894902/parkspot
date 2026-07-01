import { useState, useEffect } from 'react';
import { MapPin, Check, X, Car, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function LandVerification() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const { data } = await api.get('/admin/lands/pending');
      setLands(data.lands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (landId, status, reason = '') => {
    setActionLoading(landId);
    try {
      await api.put(`/admin/lands/${landId}/verify`, { status, reason });
      setLands(lands.filter((l) => l._id !== landId));
      toast.success(`Land ${status}`);
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (landId) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    await handleVerify(landId, 'rejected', reason || 'Does not meet requirements');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Land Verification</h1>
      <p className="text-slate-500 mb-6">Review and approve pending land listings</p>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : lands.length === 0 ? (
        <div className="text-center py-12">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-slate-500">All caught up! No pending lands to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lands.map((land) => (
            <div key={land._id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {land.images?.[0] ? (
                    <img src={land.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Car className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{land.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {land.location?.address}, {land.location?.city}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                      Pending Review
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-3 line-clamp-2">{land.description}</p>

                  <div className="flex flex-wrap gap-3 mt-3 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">₹{land.pricePerHour}/hr</span>
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{land.totalSpots} spots</span>
                    <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded">{land.areaSqFt?.toLocaleString()} sq ft</span>
                    <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded">{land.twoWheelerSpots} 🏍 | {land.fourWheelerSpots} 🚗</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Owner: {land.owner?.name} ({land.owner?.email})
                  </p>

                  {land.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {land.amenities.map((a, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{a}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleVerify(land._id, 'approved')}
                      disabled={actionLoading === land._id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(land._id)}
                      disabled={actionLoading === land._id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
