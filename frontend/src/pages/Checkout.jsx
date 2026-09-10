import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

const STEPS = ['shipping', 'payment', 'confirmation'];

export default function Checkout({ token }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('shipping');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [completedPayment, setCompletedPayment] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '4242 •••• •••• 4242',
    paymentMethod: 'Stripe',
  });

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

  const handleShippingContinue = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setStep('payment');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const orderResult = await request('/api/orders', token, {
        method: 'POST',
        body: JSON.stringify({
          shipping: {
            full_name: formData.fullName,
            email: formData.email,
            street_address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
          },
        }),
      });

      const payResult = await request(`/api/orders/${orderResult.order._id}/pay`, token, {
        method: 'POST',
        body: JSON.stringify({ payment_method: formData.paymentMethod }),
      });

      setCompletedOrder(payResult.order || orderResult.order);
      setCompletedPayment(payResult.payment);
      setCart({ ...(cart || {}), items: [] });
      setStep('confirmation');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
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

  if (items.length === 0 && step !== 'confirmation') {
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

  const orderSummary = (
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
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>Secure Checkout</h2>

        <div style={styles.stepper}>
          {STEPS.map((name, index) => {
            const activeIndex = STEPS.indexOf(step);
            const isActive = name === step;
            const isDone = index < activeIndex;
            return (
              <div key={name} style={styles.stepItem}>
                <div
                  style={{
                    ...styles.stepDot,
                    backgroundColor: isActive || isDone ? '#2563eb' : '#d1d5db',
                    color: isActive || isDone ? '#fff' : '#6b7280',
                  }}
                >
                  {index + 1}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#111' : '#6b7280',
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
                {index < STEPS.length - 1 && <div style={styles.stepLine} />}
              </div>
            );
          })}
        </div>

        {step === 'confirmation' ? (
          <div style={styles.successBox}>
            <h3>Order confirmed</h3>
            <p>
              Thank you, {completedOrder?.shipping_snapshot?.full_name || formData.fullName}.
              Your mock payment completed and the order is marked paid.
            </p>

            <div style={styles.confirmDetails}>
              <div style={styles.confirmRow}>
                <span>Order ID</span>
                <strong>{completedOrder?._id}</strong>
              </div>
              <div style={styles.confirmRow}>
                <span>Status</span>
                <strong>{completedOrder?.order_status || 'Paid'}</strong>
              </div>
              <div style={styles.confirmRow}>
                <span>Total paid</span>
                <strong>
                  {formatRands(
                    completedPayment?.amount_cents ??
                      completedOrder?.total_amount_cents ??
                      totalCents,
                  )}
                </strong>
              </div>
              <div style={styles.confirmRow}>
                <span>Payment</span>
                <strong>
                  {completedPayment?.payment_method || formData.paymentMethod}
                  {completedPayment?.status ? ` · ${completedPayment.status}` : ''}
                </strong>
              </div>
              <div style={styles.confirmRow}>
                <span>Transaction</span>
                <strong>{completedPayment?.transaction_id || '—'}</strong>
              </div>
            </div>

            <div style={styles.confirmShipping}>
              <p style={styles.confirmShippingTitle}>Shipping to</p>
              <p style={{ margin: 0 }}>
                {completedOrder?.shipping_snapshot?.full_name || formData.fullName}
                <br />
                {completedOrder?.shipping_snapshot?.email || formData.email}
                <br />
                {completedOrder?.shipping_snapshot?.street_address || formData.address}
                <br />
                {completedOrder?.shipping_snapshot?.city || formData.city}
                {', '}
                {completedOrder?.shipping_snapshot?.postal_code || formData.postalCode}
              </p>
            </div>

            <div style={styles.confirmActions}>
              <Link to="/orders" style={styles.confirmPrimaryLink}>
                View order history
              </Link>
              <Link to="/cart" style={styles.confirmSecondaryLink}>
                Back to cart
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {step === 'shipping' && (
              <form onSubmit={handleShippingContinue} style={styles.formSection}>
                <h3 style={styles.sectionTitle}>Shipping</h3>

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

                <button type="submit" style={styles.payButton}>
                  Continue to payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePlaceOrder} style={styles.formSection}>
                <h3 style={styles.sectionTitle}>Payment</h3>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Payment method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="Stripe">Stripe (simulated)</option>
                    <option value="PayPal">PayPal (simulated)</option>
                  </select>
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

                {submitError && (
                  <p style={{ color: '#b91c1c', margin: 0 }}>{submitError}</p>
                )}

                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setStep('shipping')}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.payButton,
                      opacity: submitting ? 0.7 : 1,
                      cursor: submitting ? 'wait' : 'pointer',
                    }}
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Processing…'
                      : `Place order · ${formatRands(totalCents)}`}
                  </button>
                </div>
              </form>
            )}

            {orderSummary}
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
    marginBottom: '20px',
    fontSize: '1.8rem',
    color: '#111',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    gap: '8px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    gap: '8px',
  },
  stepDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: '0.9rem',
  },
  stepLine: {
    flex: 1,
    height: '2px',
    backgroundColor: '#e5e7eb',
    marginLeft: '8px',
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
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
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
    marginTop: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
  },
  secondaryButton: {
    marginTop: '8px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
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
    textAlign: 'left',
    padding: '32px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#166534',
  },
  confirmDetails: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fff',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    color: '#14532d',
  },
  confirmRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    fontSize: '0.95rem',
    wordBreak: 'break-all',
  },
  confirmShipping: {
    marginTop: '16px',
    fontSize: '0.95rem',
    color: '#166534',
  },
  confirmShippingTitle: {
    fontWeight: '700',
    margin: '0 0 6px 0',
  },
  confirmActions: {
    marginTop: '20px',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  confirmPrimaryLink: {
    fontWeight: 'bold',
    color: '#166534',
    textDecoration: 'underline',
  },
  confirmSecondaryLink: {
    fontWeight: '600',
    color: '#3f6212',
    textDecoration: 'none',
  },
};
