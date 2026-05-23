const supabase = require('../config/supabase');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, min_price, max_price, featured, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      products: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select('category');
    if (error) throw error;
    const categories = [...new Set(data.map((p) => p.category))].sort();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url, is_featured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ name, description, price: parseFloat(price), stock: parseInt(stock) || 0, category, image_url, is_featured: Boolean(is_featured) })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getCategories, getProduct, createProduct, updateProduct, deleteProduct };