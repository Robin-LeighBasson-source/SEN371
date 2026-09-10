import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

const productLabel = (item) => {
  if (item.product_id && typeof item.product_id === 'object' && item.product_id.name) {
    return item.product_id.name;
  }
  return 'Product unavailable';
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
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return { ...styles.badge, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Shipped':
        return { ...styles.badge, backgroundColor: '#dcfce7', color: '#166534' };
      case 'Cancelled':
        return { ...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Pending':
        return { ...styles.badge, backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return styles.badge;
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.wrapper}>
          <h2 style={styles.headerTitle}>My Order History</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>My Order History</h2>

        {orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ margin: 0 }}>You have no past orders yet.</p>
            <Link to="/cart" style={styles.emptyLink}>
              Go to cart
            </Link>
          </div>
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.orderId}>Order #{order._id}</p>
                    <p style={styles.orderDate}>
                      Placed on {formatDate(order.created_at || order.createdAt)}
                    </p>
                  </div>
                  <div style={styles.statusContainer}>
                    <span style={getStatusStyle(order.order_status)}>
                      {order.order_status}
                    </span>
                    <p style={styles.orderTotal}>
                      {formatRands(order.total_amount_cents || 0)}
                    </p>
                  </div>
                </div>

                <hr style={styles.divider} />

                <div style={styles.itemsList}>
                  <p style={styles.itemsTitle}>Items in this order:</p>
                  <ul style={styles.ul}>
                    {(order.items || []).map((item, idx) => (
                      <li key={idx} style={styles.li}>
                        <span>
                          <span style={styles.itemQty}>{item.quantity}x</span>
                          {productLabel(item)}
                        </span>
                        <span style={styles.itemPrice}>
                          {formatRands(
                            (item.price_at_purchase_cents || 0) * (item.quantity || 0),
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.shipping_snapshot && (
                  <>
                    <hr style={styles.divider} />
                    <div style={styles.shippingBlock}>
                      <p style={styles.itemsTitle}>Shipped to</p>
                      <p style={styles.shippingText}>
                        {order.shipping_snapshot.full_name}
                        {order.shipping_snapshot.email
                          ? ` · ${order.shipping_snapshot.email}`
                          : ''}
                        <br />
                        {order.shipping_snapshot.street_address}
                        <br />
                        {order.shipping_snapshot.city}
                        {order.shipping_snapshot.postal_code
                          ? `, ${order.shipping_snapshot.postal_code}`
                          : ''}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#333',
  },
  wrapper: { maxWidth: '800px', margin: '0 auto' },
  headerTitle: { marginBottom: '25px', fontSize: '1.8rem', color: '#111' },
  emptyBox: {
    backgroundColor: '#fff',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyLink: { fontWeight: 'bold', color: '#2563eb' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1px solid #eaeaea',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    margin: '0 0 5px 0',
    color: '#111',
    wordBreak: 'break-all',
  },
  orderDate: { fontSize: '0.9rem', color: '#666', margin: 0 },
  statusContainer: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderTotal: { fontWeight: 'bold', fontSize: '1.1rem', margin: 0, color: '#111' },
  divider: { border: '0', borderTop: '1px solid #eee', margin: '20px 0' },
  itemsList: { marginTop: '10px' },
  itemsTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#555',
  },
  ul: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  li: {
    fontSize: '0.95rem',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  itemQty: { fontWeight: 'bold', color: '#666', marginRight: '5px' },
  itemPrice: { fontWeight: '600', color: '#111', whiteSpace: 'nowrap' },
  shippingBlock: { marginTop: '4px' },
  shippingText: { margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.5 },
};
