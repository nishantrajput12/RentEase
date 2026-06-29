import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover group">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-4 py-1 rounded-full text-sm">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full text-gray-700">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-700">&#8377;{product.monthlyRent}</span>
            <span className="text-gray-400 text-sm">/mo</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Deposit</div>
            <div className="text-sm font-medium text-gray-600">&#8377;{product.securityDeposit}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
