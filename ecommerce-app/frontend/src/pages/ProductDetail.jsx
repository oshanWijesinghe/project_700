import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingPage, Alert } from '../components/UI';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      setMessage({ type: 'success', text: '🎉 Added to cart!' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <LoadingPage />;
  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-surface-muted border border-surface-border">
          <img
            src={product.image_url || `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`; }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start gap-2 mb-3">
            <span className="badge bg-brand-50 text-brand-600">{product.category}</span>
            {product.is_featured && <span className="badge bg-amber-50 text-amber-600">⭐ Featured</span>}
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
          <p className="text-gray-500 leading-relaxed mb-6">{product.description || 'No description available.'}</p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="mb-6">
            {isOutOfStock ? (
              <span className="badge bg-red-50 text-red-600 text-sm px-3 py-1.5">Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="badge bg-amber-50 text-amber-600 text-sm px-3 py-1.5">⚠️ Only {product.stock} left</span>
            ) : (
              <span className="badge bg-green-50 text-green-600 text-sm px-3 py-1.5">✓ In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-semibold text-gray-600">Quantity</label>
              <div className="flex items-center border border-surface-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-surface-muted transition-colors"
                >−</button>
                <span className="w-12 text-center text-sm font-semibold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-surface-muted transition-colors"
                >+</button>
              </div>
            </div>
          )}

          {/* Alert */}
          {message && <div className="mb-4"><Alert type={message.type} message={message.text} /></div>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || isOutOfStock}
              className="flex-1 btn-primary justify-center py-3 text-base"
            >
              {cartLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <Link to="/cart" className="btn-secondary px-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
          </div>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: '🚚', text: 'Free shipping over $100' },
              { icon: '↩️', text: '30-day easy returns' },
              { icon: '🔒', text: 'Secure checkout' },
              { icon: '✓', text: 'Quality guaranteed' },
            ].map((perk) => (
              <div key={perk.text} className="flex items-center gap-2 text-sm text-gray-500">
                <span>{perk.icon}</span>
                <span>{perk.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}