import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

const productLabel = (item) => {
  if (item.product_id && typeof item.product_id === 'object' && item.product_id.name) return item.product_id.name;
  return 'PRODUCT UNAVAILABLE';
};

export default function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await request('/api/orders', token);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'UNKNOWN DATE';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  };

  if (loading) return <main className="brutalist-checkout"><p>LOADING ORDERS...</p></main>;
  if (error) return <main className="brutalist-checkout"><p style={{ color: 'red' }}>{error}</p></main>;

  return (
    <main className="brutalist-checkout">
      <div className="brutalist-top-bar">
        <Link to="/products">{'<'}</Link>
        <span>ORDER HISTORY</span>
      </div>

      <h2 className="brutalist-header" style={{ fontSize: '24px', marginBottom: '40px' }}>PAST ORDERS</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <p>YOU HAVE NO PAST ORDERS.</p>
          <Link to="/products"><button className="brutalist-btn" style={{ maxWidth: '300px' }}>START SHOPPING</button></Link>
        </div>
      ) : (
        <div style={{ borderTop: '2px solid #000' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ padding: '40px 0', borderBottom: '1px solid #000' }}>
              <div className="brutalist-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>ORDER #{order._id}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>DATE: {formatDate(order.created_at || order.createdAt)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>STATUS: {order.order_status?.toUpperCase() || 'PENDING'}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{formatRands(order.total_amount_cents || 0)}</p>
                </div>
              </div>

              <div className="brutalist-row" style={{ gap: '60px' }}>
                <div className="brutalist-col">
                  <h4 className="brutalist-header" style={{ margin: '0 0 15px 0' }}>ITEMS</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span><strong style={{ opacity: 0.5, marginRight: '10px' }}>{item.quantity}X</strong>{productLabel(item)}</span>
                        <strong>{formatRands((item.price_at_purchase_cents || 0) * (item.quantity || 0))}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shipping_snapshot && (
                  <div className="brutalist-col">
                    <h4 className="brutalist-header" style={{ margin: '0 0 15px 0' }}>SHIPPING</h4>
                    <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#444' }}>
                      {order.shipping_snapshot.full_name?.toUpperCase()}<br />
                      {order.shipping_snapshot.street_address?.toUpperCase()}<br />
                      {order.shipping_snapshot.city?.toUpperCase()}, {order.shipping_snapshot.postal_code}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}