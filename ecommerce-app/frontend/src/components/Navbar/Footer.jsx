import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="font-display font-bold text-white">ShopLux</span>
            </div>
            <p className="text-sm">Modern shopping, curated for you.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/products" className="block hover:text-white transition-colors">Products</Link>
              <Link to="/cart" className="block hover:text-white transition-colors">Cart</Link>
              <Link to="/orders" className="block hover:text-white transition-colors">Orders</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
            <div className="space-y-2 text-sm">
              <Link to="/login" className="block hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="block hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} ShopLux. Built with React, Node.js & Supabase.</p>
        </div>
      </div>
    </footer>
  );
}