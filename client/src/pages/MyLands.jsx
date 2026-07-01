import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Car, PlusCircle, Check, X, Clock, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MyLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const { data } = await api.get('/lands/my');
        setLands(data.lands || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this land? This cannot be undone.')) return;
    try {
      await api.delete(`/lands/${id}`);
      setLands(lands.filter((l) => l._id !== id));
      toast.success('Land deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    pending: <Clock className="w-3 h-3" />,
    approved: <Check className="w-3 h-3" />,
    rejected: <X className="w-3 h-3" />,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Lands</h1>
        <Link
          to="/register-land"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Add New Land
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : lands.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">You haven't listed any land yet.</p>
          <Link to="/register-land" className="text-blue-600 hover:underline">Register your first land</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {lands.map((land) => (
            <div key={land._id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {land.images?.[0] ? (
                      <img src={land.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{land.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {land.location?.city}, {land.location?.state}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-bold text-blue-600">₹{land.pricePerHour}/hr</span>
                      <span className="text-green-600">{land.totalSpots} spots</span>
                      {land.averageRating > 0 && (
                        <span className="text-yellow-600">★ {land.averageRating}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[land.status]}`}>
                  {statusIcons[land.status]} {land.status}
                </span>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                <Link to={`/land/${land._id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View
                </Link>
                {land.status === 'approved' && (
                  <span className="text-sm text-green-600">Live</span>
                )}
                {land.status === 'rejected' && (
                  <span className="text-sm text-red-600">Rejected — please edit and resubmit</span>
                )}
                <button
                  onClick={() => handleDelete(land._id)}
                  className="text-sm text-red-600 hover:underline ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
