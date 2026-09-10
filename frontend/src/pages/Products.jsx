import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatRands } from '../api';
import './ProductCatalog.css';

const API_BASE = 'http://localhost:5000';
const PAGE_SIZE = 12;

function getImage(product) {
  const primary = product.images?.find((image) => image.is_primary);
  return primary?.image_url || product.images?.[0]?.image_url || '';
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category_id') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (searchParams.get('search')) params.set('search', searchParams.get('search'));
    if (searchParams.get('category_id')) params.set('category_id', searchParams.get('category_id'));

    fetch(`${API_BASE}/api/products?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load products');
        return data;
      })
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || { page, pages: 1, total: 0 });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, searchParams]);

  const applyFilters = (event) => {
    event.preventDefault();
    const next = {};
    if (search.trim()) next.search = search.trim();
    if (category) next.category_id = category;
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSearchParams({});
  };

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <p className="eyebrow">PRODUCT CATALOG</p>
        <h1>Find your next favourite.</h1>
        <p>Browse the collection, search by keyword, or filter by category.</p>
      </section>

      <form className="catalog-filters" onSubmit={applyFilters}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item._id}>{item.name}</option>
          ))}
        </select>
        <button type="submit">Search</button>
        {(searchParams.get('search') || searchParams.get('category_id')) && (
          <button type="button" className="secondary-button" onClick={clearFilters}>Clear</button>
        )}
      </form>

      {error && <p className="catalog-error">{error}</p>}
      {loading ? <p className="catalog-status">Loading products...</p> : null}
      {!loading && !error && products.length === 0 ? <p className="catalog-status">No products found.</p> : null}

      <section className="product-grid" aria-label="Products">
        {products.map((product) => {
          const image = getImage(product);
          return (
            <Link className="product-card" key={product._id} to={`/products/${encodeURIComponent(product.sku)}`}>
              <div className="product-image-wrap">
                {image ? <img src={image} alt={product.name} /> : <div className="image-placeholder">No image</div>}
              </div>
              <div className="product-card-body">
                <p className="product-category">{product.category_id?.name || 'Product'}</p>
                <h2>{product.name}</h2>
                <p className="product-price">{formatRands(product.price_cents)}</p>
                <span className={product.stock_quantity > 0 ? 'stock' : 'stock out'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {pagination.pages > 1 && (
        <nav className="pagination" aria-label="Product pages">
          <button disabled={page <= 1} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}>Previous</button>
          <span>Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}>Next</button>
        </nav>
      )}
    </main>
  );
}
