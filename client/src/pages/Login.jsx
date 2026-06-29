import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <Package size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Rent<span className="text-primary-600">Ease</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="Enter password" required
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary-400 text-sm"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <strong>Demo Accounts:</strong><br />
            User: demo@rentease.com / demo123<br />
            Admin: admin@rentease.com / admin123
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
