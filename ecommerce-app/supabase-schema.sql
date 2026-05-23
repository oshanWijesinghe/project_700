-- ============================================
-- SUPABASE SQL SCHEMA FOR ECOMMERCE APP
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- PRODUCTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CARTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─────────────────────────────────────────────
-- ORDERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ORDER ITEMS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- SAMPLE PRODUCT DATA
-- ─────────────────────────────────────────────
INSERT INTO products (name, description, price, stock, category, image_url, is_featured) VALUES
('Wireless Noise-Cancelling Headphones', 'Premium sound with 30-hour battery life and active noise cancellation for an immersive listening experience.', 299.99, 50, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', true),
('Minimalist Leather Watch', 'Handcrafted genuine leather strap with a clean dial. Water resistant up to 50m.', 189.00, 30, 'Accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', true),
('Ceramic Pour-Over Coffee Set', 'Elevate your morning ritual with this hand-thrown ceramic dripper and matching carafe set.', 75.00, 100, 'Home & Kitchen', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', false),
('Ergonomic Mechanical Keyboard', 'Tactile brown switches, RGB backlight, and a split ergonomic layout for all-day comfort.', 149.99, 40, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', true),
('Linen Tote Bag', 'Sustainably made, heavy-duty linen with reinforced handles. Fits a 15" laptop.', 45.00, 200, 'Bags', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600', false),
('Portable Bluetooth Speaker', 'Waterproof, dustproof, and drop-proof. 360° sound with a 12-hour battery.', 89.99, 75, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', false),
('Scented Soy Candle Set', 'Hand-poured, 100% natural soy wax candles in three calming scents: Eucalyptus, Cedarwood, and Vanilla.', 38.00, 150, 'Home & Kitchen', 'https://images.unsplash.com/photo-1612196808214-b40a8c5c9f34?w=600', false),
('Running Sneakers', 'Lightweight mesh upper with responsive cushioning. Available in multiple colorways.', 125.00, 60, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', true),
('Stainless Steel Water Bottle', 'Triple-wall insulation keeps drinks cold 24h or hot 12h. 100% leak-proof.', 35.00, 300, 'Accessories', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', false),
('Succulent Plant Collection', 'A curated set of 6 low-maintenance succulents in terracotta pots. Perfect for desks and shelves.', 55.00, 80, 'Plants', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600', false);

-- ─────────────────────────────────────────────
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- Run separately in Supabase Storage settings
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);