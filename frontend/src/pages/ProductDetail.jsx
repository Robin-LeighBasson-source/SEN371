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

  if (loading) return <main className="catalog-page"><p className="catalog-status">LOADING...</p></main>;
  if (error || !product) return <main className="catalog-page"><p className="catalog-error">{error || 'Product not found'}</p><Link to="/products" className="brutalist-link">← Back to products</Link></main>;

  const currentImage = images[activeImage]?.image_url;

  return (
    <main className="brutalist-checkout" style={{ paddingTop: '20px' }}>
      <Link className="brutalist-link" to="/products" style={{ display: 'inline-block', marginBottom: '40px' }}>
        ← BACK TO PRODUCTS
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
        {/* Left: Image Gallery */}
        <div>
          <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#f4f4f4', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {currentImage ? (
              <img src={currentImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>NO IMAGE</span>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {images.map((image, index) => (
                <button
                  key={`${image.image_url}-${index}`}
                  onClick={() => setActiveImage(index)}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: index === activeImage ? '2px solid #000' : '1px solid #ddd',
                    background: '#fff',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img src={image.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.category_id?.name || 'ITEM'}
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '0', marginBottom: '20px', textTransform: 'uppercase' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '30px' }}>
            {formatRands(product.price_cents)}
          </p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '40px', color: '#333' }}>
            {product.description}
          </p>

          <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '20px 0', marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', marginBottom: '8px' }}>SKU: {product.sku}</p>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: product.stock_quantity > 0 ? '#000' : '#888' }}>
              {product.stock_quantity > 0 ? `IN STOCK (${product.stock_quantity})` : 'OUT OF STOCK'}
            </p>
          </div>

          <button 
            className="brutalist-btn" 
            disabled={product.stock_quantity <= 0}
            style={{ marginBottom: '20px' }}
          >
            {product.stock_quantity > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
          </button>
        </div>
      </div>
    </main>
  );
}