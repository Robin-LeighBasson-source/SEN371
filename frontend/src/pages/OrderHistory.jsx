import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRands } from '../api';
import { useStore } from '../context/useStore';
import EmptyState from '../components/EmptyState';
import { ArrowRight } from '../components/Icons';
import { EmptyOrdersIllustration } from '../components/Illustrations';

const STATUS = {
  Pending: { badge: 'badge-warn', label: 'Awaiting payment' },
  Paid: { badge: 'badge-success', label: 'Paid' },
  Shipped: { badge: 'badge-info', label: 'Shipped' },
  Cancelled: { badge: 'badge-danger', label: 'Cancelled' },
};

const TIMELINE = ['Placed', 'Paid', 'Shipped'];

const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Unknown date');

const productLabel = (item) => (item.product_id && typeof item.product_id === 'object' && item.product_id.name
  ? item.product_id.name
  : 'Product no longer available');

function Timeline({ status }) {
  if (status === 'Cancelled') return <div className="timeline"><span className="tl cancelled">Cancelled</span></div>;
  const reached = status === 'Shipped' ? 3 : status === 'Paid' ? 2 : 1;
  return (
    <div className="timeline">
      {TIMELINE.map((label, index) => <span key={label} className={`tl${index < reached ? ' done' : ''}`}>{label}</span>)}
    </div>
  );
}

export default function OrderHistory() {
  const { authed } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    authed('/api/orders')
      .then((data) => { if (active) setOrders(data.orders || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authed]);

  if (loading) return <main className="page container"><div className="loading-block"><span className="spinner" /> Loading your orders…</div></main>;

  return (
    <main className="page container">
      <div className="page-head">
        <div><span className="eyebrow">Account</span><h1 style={{ margin: 0 }}>Your orders</h1></div>
        {orders.length > 0 && <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 && !error ? (
        <EmptyState
          illustration={<EmptyOrdersIllustration />}
          title="No orders yet"
          actions={<Link to="/products" className="btn btn-primary">Start shopping <ArrowRight /></Link>}
        >
          When you place an order it will show up here with its status and delivery details.
        </EmptyState>
      ) : (
        orders.map((order) => {
          const status = STATUS[order.order_status] || STATUS.Pending;
          const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
          return (
            <article key={order._id} className="card order-card">
              <header className="order-head">
                <div className="meta">
                  <div><span>Order</span><b>#{order._id.slice(-8).toUpperCase()}</b></div>
                  <div><span>Placed</span><b>{formatDate(order.created_at || order.createdAt)}</b></div>
                  <div><span>Items</span><b>{itemCount}</b></div>
                  <div><span>Total</span><b>{formatRands(order.total_amount_cents)}</b></div>
                </div>
                <span className={`badge badge-dot ${status.badge}`}>{status.label}</span>
              </header>
              <div className="order-body">
                <div>
                  <ul className="order-items">
                    {(order.items || []).map((item, index) => (
                      <li key={index}>
                        <span><span className="q">{item.quantity}×</span>{productLabel(item)}</span>
                        <b>{formatRands((item.price_at_purchase_cents || 0) * (item.quantity || 0))}</b>
                      </li>
                    ))}
                  </ul>
                  <Timeline status={order.order_status} />
                </div>
                <div className="order-ship">
                  <h4>Delivery address</h4>
                  {order.shipping_snapshot ? (
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      {order.shipping_snapshot.full_name}<br />
                      {order.shipping_snapshot.street_address}<br />
                      {order.shipping_snapshot.city} {order.shipping_snapshot.postal_code}
                    </p>
                  ) : <p className="muted" style={{ margin: 0 }}>No address on record.</p>}
                </div>
              </div>
            </article>
          );
        })
      )}
    </main>
  );
}
