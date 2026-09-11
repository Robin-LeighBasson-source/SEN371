import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ProductCatalog.css';

const API_BASE = 'http://localhost:5000';

function getImage(product) {
  const primary = product.images?.find((image) => image.is_primary);
  return primary?.image_url || product.images?.[0]?.image_url || '';
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`${API_BASE}/api/products`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load products');
        return data;
      })
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchParams]);

  return (
    <main className="catalog-page">
      {error && <p className="catalog-error">{error}</p>}
      {loading ? <p className="catalog-status">LOADING...</p> : null}
      {!loading && !error && products.length === 0 ? <p className="catalog-status">NO PRODUCTS FOUND.</p> : null}

      <section className="product-grid" aria-label="Products">
        {products.map((product) => {
          const image = getImage(product);
          return (
            <Link className="product-card" key={product._id} to={`/products/${encodeURIComponent(product.sku)}`}>
              <div className="product-image-wrap">
                {image ? <img src={image} alt={product.name} /> : <div className="image-placeholder">NO IMAGE</div>}
              </div>
              <div className="product-card-body">
                <p className="product-sku">{product.sku || 'ITEM'}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}