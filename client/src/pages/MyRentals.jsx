import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Package, Calendar, MapPin, Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRentals() {
  const { user, orders, fetchUserOrders, requestMaintenance } = useApp();
  const navigate = useNavigate();
  const [maintId, setMaintId] = useState(null);
  const [maintDesc, setMaintDesc] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchUserOrders(user.id);
  }, [user]);

  const handleMaintenance = async (orderId) => {
    if (!maintDesc.trim()) { toast.error('Please describe the issue'); return; }
    await requestMaintenance(orderId, maintDesc);
    toast.success('Maintenance request submitted');
    setMaintId(null);
    setMaintDesc('');
  };

  const statusColor = { active: 'bg-green-100 text-green-700', returned: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

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
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.deliveryDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {order.address?.slice(0, 30)}...</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.tenure} months &bull; Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-700">&#8377;{item.monthlyRent}/mo</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex flex-wrap justify-between items-center border-t pt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Monthly: </span>
                    <span className="font-semibold">&#8377;{order.totalMonthly}</span>
                    <span className="text-gray-500 ml-3">Deposit: </span>
                    <span className="font-semibold">&#8377;{order.totalDeposit}</span>
                  </div>

                  {order.status === 'active' && (
                    <div>
                      {maintId === order.id ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Describe the issue..." value={maintDesc}
                            onChange={e => setMaintDesc(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-400 w-48" />
                          <button onClick={() => handleMaintenance(order.id)} className="bg-primary-600 text-white text-sm px-3 py-1.5 rounded-lg">Submit</button>
                          <button onClick={() => setMaintId(null)} className="text-gray-400 text-sm px-2">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setMaintId(order.id)}
                          className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
                          <Wrench size={14} /> Request Maintenance
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
