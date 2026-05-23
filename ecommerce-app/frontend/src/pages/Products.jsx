import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/Product/ProductCard';
import { Spinner, EmptyState, PageHeader } from '../components/UI';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('page', page);
      params.set('limit', '12');
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = search || category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <PageHeader
        title={search ? `Search: "${search}"` : category || 'All Products'}
        subtitle={!loading && `${pagination.total || 0} products found`}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline font-medium">
                  Clear all
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-surface-muted'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-surface-muted'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description={hasFilters ? 'Try adjusting your search or filters.' : 'No products available yet.'}
              action={hasFilters ? (
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              ) : null}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilter('page', page - 1)}
                    className="btn-secondary disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', page + 1);
                      setSearchParams(params);
                    }}
                    className="btn-secondary disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}