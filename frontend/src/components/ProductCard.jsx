import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRands, primaryImage, productPath } from '../api';
import { useStore } from '../context/useStore';
import { BagIcon, HeartIcon } from './Icons';
import { ImagePlaceholder } from './Illustrations';

export default function ProductCard({ product }) {
  const { isAuthed, addToCart, toggleWishlist, wishlistIds, notify } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const image = primaryImage(product);
  const inStock = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 5;
  const saved = wishlistIds.has(product._id);
  const href = productPath(product);

  // Actions that need an account send the shopper to sign in and back again.
  const guard = () => {
    if (isAuthed) return true;
    notify('Sign in to add items to your bag', 'info');
    navigate('/login', { state: { from: href } });
    return false;
  };

  const handleAdd = async () => {
    if (!guard()) return;
    setBusy(true);
    try { await addToCart(product, 1); } catch (error) { notify(error.message, 'danger'); } finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!guard()) return;
    try { await toggleWishlist(product); } catch (error) { notify(error.message, 'danger'); }
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <div className="placeholder"><ImagePlaceholder /></div>}
        <div className="product-badges">
          {!inStock && <span className="badge badge-danger">Sold out</span>}
          {lowStock && <span className="badge badge-warn">Only {product.stock_quantity} left</span>}
        </div>
        <button
          type="button"
          className={`btn-icon product-save${saved ? ' is-active' : ''}`}
          onClick={handleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved items' : 'Save for later'}
          title={saved ? 'Remove from saved items' : 'Save for later'}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>
      <div className="product-body">
        {product.category_id?.name && <span className="product-category">{product.category_id.name}</span>}
        <h3 className="product-name"><Link to={href}>{product.name}</Link></h3>
        <div className="product-foot">
          <span className="price">{formatRands(product.price_cents)}</span>
          <button
            type="button"
            className="btn-icon"
            onClick={handleAdd}
            disabled={!inStock || busy}
            aria-label={inStock ? `Add ${product.name} to bag` : 'Sold out'}
            title={inStock ? 'Add to bag' : 'Sold out'}
          >
            <BagIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="product-media skeleton" style={{ borderRadius: 0 }} />
      <div className="product-body">
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '80%' }} />
        <div className="skeleton" style={{ height: 20, width: '35%', marginTop: 8 }} />
      </div>
    </div>
  );
}
