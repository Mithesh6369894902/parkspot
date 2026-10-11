import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="mb-4">
              <Logo size="md" variant="white" showTagline={true} />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's premier real-time parking land rental ecosystem. Connecting drivers with verified open spaces for stress-free parking at events, markets, and venues.
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
              <p className="flex items-center gap-1.5">
                <span>Email:</span>
                <a href="mailto:mithesh1892@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                  mithesh1892@gmail.com
                </a>
              </p>
              <p>Founder & Lead: Mithesh D</p>
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
