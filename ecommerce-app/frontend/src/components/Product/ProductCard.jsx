import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-surface-muted overflow-hidden">
          <img
            src={product.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`;
            }}
          />
          {product.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-brand-600 text-white">Featured</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="badge bg-gray-800 text-white text-sm px-3 py-1.5">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{product.category}</span>
          <h3 className="mt-1 font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              disabled={loading || isOutOfStock || added}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                added
                  ? 'bg-green-100 text-green-700'
                  : isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
              }`}
            >
              {added ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <p className="mt-1.5 text-xs text-amber-600 font-medium">Only {product.stock} left</p>
          )}
        </div>
      </div>
    </Link>
  );
}