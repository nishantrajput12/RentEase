import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Armchair, Cog, Truck, ShieldCheck, ChevronRight, Star, ArrowRight, Package, Clock, Headphones } from 'lucide-react';

const categories = [
  { name: 'Furniture', icon: Armchair, desc: 'Beds, sofas, tables & more', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Appliances', icon: Cog, desc: 'Fridge, TV, washing machine', color: 'bg-blue-50 text-blue-600' },
];

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'Free delivery & pickup at your doorstep' },
  { icon: ShieldCheck, title: 'Hassle-Free', desc: 'No hidden charges, transparent pricing' },
  { icon: Clock, title: 'Flexible Plans', desc: 'Rent for 3, 6, or 12 months' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock maintenance support' },
];

const testimonials = [
  { name: 'Rahul S.', role: 'Software Engineer', text: 'RentEase made my Bangalore relocation so easy. Got everything delivered the next day!', rating: 5 },
  { name: 'Priya M.', role: 'MBA Student', text: 'Affordable and quality furniture. Perfect for hostel life. Highly recommended!', rating: 5 },
  { name: 'Amit K.', role: 'Marketing Manager', text: 'The flexibility to upgrade or return is amazing. Best rental platform in the city.', rating: 4 },
];

export default function Home() {
  const { fetchProducts } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts('All', searchQuery);
    navigate('/products?search=' + searchQuery);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Rent Furniture<br />& Appliances<br />
              <span className="text-yellow-300">Effortlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 leading-relaxed">
              Premium furniture and appliances on monthly rental. No upfront cost, free delivery, flexible tenure. Perfect for students and working professionals.
            </p>
            <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden shadow-xl max-w-lg">
              <input
                type="text"
                placeholder="Search beds, sofas, fridge, TV..."
                className="flex-1 px-5 py-4 text-gray-800 outline-none text-sm md:text-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-4 font-semibold transition flex items-center gap-2">
                Search <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10K+', 'Happy Customers'], ['500+', 'Products'], ['15+', 'Cities'], ['4.8', 'Avg Rating']].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-bold text-primary-700">{num}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Browse by Category</h2>
          <p className="text-gray-500 text-center mb-10">Find everything you need to make a house a home</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`}
                className="bg-white rounded-2xl p-8 flex items-center gap-6 card-hover shadow-sm hover:shadow-lg border border-gray-100">
                <div className={`${cat.color} p-4 rounded-xl`}>
                  <cat.icon size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{cat.name}</h3>
                  <p className="text-gray-500">{cat.desc}</p>
                </div>
                <ArrowRight className="ml-auto text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-gray-500 text-center mb-12">Get started in 3 simple steps</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Browse & Select', desc: 'Explore our catalog and pick the items you need' },
              { step: '02', title: 'Choose Plan', desc: 'Select your preferred rental tenure — 3, 6, or 12 months' },
              { step: '03', title: 'Get Delivered', desc: 'We deliver to your doorstep. Enjoy hassle-free living!' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RentEase?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center">
                <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={28} />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-green-200 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-800">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Package size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Start Renting?</h2>
          <p className="text-green-100 mb-8">Join thousands of happy customers living smarter, not heavier.</p>
          <Link to="/products" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-xl transition shadow-lg">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-3">RentEase</h3>
            <p className="text-sm">Affordable furniture & appliance rental for modern living.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link to="/products?category=Furniture" className="hover:text-white transition">Furniture</Link></li>
              <li><Link to="/products?category=Appliances" className="hover:text-white transition">Appliances</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@rentease.com</li>
              <li>+91 98765 43210</li>
              <li>Bangalore, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          &copy; 2025 RentEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
