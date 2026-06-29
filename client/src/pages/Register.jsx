import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Package, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <Package size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Rent<span className="text-primary-600">Ease</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
          <p className="text-gray-500">Start renting furniture & appliances</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="name" placeholder="John Doe" required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" name="email" placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" name="phone" placeholder="9876543210" required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" name="password" placeholder="Min 6 characters" required minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={form.password} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
