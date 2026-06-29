import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Package, Users, ShoppingCart, DollarSign, Wrench, TrendingUp, BarChart3, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, authLoaded, fetchAdminStats, fetchAdminOrders, fetchMaintenanceRequests, updateMaintenanceStatus } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingId, setUpdatingId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoaded) return; // Wait for auth to restore from localStorage
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [user, authLoaded]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [s, o, m] = await Promise.all([fetchAdminStats(), fetchAdminOrders(), fetchMaintenanceRequests()]);
      setStats(s);
      setOrders(o);
      setMaintenance(m);
    } catch (e) {
      toast.error('Failed to load admin data');
    }
    setLoadingData(false);
  };

  const handleMarkDone = async (requestId) => {
    setUpdatingId(requestId);
    try {
      await updateMaintenanceStatus(requestId, 'resolved');
      toast.success('Marked as resolved');
      // Refresh maintenance list
      const updated = await fetchMaintenanceRequests();
      setMaintenance(updated);
      // Refresh stats
      const s = await fetchAdminStats();
      setStats(s);
    } catch (e) {
      toast.error('Failed to update status');
    }
    setUpdatingId(null);
  };

  const handleMarkInProgress = async (requestId) => {
    setUpdatingId(requestId);
    try {
      await updateMaintenanceStatus(requestId, 'in_progress');
      toast.success('Marked as in progress');
      const updated = await fetchMaintenanceRequests();
      setMaintenance(updated);
    } catch (e) {
      toast.error('Failed to update status');
    }
    setUpdatingId(null);
  };

  // Show nothing until auth is loaded (prevents flash redirect)
  if (!authLoaded) return null;
  if (!user || user.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Rentals', value: stats.activeRentals || 0, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Monthly Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Pending Maintenance', value: stats.pendingMaintenance || 0, icon: Wrench, color: 'bg-orange-50 text-orange-600' },
  ];

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Monitor and manage your platform</p>
          </div>
          <button onClick={loadAdminData}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <BarChart3 size={18} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-2">
          {['overview', 'orders', 'maintenance'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {statCards.map(card => (
                    <div key={card.label} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <card.icon size={20} />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                      <div className="text-sm text-gray-500">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary-600" />
                    <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Order ID</th>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Items</th>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Monthly</th>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                          <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400">No orders yet</td></tr>
                        ) : orders.slice(0, 10).map(order => (
                          <tr key={order.id} className="border-t border-gray-50">
                            <td className="px-6 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-3">{order.items.length} item(s)</td>
                            <td className="px-6 py-3 font-medium">₹{order.totalMonthly}</td>
                            <td className="px-6 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">All Orders ({orders.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Order ID</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Items</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Monthly</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Deposit</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-gray-400">No orders yet</td></tr>
                      ) : orders.map(order => (
                        <tr key={order.id} className="border-t border-gray-50">
                          <td className="px-6 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-3">{order.items.map(i => i.name).join(', ')}</td>
                          <td className="px-6 py-3 font-medium">₹{order.totalMonthly}</td>
                          <td className="px-6 py-3">₹{order.totalDeposit}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-500">{order.deliveryDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Maintenance Requests ({maintenance.length})</h2>
                </div>
                {maintenance.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No maintenance requests</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {maintenance.map(req => (
                      <div key={req.id} className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status] || 'bg-gray-100 text-gray-600'}`}>
                              {statusLabels[req.status] || req.status}
                            </span>
                            <span className="text-xs text-gray-400">Order: {req.orderId?.slice(0, 8)}</span>
                          </div>
                          <p className="text-gray-800 font-medium">{req.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          {req.status === 'pending' && (
                            <>
                              <button onClick={() => handleMarkInProgress(req.id)} disabled={updatingId === req.id}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                                {updatingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />}
                                Start
                              </button>
                              <button onClick={() => handleMarkDone(req.id)} disabled={updatingId === req.id}
                                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                                {updatingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                Mark Done
                              </button>
                            </>
                          )}
                          {req.status === 'in_progress' && (
                            <button onClick={() => handleMarkDone(req.id)} disabled={updatingId === req.id}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                              {updatingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Mark Done
                            </button>
                          )}
                          {req.status === 'resolved' && (
                            <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                              <CheckCircle size={14} /> Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
