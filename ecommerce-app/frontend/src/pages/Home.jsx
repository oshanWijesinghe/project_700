import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/Product/ProductCard';
import { Spinner } from '../components/UI';

const CATEGORIES = ['Electronics', 'Accessories', 'Home & Kitchen', 'Bags', 'Footwear', 'Plants'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?featured=true&limit=4')
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
              ✨ New arrivals every week
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Products<br />You'll Love
            </h1>
            <p className="text-brand-100 text-lg mb-8 max-w-lg">
              Curated collections of premium products delivered to your door. Quality you can feel, prices you'll appreciate.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all active:scale-95 shadow-lg">
                Shop Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all active:scale-95">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-surface-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '4.9★', label: 'Average Rating' },
              { value: 'Free', label: 'Returns' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-brand-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-sm text-brand-600 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-surface-border hover:border-brand-300 hover:shadow-card transition-all duration-200 cursor-pointer"
            >
              <span className="text-2xl">{getCategoryEmoji(cat)}</span>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-600 text-center transition-colors">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-brand-600 font-semibold hover:underline">See all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Ready to start shopping?</h2>
            <p className="text-gray-300 text-sm">Join thousands of happy customers today.</p>
          </div>
          <Link to="/register" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 transition-all active:scale-95 shadow-soft">
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = {
    'Electronics': '⚡', 'Accessories': '👜', 'Home & Kitchen': '🏠',
    'Bags': '🎒', 'Footwear': '👟', 'Plants': '🌿',
  };
  return map[cat] || '🛍️';
}