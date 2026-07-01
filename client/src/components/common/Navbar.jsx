import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';

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
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Car className="w-7 h-7" />
            ParkSpot
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Explore
            </Link>

            {user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link to="/register-land" className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                      <PlusCircle className="w-4 h-4" /> List Land
                    </Link>
                    <Link to="/my-lands" className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4" /> My Lands
                    </Link>
                  </>
                )}
                <Link to="/my-bookings" className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Bookings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                  <User className="w-4 h-4" /> {user.name}
                </Link>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
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
