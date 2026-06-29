import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { Search } from 'lucide-react';

const categories = ['All', 'Furniture', 'Appliances'];
const subcategories = {
  All: [],
  Furniture: ['All', 'Bedroom', 'Living Room'],
  Appliances: ['All', 'Kitchen', 'Entertainment', 'Bedroom'],
};

export default function Products() {
  const { products, loading, fetchProducts } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeSub, setActiveSub] = useState('All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [hasLoaded, setHasLoaded] = useState(products.length > 0);

  // Fetch on mount if products aren't already loaded, and on category change
  useEffect(() => {
    // Always fetch to ensure we have latest data
    fetchProducts(activeCategory, search).then(() => setHasLoaded(true));
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(activeCategory, search).then(() => setHasLoaded(true));
  };

  const filtered = activeSub === 'All' ? products : products.filter(p => p.subcategory === activeSub);
  const showSkeleton = loading && products.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
          <p className="text-gray-500">Quality furniture & appliances at affordable monthly rates</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
            <input type="text" placeholder="Search products..." className="flex-1 px-4 py-3 outline-none text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 transition">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setActiveSub('All'); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {subcategories[activeCategory]?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {subcategories[activeCategory].map(sub => (
              <button key={sub} onClick={() => setActiveSub(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === sub ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid - only show skeletons if we have no products yet */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && hasLoaded ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No products found</p>
            <button onClick={() => { setActiveCategory('All'); setActiveSub('All'); setSearch(''); fetchProducts('All'); }}
              className="text-primary-600 font-medium hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
