import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

const INITIAL_FORM = {
  full_name: '', email: '', street: '', city: '', state: '', zip: '', country: 'US',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ ...INITIAL_FORM, full_name: user?.full_name || '', email: user?.email || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const shipping = cartTotal >= 100 ? 0 : 9.99;
  const total = (cartTotal + shipping).toFixed(2);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.street || !form.city || !form.state || !form.zip) {
      setError('Please fill in all address fields.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shipping_address: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
        payment_method: 'card',
      });
      await fetchCart();
      navigate(`/orders/${data.order.id}?success=true`);
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/products" className="btn-primary mt-4">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="mb-8">
        <Link to="/cart" className="text-sm text-gray-400 hover:text-brand-600 flex items-center gap-1.5 mb-4">
          ← Back to Cart
        </Link>
        <h1 className="font-display text-3xl font-bold text-gray-900">Checkout</h1>
        {/* Steps */}
        <div className="flex items-center gap-2 mt-4">
          {['Shipping', 'Review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i === 0 ? setStep(1) : cartItems.length > 0 && setStep(2)}
                className={`flex items-center gap-2 text-sm font-semibold ${step === i + 1 ? 'text-brand-600' : 'text-gray-400'}`}
              >
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${step === i + 1 ? 'bg-brand-600 text-white' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-gray-400'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </span>
                {s}
              </button>
              {i < 1 && <div className="w-8 h-px bg-surface-border" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="card p-6 animate-fade-in">
                <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-sm flex items-center justify-center font-bold">1</span>
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input name="full_name" value={form.full_name} onChange={handleChange} className="input" placeholder="John Doe" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                      <input name="email" value={form.email} onChange={handleChange} type="email" className="input" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Street Address</label>
                    <input name="street" value={form.street} onChange={handleChange} className="input" placeholder="123 Main Street" required />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                      <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="New York" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
                      <input name="state" value={form.state} onChange={handleChange} className="input" placeholder="NY" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">ZIP Code</label>
                      <input name="zip" value={form.zip} onChange={handleChange} className="input" placeholder="10001" required />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary mt-6 w-full justify-center py-3">
                  Continue to Review →
                </button>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-sm flex items-center justify-center font-bold">2</span>
                    Review Your Order
                  </h2>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div key={item.cart_id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                        <img
                          src={item.product.image_url || 'https://placehold.co/48x48?text=img'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-surface-border"
                          onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=img'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipping to</h3>
                  <p className="text-sm text-gray-600">{form.full_name}</p>
                  <p className="text-sm text-gray-600">{form.street}, {form.city}, {form.state} {form.zip}</p>
                  <button type="button" onClick={() => setStep(1)} className="mt-2 text-xs text-brand-600 hover:underline font-medium">Edit address</button>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment</h3>
                  <div className="flex items-center gap-3 py-2 bg-surface-muted rounded-xl px-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-semibold">Credit / Debit Card</p>
                      <p className="text-xs text-gray-400">Demo — no real payment</p>
                    </div>
                  </div>
                </div>

                {error && <Alert type="error" message={error} />}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                  {loading ? 'Placing Order...' : `Place Order — $${total}`}
                </button>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div>
            <div className="card p-5 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>${total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}