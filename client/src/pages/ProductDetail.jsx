import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Star, ShieldCheck, Truck, RotateCcw, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const [product, setProduct] = useState(null);
  const [selectedTenure, setSelectedTenure] = useState(6);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct);
  }, [id]);

  if (!product) return (
    <div className="min-h-screen"><Navbar /><div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div></div>
  );

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    addToCart(product, selectedTenure, quantity);
    toast.success('Added to cart!');
  };

  const totalCost = (product.monthlyRent * selectedTenure + product.securityDeposit) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={18} /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">{product.category}</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{product.subcategory}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} rating</span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Monthly Rent</div>
                  <div className="text-2xl font-bold text-primary-700">&#8377;{product.monthlyRent}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Security Deposit</div>
                  <div className="text-2xl font-bold text-gray-700">&#8377;{product.securityDeposit}</div>
                  <div className="text-xs text-gray-400">Refundable</div>
                </div>
              </div>

              {/* Tenure */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Rental Tenure</div>
                <div className="flex gap-2">
                  {product.tenure.map(t => (
                    <button key={t} onClick={() => setSelectedTenure(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition border ${selectedTenure === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                      {t} Months
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Quantity</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">-</button>
                  <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total for {selectedTenure} months</span>
                  <span className="text-xl font-bold text-gray-800">&#8377;{totalCost.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Includes &#8377;{product.securityDeposit * quantity} refundable deposit</div>
              </div>
            </div>

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={!product.inStock}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary-200">
              <ShoppingCart size={20} />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: ShieldCheck, label: 'Quality Assured' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map(f => (
                <div key={f.label} className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <f.icon size={18} className="mx-auto text-primary-600 mb-1" />
                  <div className="text-xs text-gray-500">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
