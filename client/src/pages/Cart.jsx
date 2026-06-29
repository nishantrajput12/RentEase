import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Trash2, ShoppingCart, ArrowRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, clearCart, placeOrder, user } = useApp();
  const navigate = useNavigate();
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [checkout, setCheckout] = useState(false);

  const totalMonthly = cart.reduce((sum, i) => sum + i.monthlyRent * i.quantity, 0);
  const totalDeposit = cart.reduce((sum, i) => sum + i.securityDeposit * i.quantity, 0);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!deliveryDate || !address) { toast.error('Please fill all fields'); return; }
    try {
      await placeOrder(deliveryDate, address);
      toast.success('Order placed successfully!');
      navigate('/my-rentals');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
        <Link to="/products" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition">
          Browse Products
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={`${item.productId}-${item.tenure}`} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.tenure} months tenure &bull; Qty: {item.quantity}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-primary-700 font-semibold">&#8377;{item.monthlyRent}/mo</span>
                    <span className="text-gray-400 text-sm">Deposit: &#8377;{item.securityDeposit}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.productId, item.tenure)} className="p-2 text-gray-400 hover:text-red-500 transition self-start">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Total</span>
                  <span className="font-medium">&#8377;{totalMonthly}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Security Deposit</span>
                  <span className="font-medium">&#8377;{totalDeposit}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">First Month + Deposit</span>
                  <span className="font-bold text-lg text-primary-700">&#8377;{(totalMonthly + totalDeposit).toLocaleString()}</span>
                </div>
              </div>

              {!checkout ? (
                <button onClick={() => { if (!user) { toast.error('Please login first'); navigate('/login'); return; } setCheckout(true); }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              ) : (
                <form onSubmit={handleOrder} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Date</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400"
                      value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Address</label>
                    <textarea rows={3} placeholder="Enter your full address..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 resize-none"
                      value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl transition">
                    Place Order
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
