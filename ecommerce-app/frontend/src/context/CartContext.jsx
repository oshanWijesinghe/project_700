import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCartItems(data.items);
      setCartTotal(data.total);
      setCartCount(data.count);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product_id, quantity = 1) => {
    setLoading(true);
    try {
      await api.post('/cart', { product_id, quantity });
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cart_id, quantity) => {
    try {
      await api.put(`/cart/${cart_id}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (cart_id) => {
    try {
      await api.delete(`/cart/${cart_id}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems, cartTotal, cartCount, loading,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};