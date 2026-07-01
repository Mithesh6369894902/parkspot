import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Car className="w-6 h-6" />
              ParkSpot
            </Link>
            <p className="text-sm text-slate-400">
              Connect with land owners for temporary parking solutions for events, conferences, and gatherings.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/explore" className="block hover:text-white">Explore Map</Link>
              <Link to="/register" className="block hover:text-white">List Your Land</Link>
              <Link to="/login" className="block hover:text-white">Login</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Email: support@parkspot.in</p>
              <p>Phone: +91 98765 43210</p>
              <p>India</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ParkSpot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
