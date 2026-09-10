import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

export default function Checkout({ token }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '4242 •••• •••• 4242',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await request('/api/cart', token);
        setCart(data.cart);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token]);

  const items = cart?.items ?? [];
  const subtotalCents = items.reduce(
    (sum, item) => sum + (item.product_id?.price_cents ?? 0) * item.quantity,
    0,
  );
  const shippingCents = items.length > 0 ? 10000 : 0;
  const totalCents = subtotalCents + shippingCents;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <h2>Loading checkout...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.wrapper}>
          <h2 style={styles.headerTitle}>Secure Checkout</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <Link to="/cart">Back to cart</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.wrapper}>
          <h2 style={styles.headerTitle}>Secure Checkout</h2>
          <p>Your cart is empty. Add items before checking out.</p>
          <Link to="/cart" style={{ fontWeight: 'bold' }}>Go to cart</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>Secure Checkout</h2>

        {isSubmitted ? (
          <div style={styles.successBox}>
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for your purchase, {formData.fullName}. Your order is being processed.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            <form onSubmit={handleCheckoutSubmit} style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Shipping & Payment Info</h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroupHalf}>
                  <label style={styles.label}>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Card Details (Simulated)</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" style={styles.payButton}>
                Pay {formatRands(totalCents)}
              </button>
            </form>

            <div style={styles.summarySection}>
              <h3 style={styles.sectionTitle}>Order Summary</h3>
              <div style={styles.itemList}>
                {items.map((item) => (
                  <div key={item.product_id._id} style={styles.itemRow}>
                    <div>
                      <p style={styles.itemName}>{item.product_id.name}</p>
                      <p style={styles.itemQty}>Qty: {item.quantity}</p>
                    </div>
                    <p style={styles.itemPrice}>
                      {formatRands(item.product_id.price_cents * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <hr style={styles.divider} />

              <div style={styles.summaryLine}>
                <span>Subtotal</span>
                <span>{formatRands(subtotalCents)}</span>
              </div>
              <div style={styles.summaryLine}>
                <span>Shipping</span>
                <span>{formatRands(shippingCents)}</span>
              </div>
              <div style={{ ...styles.summaryLine, fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}>
                <span>Total</span>
                <span>{formatRands(totalCents)}</span>
              </div>
            </div>
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
  wrapper: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  headerTitle: {
    marginBottom: '25px',
    fontSize: '1.8rem',
    color: '#111',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '30px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  summarySection: {
    backgroundColor: '#fdfdfd',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #eaeaea',
    height: 'fit-content',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
    color: '#444',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  inputGroupHalf: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#666',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
  },
  payButton: {
    marginTop: '15px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  itemName: {
    fontWeight: '500',
    margin: 0,
  },
  itemQty: {
    fontSize: '0.8rem',
    color: '#777',
    margin: 0,
  },
  itemPrice: {
    fontWeight: '600',
    margin: 0,
  },
  divider: {
    border: '0',
    borderTop: '1px solid #eee',
    margin: '15px 0',
  },
  summaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    marginBottom: '8px',
    color: '#555',
  },
  successBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#166534',
  },
};
