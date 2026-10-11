import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, BookOpen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Logo size="md" showTagline={false} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              to="/explore"
              className="text-slate-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1.5 transition-colors group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <MapPin className="w-4 h-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span>Explore Map</span>
            </Link>

            {user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link
                      to="/register-land"
                      className="text-slate-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>List Land</span>
                    </Link>
                    <Link
                      to="/my-lands"
                      className="text-slate-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>My Lands</span>
                    </Link>
                  </>
                )}
                <Link
                  to="/my-bookings"
                  className="text-slate-600 hover:text-blue-600 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Bookings</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-2.5 py-1 rounded-full transition-colors"
                  >
                    Admin Console
                  </Link>
                )}
                <div className="h-5 w-px bg-slate-200" />
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-1.5 rounded-full font-bold text-xs transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xs">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-blue-600 font-bold text-sm px-4 py-2 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 mt-2 pt-3 space-y-2">
            <Link to="/explore" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
              Explore Map
            </Link>
            {user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link to="/register-land" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
                      List Land
                    </Link>
                    <Link to="/my-lands" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
                      My Lands
                    </Link>
                  </>
                )}
                <Link to="/my-bookings" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
                  My Bookings
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
