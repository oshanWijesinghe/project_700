const supabase = require('../config/supabase');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('carts')
      .select(`
        id,
        quantity,
        created_at,
        products (
          id, name, price, image_url, stock, category
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    const items = data.map((item) => ({
      cart_id: item.id,
      quantity: item.quantity,
      product: item.products,
    }));

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    res.json({ items, total: parseFloat(total.toFixed(2)), count: items.length });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Verify product exists and has stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Upsert cart item
    const { data, error } = await supabase
      .from('carts')
      .upsert(
        { user_id: req.user.id, product_id, quantity: parseInt(quantity) },
        { onConflict: 'user_id,product_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Item added to cart', item: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const { data, error } = await supabase
      .from('carts')
      .update({ quantity: parseInt(quantity) })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Cart updated', item: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const { error } = await supabase.from('carts').delete().eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };