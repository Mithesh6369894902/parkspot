import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, BookOpen, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  if (!stats) return <div className="text-center py-20">Failed to load dashboard</div>;

  const cards = [
    { label: 'Total Users', value: stats.stats?.totalUsers || 0, icon: <Users className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Lands', value: stats.stats?.totalLands || 0, icon: <MapPin className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
    { label: 'Total Bookings', value: stats.stats?.totalBookings || 0, icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Revenue', value: `₹${(stats.stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Pending Lands', value: stats.stats?.pendingLands || 0, icon: <Clock className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600' },
    { label: 'Open Disputes', value: stats.stats?.openDisputes || 0, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/verify" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-2">Land Verification</h3>
          <p className="text-sm text-slate-500">Review and approve pending land listings</p>
          {stats.stats?.pendingLands > 0 && (
            <span className="inline-block mt-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
              {stats.stats.pendingLands} pending
            </span>
          )}
        </Link>
        <Link to="/admin/verify" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-2">Dispute Resolution</h3>
          <p className="text-sm text-slate-500">Handle customer and owner disputes</p>
          {stats.stats?.openDisputes > 0 && (
            <span className="inline-block mt-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
              {stats.stats.openDisputes} open
            </span>
          )}
        </Link>
        <Link to="/admin/verify" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-2">User Management</h3>
          <p className="text-sm text-slate-500">View and manage platform users</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      {stats.recentBookings?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Land</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b._id} className="border-b last:border-0">
                    <td className="py-3">{b.customer?.name}</td>
                    <td className="py-3">{b.land?.title}</td>
                    <td className="py-3 font-medium">₹{b.totalAmount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
