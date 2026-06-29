import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Package, Calendar, MapPin, Wrench, CheckCircle, Clock, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRentals() {
  const { user, orders, fetchUserOrders, requestMaintenance, maintenanceRequests, fetchMaintenanceRequests } = useApp();
  const navigate = useNavigate();
  const [maintId, setMaintId] = useState(null);
  const [maintDesc, setMaintDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { 
      navigate('/login'); 
      return; 
    }
    // Fetch orders and maintenance requests
    fetchUserOrders(user.id);
    fetchMaintenanceRequests();
  }, [user]);

  // Get maintenance status for a specific order
  const getOrderMaintenance = (orderId) => {
    const requests = maintenanceRequests.filter(r => r.orderId === orderId);
    if (requests.length === 0) return null;
    // Return the most recent request
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  const handleMaintenance = async (orderId) => {
    if (!maintDesc.trim()) { 
      toast.error('Please describe the issue'); 
      return; 
    }
    setSubmitting(true);
    try {
      await requestMaintenance(orderId, maintDesc);
      toast.success('Maintenance request submitted! Admin will review it.');
      setMaintId(null);
      setMaintDesc('');
      // Refresh maintenance requests
      fetchMaintenanceRequests();
    } catch (e) {
      toast.error('Failed to submit request. Please try again.');
    }
    setSubmitting(false);
  };

  const statusColor = { 
    active: 'bg-green-100 text-green-700 border-green-200', 
    returned: 'bg-blue-100 text-blue-700 border-blue-200', 
    cancelled: 'bg-red-100 text-red-700 border-red-200' 
  };

  const maintStatusStyle = {
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    in_progress: 'bg-blue-50 border-blue-200 text-blue-800',
    resolved: 'bg-green-50 border-green-200 text-green-800',
  };

  const maintStatusIcon = {
    pending: Clock,
    in_progress: Wrench,
    resolved: CheckCircle,
  };

  const maintStatusLabels = {
    pending: 'Pending Review',
    in_progress: 'Being Fixed',
    resolved: 'Resolved',
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Rentals</h1>
        <p className="text-gray-500 mb-8">Manage your active and past rentals</p>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No rentals yet</h2>
            <p className="text-gray-500 mb-6">Start browsing our products to place your first order</p>
            <Link to="/products" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const maintRequest = getOrderMaintenance(order.id);
              const MaintIcon = maintRequest ? maintStatusIcon[maintRequest.status] : null;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> 
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> 
                        {order.address?.slice(0, 30)}{order.address?.length > 30 ? '...' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.tenure} months &bull; Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary-700">₹{item.monthlyRent}/mo</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Monthly: </span>
                        <span className="font-semibold text-gray-800">₹{order.totalMonthly}</span>
                        <span className="text-gray-500 ml-3">Deposit: </span>
                        <span className="font-semibold text-gray-800">₹{order.totalDeposit}</span>
                      </div>
                    </div>

                    {/* Maintenance Status Banner - Show if maintenance request exists */}
                    {maintRequest && (
                      <div className={`px-4 py-3 rounded-lg border ${maintStatusStyle[maintRequest.status]}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            {MaintIcon && <MaintIcon size={18} className="mt-0.5 shrink-0" />}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  Maintenance: {maintStatusLabels[maintRequest.status]}
                                </span>
                              </div>
                              <p className="text-sm opacity-90">{maintRequest.description}</p>
                              <p className="text-xs opacity-70 mt-1">
                                Submitted: {new Date(maintRequest.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Maintenance Request Button/ Form */}
                    {order.status === 'active' && (
                      <div>
                        {maintId === order.id ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <input 
                              type="text" 
                              placeholder="Describe the issue (e.g., AC not cooling, TV not working)..."
                              value={maintDesc} 
                              onChange={e => setMaintDesc(e.target.value)}
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 flex-1 min-w-48"
                              onKeyDown={e => e.key === 'Enter' && handleMaintenance(order.id)}
                            />
                            <button 
                              onClick={() => handleMaintenance(order.id)} 
                              disabled={submitting}
                              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
                              Submit
                            </button>
                            <button 
                              onClick={() => { setMaintId(null); setMaintDesc(''); }}
                              className="text-gray-400 hover:text-gray-600 text-sm px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setMaintId(order.id)}
                            className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            <Wrench size={14} /> 
                            {maintRequest ? 'Submit Another Request' : 'Request Maintenance'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
