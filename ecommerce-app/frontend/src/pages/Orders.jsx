import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { LoadingPage, EmptyState, Alert } from '../components/UI';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-600',
  processing: 'bg-blue-50 text-blue-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

// Order detail view
export function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!order) return <div className="text-center py-16 text-gray-400">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {isSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="font-display font-bold text-green-800 text-lg">Order Placed Successfully!</h2>
          <p className="text-green-600 text-sm mt-1">Your order is confirmed. We'll update you when it ships.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`badge px-3 py-1.5 text-sm capitalize ${STATUS_COLORS[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Items</h3>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.products?.image_url || 'https://placehold.co/48x48?text=img'}
                  alt={item.products?.name}
                  className="w-12 h-12 object-cover rounded-lg border border-surface-border"
                  onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=img'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.products?.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}</p>
                </div>
                <span className="text-sm font-bold">${(item.quantity * item.unit_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-border pt-3 mt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-700">{order.shipping_address?.street}</p>
            <p className="text-sm text-gray-700">{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order Info</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><span>Payment</span><span className="font-medium capitalize">{order.payment_method}</span></div>
              <div className="flex justify-between"><span>Date</span><span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/orders" className="btn-secondary">← All Orders</Link>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}

// Orders list
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="You haven't placed any orders. Start shopping!"
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="card p-5 block hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`badge px-2.5 py-1 text-xs capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <p className="font-bold text-gray-900 mt-2">${parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}