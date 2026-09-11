import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatRands, get } from '../api';
import { useStore } from '../context/useStore';
import ProductCard from '../components/ProductCard';
import Stepper from '../components/Stepper';
import EmptyState from '../components/EmptyState';
import { BagIcon, ChevronRight, HeartIcon } from '../components/Icons';
import { ImagePlaceholder, NotFoundIllustration, RefreshIcon, ShieldIcon, TruckIcon } from '../components/Illustrations';

// Keyed by SKU so navigating between products remounts the view with fresh
// state instead of resetting half a dozen fields in an effect.
export default function ProductDetail() {
  const { sku } = useParams();
  return <ProductView key={sku} sku={sku} />;
}

function ProductView({ sku }) {
  const navigate = useNavigate();
  const { isAuthed, addToCart, toggleWishlist, wishlistIds, notify } = useStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    get(`/api/products/${encodeURIComponent(sku)}`, controller.signal)
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
        const categoryId = data.product.category_id?._id;
        if (!categoryId) return null;
        return get(`/api/products?category_id=${categoryId}&limit=5`, controller.signal)
          .then((list) => setRelated((list.products || []).filter((item) => item._id !== data.product._id).slice(0, 4)));
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [sku]);

  if (loading) {
    return (
      <main className="page container">
        <div className="pdp">
          <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 22 }} />
          <div className="stack">
            <div className="skeleton" style={{ height: 14, width: '30%' }} />
            <div className="skeleton" style={{ height: 36, width: '80%' }} />
            <div className="skeleton" style={{ height: 28, width: '25%' }} />
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page container">
        <EmptyState illustration={<NotFoundIllustration />} title="We couldn't find that product" actions={<Link to="/products" className="btn btn-primary">Back to the catalog</Link>}>
          {error || 'It may have been removed or the link is wrong.'}
        </EmptyState>
      </main>
    );
  }

  const images = product.images || [];
  const current = images[activeImage]?.image_url;
  const inStock = product.stock_quantity > 0;
  const saved = wishlistIds.has(product._id);

  const guard = () => {
    if (isAuthed) return true;
    notify('Sign in to add items to your bag', 'info');
    navigate('/login', { state: { from: `/products/${encodeURIComponent(sku)}` } });
    return false;
  };

  const handleAdd = async () => {
    if (!guard()) return;
    setBusy(true);
    try { await addToCart(product, quantity); } catch (err) { notify(err.message, 'danger'); } finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!guard()) return;
    try { await toggleWishlist(product); } catch (err) { notify(err.message, 'danger'); }
  };

  return (
    <main className="page container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link><ChevronRight />
        <Link to="/products">Shop</Link><ChevronRight />
        {product.category_id?.name && (<><Link to={`/products?category=${product.category_id._id}`}>{product.category_id.name}</Link><ChevronRight /></>)}
        <span>{product.name}</span>
      </nav>

      <div className="pdp">
        <div>
          <div className="gallery-main">
            {current ? <img src={current} alt={product.name} /> : <div className="placeholder"><ImagePlaceholder /></div>}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((image, index) => (
                <button type="button" key={`${image.image_url}-${index}`} className={index === activeImage ? 'active' : ''} onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`}>
                  <img src={image.image_url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          {product.category_id?.name && <span className="eyebrow">{product.category_id.name}</span>}
          <h1>{product.name}</h1>
          <div className="row wrap">
            {inStock
              ? <span className="badge badge-success badge-dot">In stock · {product.stock_quantity} available</span>
              : <span className="badge badge-danger badge-dot">Sold out</span>}
            <span className="small muted">SKU {product.sku}</span>
          </div>
          <div className="pdp-price">{formatRands(product.price_cents)}</div>
          <p className="small muted">VAT included · Free delivery nationwide</p>
          <p className="pdp-desc">{product.description}</p>

          <div className="pdp-actions">
            <Stepper value={quantity} onChange={setQuantity} max={Math.max(product.stock_quantity, 1)} disabled={!inStock} />
            <button type="button" className="btn btn-primary btn-lg" onClick={handleAdd} disabled={!inStock || busy}>
              <BagIcon /> {inStock ? (busy ? 'Adding…' : 'Add to bag') : 'Sold out'}
            </button>
            <button type="button" className={`btn-icon${saved ? ' is-active' : ''}`} style={{ width: 48, height: 48 }} onClick={handleSave} aria-pressed={saved} aria-label={saved ? 'Remove from saved items' : 'Save for later'}>
              <HeartIcon filled={saved} />
            </button>
          </div>

          <ul className="spec-list">
            <li><span>Category</span><span>{product.category_id?.name || '—'}</span></li>
            <li><span>SKU</span><span>{product.sku}</span></li>
            <li><span>Availability</span><span>{inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}</span></li>
            <li><span>Warranty</span><span>12 months</span></li>
          </ul>

          <div className="perks">
            <div className="perk"><TruckIcon /> 2–4 day delivery</div>
            <div className="perk"><RefreshIcon /> 30-day returns</div>
            <div className="perk"><ShieldIcon /> Secure payment</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related">
          <div className="section-head">
            <div><h2 id="related">You might also like</h2><p>More from {product.category_id?.name}.</p></div>
            <Link to={`/products?category=${product.category_id?._id}`} className="link">View category</Link>
          </div>
          <div className="product-grid">
            {related.map((item) => <ProductCard key={item._id} product={item} />)}
          </div>
        </section>
      )}
    </main>
  );
}
