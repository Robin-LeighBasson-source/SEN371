import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRands, primaryImage, productPath } from '../api';
import { useStore } from '../context/useStore';
import EmptyState from '../components/EmptyState';
import { ArrowRight, BagIcon, TrashIcon } from '../components/Icons';
import { EmptyWishlistIllustration, ImagePlaceholder } from '../components/Illustrations';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, moveToCart } = useStore();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const products = wishlist?.products ?? [];

  const run = async (id, action) => {
    setBusyId(id);
    setError('');
    try { await action(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  if (!wishlist) return <main className="page container"><div className="loading-block"><span className="spinner" /> Loading saved items…</div></main>;

  return (
    <main className="page container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Wishlist</span>
          <h1 style={{ margin: 0 }}>Saved for later</h1>
        </div>
        {products.length > 0 && <p>{products.length} {products.length === 1 ? 'item' : 'items'}</p>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {products.length === 0 ? (
        <EmptyState
          illustration={<EmptyWishlistIllustration />}
          title="Nothing saved yet"
          actions={<Link to="/products" className="btn btn-primary">Browse the catalog <ArrowRight /></Link>}
        >
          Tap the heart on any product to keep it here for later.
        </EmptyState>
      ) : (
        <div className="cart-lines">
          {products.map((product) => {
            const image = primaryImage(product);
            const inStock = product.stock_quantity > 0;
            return (
              <article key={product._id} className="card cart-line">
                <Link to={productPath(product)} className="thumb" aria-label={product.name}>
                  {image ? <img src={image} alt="" /> : <ImagePlaceholder />}
                </Link>
                <div>
                  <h3><Link to={productPath(product)}>{product.name}</Link></h3>
                  <div className="row wrap" style={{ gap: 8 }}>
                    <span className="price" style={{ fontSize: 15 }}>{formatRands(product.price_cents)}</span>
                    {inStock ? <span className="badge badge-success">In stock</span> : <span className="badge badge-danger">Sold out</span>}
                  </div>
                  <div className="line-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => run(product._id, () => moveToCart(product))} disabled={!inStock || busyId === product._id}>
                      <BagIcon /> Move to bag
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => run(product._id, () => removeFromWishlist(product))} disabled={busyId === product._id}>
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
