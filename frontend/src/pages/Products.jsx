import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from '../api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { CloseIcon, FilterIcon } from '../components/Icons';
import { CategoryIcon, EmptyOrdersIllustration } from '../components/Illustrations';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 12;

const SORTS = {
  newest: { label: 'Newest', sort: null },
  'price-asc': { label: 'Price: low to high', sort: (a, b) => a.price_cents - b.price_cents },
  'price-desc': { label: 'Price: high to low', sort: (a, b) => b.price_cents - a.price_cents },
  name: { label: 'Name A–Z', sort: (a, b) => a.name.localeCompare(b.name) },
};

export default function Products() {
  const [params, setParams] = useSearchParams();
  // The result remembers which query it answers; while that differs from the
  // current query the page is loading. Avoids flipping a loading flag in effects.
  const [result, setResult] = useState({ key: null, products: [], pagination: { page: 1, pages: 1, total: 0 }, error: '' });
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const page = Math.max(parseInt(params.get('page') || '1', 10) || 1, 1);
  const sortKey = SORTS[params.get('sort')] ? params.get('sort') : 'newest';
  const queryKey = `${search}|${category}|${page}`;
  const loading = result.key !== queryKey;
  const { products, pagination, error } = result;

  // Updates one query param while keeping the others; page resets on any change.
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value); else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    get('/api/categories').then((data) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) query.set('search', search);
    if (category) query.set('category_id', category);

    get(`/api/products?${query}`, controller.signal)
      .then((data) => setResult({
        key: queryKey,
        products: data.products || [],
        pagination: data.pagination || { page: 1, pages: 1, total: data.products?.length || 0 },
        error: '',
      }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setResult({ key: queryKey, products: [], pagination: { page: 1, pages: 1, total: 0 }, error: err.message });
      });

    return () => controller.abort();
  }, [search, category, page, queryKey]);

  const visible = useMemo(() => {
    const sorter = SORTS[sortKey].sort;
    return sorter ? [...products].sort(sorter) : products;
  }, [products, sortKey]);

  const activeCategory = categories.find((item) => item._id === category);
  const hasFilters = Boolean(search || category);

  return (
    <main className="page container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1 style={{ margin: 0 }}>{activeCategory ? activeCategory.name : search ? `Results for “${search}”` : 'All products'}</h1>
        </div>
        {!loading && !error && <p>{pagination.total} {pagination.total === 1 ? 'item' : 'items'}</p>}
      </div>

      <div className="catalog">
        <aside className={`filters${filtersOpen ? ' open' : ''}`} aria-label="Filters">
          <h4>Categories</h4>
          <ul className="filter-list">
            <li><button type="button" className={!category ? 'active' : ''} onClick={() => update({ category: '' })}>All products</button></li>
            {categories.map((item) => (
              <li key={item._id}>
                <button type="button" className={category === item._id ? 'active' : ''} onClick={() => update({ category: item._id })}>
                  <span className="row" style={{ gap: 8 }}><CategoryIcon category={item} width="20" height="20" /> {item.name}</span>
                </button>
              </li>
            ))}
          </ul>
          {hasFilters && (
            <button type="button" className="btn btn-soft btn-sm btn-block" onClick={() => update({ search: '', category: '' })}>Clear filters</button>
          )}
        </aside>

        <section aria-label="Products">
          <div className="toolbar">
            <div className="chips">
              <button type="button" className="btn btn-soft btn-sm filters-mobile" onClick={() => setFiltersOpen((v) => !v)}>
                <FilterIcon /> Filters
              </button>
              {search && (
                <span className="chip">“{search}” <button type="button" onClick={() => update({ search: '' })} aria-label="Clear search"><CloseIcon /></button></span>
              )}
              {activeCategory && (
                <span className="chip">{activeCategory.name} <button type="button" onClick={() => update({ category: '' })} aria-label="Clear category"><CloseIcon /></button></span>
              )}
            </div>
            <label className="row" style={{ gap: 8 }}>
              <span className="small muted">Sort</span>
              <select className="select" value={sortKey} onChange={(event) => update({ sort: event.target.value === 'newest' ? '' : event.target.value, page: String(page) })}>
                {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>

          {error && <div className="alert alert-danger">{error}. Is the API running on port 5000?</div>}

          {loading ? (
            <div className="product-grid">{Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : visible.length === 0 && !error ? (
            <EmptyState
              illustration={<EmptyOrdersIllustration />}
              title="Nothing matched"
              actions={hasFilters && <button type="button" className="btn btn-primary" onClick={() => update({ search: '', category: '' })}>Clear filters</button>}
            >
              {hasFilters ? 'Try a different search or category.' : 'The catalog is empty — seed the database to add products.'}
            </EmptyState>
          ) : (
            <div className="product-grid">
              {visible.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Prev</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
                <button type="button" key={n} className={n === page ? 'active' : ''} onClick={() => update({ page: String(n) })} aria-current={n === page ? 'page' : undefined}>{n}</button>
              ))}
              <button type="button" disabled={page >= pagination.pages} onClick={() => update({ page: String(page + 1) })}>Next</button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
