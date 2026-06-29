import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, cart, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    ...(user ? [{ to: '/my-rentals', label: 'My Rentals' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Rent<span className="text-primary-600">Ease</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`text-sm font-medium transition ${location.pathname === link.to ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={isAdmin ? '/admin' : '/my-rentals'} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {user.name[0]}
                </div>
                <span className="font-medium">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 transition">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 fade-in">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className="block text-gray-700 font-medium py-2">{link.label}</Link>
          ))}
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-gray-700 font-medium py-2">
            <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 text-red-500 font-medium py-2">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-gray-300 rounded-lg py-2 text-sm font-medium">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-primary-600 text-white rounded-lg py-2 text-sm font-medium">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
