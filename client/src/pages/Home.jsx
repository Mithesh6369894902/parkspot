import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Car,
  Shield,
  CreditCard,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Search,
  LocateFixed,
  ShieldCheck,
  BadgeCheck,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { imageUrl } from '../utils/geo';
import Logo from '../components/common/Logo';

export default function Home() {
  const [featuredLands, setFeaturedLands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const jumpToCity = (cityName) => {
    navigate(`/explore?search=${encodeURIComponent(cityName)}`);
  };

  const sampleCard = featuredLands[0] || {
    title: 'Green Field Parking - Connaught Place',
    location: { city: 'New Delhi', state: 'Delhi' },
    pricePerHour: 80,
    totalSpots: 150,
    twoWheelerSpots: 90,
    fourWheelerSpots: 60,
    averageRating: 4.9,
  };

  return (
    <div className="overflow-hidden">
      {/* 🌟 WOW OPENING / HERO SECTION */}
      <section className="relative bg-[#090d16] text-white pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient Glowing Blobs */}
        <div className="absolute -top-32 -left-20 w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

        {/* Tech Grid Pattern Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 text-left">
              {/* Radar Live Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-lg shadow-black/30 backdrop-blur-md text-xs font-bold text-cyan-300 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="tracking-wide uppercase font-extrabold text-[11px] text-slate-200">
                  Real-Time Parking Discovery
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> 100% Verified Grounds
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white mb-6">
                Park Without Stress.{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  Book In 60 Seconds.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300/90 font-normal leading-relaxed max-w-xl mb-8">
                Connect directly with verified land owners near busy event venues, wedding halls, tech parks, and markets. Guaranteed spot, live GPS directions, and instant QR check-in.
              </p>

              {/* Interactive Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} className="mb-6 max-w-xl">
                <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-3 px-3 py-2">
                    <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city or venue (e.g. Connaught Place, HSR Bangalore)..."
                      className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>Find Spots</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      to="/explore"
                      title="Locate nearest parking via GPS"
                      className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition border border-slate-700"
                    >
                      <LocateFixed className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </form>

              {/* Popular Quick-Jump City Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
                <span className="text-slate-500 flex items-center gap-1 font-bold">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> Hotspots:
                </span>
                {['Delhi • CP', 'Bangalore • HSR', 'Noida • Sec 62', 'Jaipur • Malviya'].map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToCity(city.split('•')[0].trim())}
                    className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-slate-300 hover:text-white transition"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <MapPin className="w-5 h-5 text-cyan-200" />
                  <span>Launch Live Map</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 text-white font-bold text-base border border-slate-700/80 backdrop-blur-md hover:-translate-y-0.5 transition-all shadow-lg"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>List Your Land & Earn</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Live Parking Showcase Widget */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Trust Badge 1 */}
                <div className="absolute -top-6 -left-6 z-20 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl shadow-black/50 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">100% Refund Guarantee</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">Protected Reservations</div>
                  </div>
                </div>

                {/* Main Glass Simulation Card */}
                <div className="relative rounded-3xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-xl p-6 shadow-2xl shadow-blue-950/60 overflow-hidden">
                  {/* Subtle Inner Glow */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                        Live Spot Availability
                      </span>
                    </div>
                    <span className="bg-slate-800/90 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                      ⚡ 24 Spots Left
                    </span>
                  </div>

                  {/* Ground Image with Badges */}
                  <div className="h-48 rounded-2xl bg-slate-800 relative overflow-hidden mb-5 group">
                    <img
                      src={
                        sampleCard.images?.[0]
                          ? imageUrl(sampleCard.images[0])
                          : 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={sampleCard.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div>
                        <div className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {sampleCard.location?.city || 'New Delhi'}
                        </div>
                        <div className="text-white font-extrabold text-sm truncate max-w-[200px]">
                          {sampleCard.title}
                        </div>
                      </div>
                      <div className="bg-slate-950/90 text-white font-black text-sm px-3 py-1.5 rounded-xl border border-slate-700 shadow-md">
                        ₹{sampleCard.pricePerHour || 80}/hr
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <BadgeCheck className="w-3.5 h-3.5" /> Tier 3 Verified
                    </div>
                  </div>

                  {/* Vehicle Bays Breakdown */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        🚗
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Cars</div>
                        <div className="text-sm font-black text-white">60 Bays</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        🏍️
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Bikes</div>
                        <div className="text-sm font-black text-white">90 Bays</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Ticker */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Booked 4 mins ago by driver</span>
                    </div>
                    <Link
                      to={`/land/${sampleCard._id || 'seed'}`}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      Instant Book →
                    </Link>
                  </div>
                </div>

                {/* Floating Rating Pill 2 */}
                <div className="absolute -bottom-5 -right-5 z-20 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl shadow-black/50 animate-float-delayed">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-xs font-black text-white">4.9/5 Trust Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 STATS STRIP */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-heading">500+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Verified Lands</div>
          </div>
          <div className="text-center group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-heading">15,000+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Happy Drivers</div>
          </div>
          <div className="text-center group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <Car className="w-7 h-7" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-heading">50K+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Hours Parked</div>
          </div>
          <div className="text-center group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-heading">₹75L+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Earned by Owners</div>
          </div>
        </div>
      </section>

      {/* 🚀 HOW IT WORKS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" /> Simple 3-Step Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              How ParkSpot Works
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Zero wandering around looking for parking. Find, reserve, and park seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-xl">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 font-heading text-slate-900">1. Discover on Map</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Open our live interactive map, filter by your vehicle type (Car or Bike), and view verified grounds within 5–50km.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-xl">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 font-heading text-slate-900">2. Real-Time Booking</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Select your time slot. Live availability guarantees your spot is waiting with transparent, surge-free pricing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 font-heading text-slate-900">3. Pay & QR Check-In</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pay instantly via UPI, GPay, Paytm, or cards. Get a digital QR pass for rapid gate entry and peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💼 FOR LAND OWNERS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Monetize Your Property
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              Turn Empty Land into Daily Income
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Have vacant plots near marriage halls, tech corridors, or commercial centers? Start earning effortless rental revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <MapPin className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', title: 'Draw Boundary on GPS Map', desc: 'Pinpoint your exact plot borders using our intuitive satellite map picker.' },
              { icon: <Car className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50', title: 'Automated Spot Calculation', desc: 'Our algorithm automatically calculates optimal 2-wheeler and 4-wheeler layout capacity.' },
              { icon: <TrendingUp className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50', title: 'Dynamic Multiplier Pricing', desc: 'Earn peak rates during local weekend festivals, exhibitions, and weddings.' },
              { icon: <ShieldCheck className="w-6 h-6 text-cyan-600" />, bg: 'bg-cyan-50', title: 'Direct Bank & UPI Payouts', desc: 'Receive secure automated payouts straight to your registered account via Razorpay.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100/70 transition">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1 font-heading">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>List Your Property Today</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 📍 FEATURED LANDS */}
      {featuredLands.length > 0 && (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-blue-600 mb-2">Verified Destinations</div>
                <h2 className="text-3xl font-black text-slate-900 font-heading">
                  Featured Parking Grounds
                </h2>
              </div>
              <Link
                to="/explore"
                className="mt-4 md:mt-0 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-sm"
              >
                <span>View all on map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredLands.map((land) => (
                <Link
                  key={land._id}
                  to={`/land/${land._id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all border border-slate-200/80 group flex flex-col"
                >
                  <div className="h-52 bg-slate-200 relative overflow-hidden">
                    {land.images?.[0] ? (
                      <img
                        src={imageUrl(land.images[0])}
                        alt={land.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300 bg-slate-100">
                        <Car className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-md border border-slate-700">
                      ₹{land.pricePerHour}/hr
                    </div>
                    {land.verificationDetails?.verificationTier !== 'unverified' && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors font-heading truncate">
                        {land.title}
                      </h3>
                      <p className="text-slate-500 text-xs mb-4 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> {land.location?.city}, {land.location?.state}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-slate-100">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                        {land.totalSpots} Total Spots
                      </span>
                      {land.averageRating > 0 ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {land.averageRating}
                        </span>
                      ) : (
                        <span className="text-slate-400">Newly Listed</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🌟 FINAL CALL TO ACTION */}
      <section className="relative py-24 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Sparkles className="w-8 h-8 text-cyan-300" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 font-heading tracking-tight">
            Ready for Smarter Parking?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of smart drivers and land owners on India's premier parking rental network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition shadow-2xl hover:scale-105"
            >
              Explore Live Map Now
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/80 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/10 transition"
            >
              Register Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
