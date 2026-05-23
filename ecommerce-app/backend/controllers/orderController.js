const supabase = require('../config/supabase');

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, quantity, unit_price,
          products ( id, name, image_url )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, quantity, unit_price,
          products ( id, name, image_url, category )
        )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: data });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders (checkout)
const createOrder = async (req, res, next) => {
  try {
    const { shipping_address, payment_method = 'card' } = req.body;

    if (!shipping_address || !shipping_address.street || !shipping_address.city) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('carts')
      .select(`
        quantity,
        products ( id, name, price, stock )
      `)
      .eq('user_id', req.user.id);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.products.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.products.name}". Only ${item.products.stock} left.`,
        });
      }
    }

    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        total_amount: parseFloat(total_amount.toFixed(2)),
        shipping_address,
        payment_method,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      unit_price: item.products.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
    if (itemsError) throw itemsError;

    // Decrement stock
    for (const item of cartItems) {
      await supabase
        .from('products')
        .update({ stock: item.products.stock - item.quantity })
        .eq('id', item.products.id);
    }

    // Clear cart
    await supabase.from('carts').delete().eq('user_id', req.user.id);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrder, createOrder };