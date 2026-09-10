import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatRands } from '../api';
import './ProductCatalog.css';

const API_BASE = 'http://localhost:5000';

export default function ProductDetail() {
  const { sku } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${encodeURIComponent(sku)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Product not found');
        return data;
      })
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sku]);

  const images = useMemo(() => product?.images || [], [product]);

  if (loading) return <main className="catalog-page"><p className="catalog-status">Loading product...</p></main>;
  if (error || !product) return <main className="catalog-page"><p className="catalog-error">{error || 'Product not found'}</p><Link to="/products">Back to products</Link></main>;

  const currentImage = images[activeImage]?.image_url;

  return (
    <main className="detail-page">
      <Link className="back-link" to="/products">← Back to products</Link>
      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-main-image">
            {currentImage ? <img src={currentImage} alt={product.name} /> : <div className="image-placeholder">No image</div>}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((image, index) => (
                <button
                  key={`${image.image_url}-${index}`}
                  className={index === activeImage ? 'thumbnail active' : 'thumbnail'}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image.image_url} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <p className="product-category">{product.category_id?.name || 'Product'}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatRands(product.price_cents)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-meta">
            <span>SKU: {product.sku}</span>
            <span>{product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}</span>
          </div>
          <button className="primary-cta" disabled={product.stock_quantity <= 0}>
            {product.stock_quantity > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
          <p className="catalog-note">Cart integration remains with the Cart/Wishlist team module.</p>
        </div>
      </section>
    </main>
  );
}
