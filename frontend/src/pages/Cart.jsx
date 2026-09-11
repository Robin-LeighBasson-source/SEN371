import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRands, primaryImage, productPath } from '../api';
import { useStore } from '../context/useStore';
import EmptyState from '../components/EmptyState';
import Stepper from '../components/Stepper';
import { ArrowRight, LockIcon, TrashIcon } from '../components/Icons';
import { EmptyBagIllustration, ImagePlaceholder } from '../components/Illustrations';
import { FREE_SHIPPING_CENTS, cartTotals } from '../totals';

export default function Cart() {
  const { cart, refreshCart, updateCartItem, removeCartItem, clearCart, notify } = useStore();
  const [loading, setLoading] = useState(!cart);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    refreshCart()
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshCart]);

  // Cart lines whose product was deleted come back with a null product_id.
  const items = (cart?.items ?? []).filter((item) => item.product_id);
  const { subtotal, shipping, total } = cartTotals(items);
  const toFreeShipping = FREE_SHIPPING_CENTS - subtotal;

  const run = async (id, action) => {
    setBusyId(id);
    setError('');
    try { await action(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  if (loading) return <main className="page container"><div className="loading-block"><span className="spinner" /> Loading your bag…</div></main>;

  return (
    <main className="page container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Your bag</span>
          <h1 style={{ margin: 0 }}>Bag {items.length > 0 && <span className="muted" style={{ fontSize: '0.6em', fontWeight: 500 }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>}</h1>
        </div>
        {items.length > 0 && (
          <button type="button" className="btn btn-danger btn-sm" onClick={() => run('clear', async () => { await clearCart(); notify('Your bag has been emptied', 'info'); })} disabled={busyId === 'clear'}>
            <TrashIcon /> Empty bag
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {items.length === 0 ? (
        <EmptyState
          illustration={<EmptyBagIllustration />}
          title="Your bag is empty"
          actions={(<><Link to="/products" className="btn btn-primary">Start shopping <ArrowRight /></Link><Link to="/wishlist" className="btn btn-soft">View saved items</Link></>)}
        >
          Looks like you haven't added anything yet. Find something you'll love.
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {items.map((item) => {
              const product = item.product_id;
              const image = primaryImage(product);
              return (
                <article key={item._id} className="card cart-line">
                  <Link to={productPath(product)} className="thumb" aria-label={product.name}>
                    {image ? <img src={image} alt="" /> : <ImagePlaceholder />}
                  </Link>
                  <div>
                    <h3><Link to={productPath(product)}>{product.name}</Link></h3>
                    <div className="line-meta">{formatRands(product.price_cents)} each</div>
                    {product.stock_quantity !== undefined && item.quantity > product.stock_quantity && (
                      <span className="badge badge-warn" style={{ marginTop: 6 }}>Only {product.stock_quantity} in stock</span>
                    )}
                    <div className="line-actions">
                      <Stepper
                        size="sm"
                        value={item.quantity}
                        max={Math.max(product.stock_quantity ?? 99, 1)}
                        disabled={busyId === item._id}
                        onChange={(quantity) => run(item._id, () => updateCartItem(product._id, quantity))}
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => run(item._id, () => removeCartItem(product._id))} disabled={busyId === item._id}>
                        <TrashIcon /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="line-total"><span className="price">{formatRands(product.price_cents * item.quantity)}</span></div>
                </article>
              );
            })}
            <Link to="/products" className="link small" style={{ alignSelf: 'flex-start', marginTop: 6 }}>← Continue shopping</Link>
          </div>

          <aside className="panel summary" aria-label="Order summary">
            <h3>Summary</h3>
            <div className="summary-line"><span>Subtotal</span><span>{formatRands(subtotal)}</span></div>
            <div className="summary-line"><span>Delivery</span><span>{shipping === 0 ? <span className="badge badge-success">Free</span> : formatRands(shipping)}</span></div>
            {toFreeShipping > 0 && <p className="small muted" style={{ margin: '4px 0 0' }}>Add {formatRands(toFreeShipping)} more for free delivery.</p>}
            <div className="summary-line total"><span>Total</span><span>{formatRands(total)}</span></div>
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/checkout')}>Checkout <ArrowRight /></button>
            <div className="trust"><LockIcon /> Secure checkout · VAT included</div>
          </aside>
        </div>
      )}
    </main>
  );
}
