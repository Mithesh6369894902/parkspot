import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Car, Shield, CreditCard, Star, Users, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({ lands: 0, users: 0, bookings: 0 });
  const [featuredLands, setFeaturedLands] = useState([]);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const { data } = await api.get('/lands');
        setFeaturedLands(data.lands?.slice(0, 6) || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLands();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Parking Land for Your Next Event
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Connect with land owners who have space. Book parking lands for weddings,
              conferences, and large gatherings — instantly and securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/explore"
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
              >
                Explore Map
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition text-center"
              >
                List Your Land
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">500+</div>
            <div className="text-sm text-slate-500">Parking Lands</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">2000+</div>
            <div className="text-sm text-slate-500">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">10K+</div>
            <div className="text-sm text-slate-500">Vehicles Parked</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">₹50L+</div>
            <div className="text-sm text-slate-500">Paid to Land Owners</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How ParkSpot Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover on Map</h3>
              <p className="text-slate-500 text-sm">Browse available parking lands near your event location on an interactive map.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Book Instantly</h3>
              <p className="text-slate-500 text-sm">Select your dates, vehicle type, and count. See real-time pricing and availability.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pay Securely</h3>
              <p className="text-slate-500 text-sm">Pay via UPI, GPay, Paytm, or cards. Get instant confirmation with QR code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Land Owners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Own Empty Land? Make Money!</h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
            List your vacant land on ParkSpot and earn rental income from event organizers who need temporary parking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <MapPin className="w-5 h-5" />, title: 'Draw Your Land on Map', desc: 'Mark your land boundary directly on the map' },
              { icon: <Car className="w-5 h-5" />, title: 'Auto Capacity Calculation', desc: 'System auto-calculates two-wheeler and four-wheeler spots' },
              { icon: <TrendingUp className="w-5 h-5" />, title: 'Dynamic Pricing', desc: 'Set peak hour and weekend multipliers for maximum earnings' },
              { icon: <Shield className="w-5 h-5" />, title: 'Secure Payments', desc: 'Receive payments directly to your Razorpay account' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lands */}
      {featuredLands.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Parking Lands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLands.map((land) => (
                <Link
                  key={land._id}
                  to={`/land/${land._id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="h-48 bg-slate-200 relative">
                    {land.images?.[0] ? (
                      <img src={land.images[0]} alt={land.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <Car className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ₹{land.pricePerHour}/hr
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{land.title}</h3>
                    <p className="text-slate-500 text-sm mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {land.location?.city}, {land.location?.state}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">{land.totalSpots} spots</span>
                      {land.averageRating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-3 h-3 fill-yellow-400" /> {land.averageRating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8">
            Join thousands of land owners and event organizers using ParkSpot for smart parking solutions.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
