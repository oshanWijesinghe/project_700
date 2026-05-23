import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/UI';

export default function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="🔐"
          title="Please sign in"
          description="You need to be logged in to view your cart."
          action={<Link to="/login" className="btn-primary">Sign In</Link>}
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div key={item.cart_id} className="card p-4 flex gap-4 animate-fade-in">
              <Link to={`/products/${item.product.id}`} className="shrink-0">
                <img
                  src={item.product.image_url || `https://placehold.co/80x80?text=img`}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl border border-surface-border"
                  onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=img'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-brand-600 font-semibold">{item.product.category}</span>
                <Link to={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-800 text-sm mt-0.5 hover:text-brand-600 line-clamp-1 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ${parseFloat(item.product.price).toFixed(2)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity control */}
                  <div className="flex items-center border border-surface-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-surface-muted disabled:opacity-40 transition-colors text-sm"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-surface-muted disabled:opacity-40 transition-colors text-sm"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.cart_id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-display font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">{cartTotal >= 100 ? 'Free' : '$9.99'}</span>
              </div>
              {cartTotal < 100 && (
                <p className="text-xs text-gray-400 bg-surface-muted rounded-lg px-3 py-2">
                  Add ${(100 - cartTotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-surface-border pt-2 mt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${(cartTotal >= 100 ? cartTotal : cartTotal + 9.99).toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center mt-5 py-3">
              Proceed to Checkout →
            </Link>
            <Link to="/products" className="btn-ghost w-full justify-center mt-2 text-gray-500">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}