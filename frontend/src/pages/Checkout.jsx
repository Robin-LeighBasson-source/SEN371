import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

export default function Checkout({ token }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    subscribe: true,
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'SOUTH AFRICA',
    cardName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await request('/api/cart', token);
        setCart(data.cart);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [token]);

  const items = cart?.items ?? [];
  const subtotalCents = items.reduce((sum, item) => sum + (item.product_id?.price_cents ?? 0) * item.quantity, 0);
  const shippingCents = items.length > 0 ? 0 : 0; // Assuming free shipping for this aesthetic
  const totalCents = subtotalCents + shippingCents;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
            full_name: formData.cardName || 'Customer', 
            email: formData.email, 
            street_address: `${formData.address} ${formData.apartment}`.trim(), 
            city: formData.city, 
            postal_code: formData.postalCode 
          },
        }),
      });
      
      // Process mock payment
      await request(`/api/orders/${orderResult.order._id}/pay`, token, {
        method: 'POST', body: JSON.stringify({ payment_method: 'Credit Card' }),
      });
      
      setCompletedOrder(orderResult.order);
      setCart({ ...(cart || {}), items: [] });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="brutalist-checkout"><p>LOADING...</p></main>;

  if (completedOrder) {
    return (
      <main className="brutalist-checkout">
        <div className="brutalist-top-bar">
          <Link to="/products">{'<'}</Link>
          <Link to="/cart">BAG</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ fontSize: '18px' }}>SUCCESS!</h2>
          <p style={{ color: '#666', marginTop: '20px' }}>ORDER #{completedOrder._id} CONFIRMED.</p>
          <Link to="/orders"><button className="brutalist-btn" style={{ maxWidth: '300px', marginTop: '40px' }}>VIEW ORDERS</button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="brutalist-checkout">
      <div className="brutalist-top-bar">
        <Link to="/cart">{'<'}</Link>
        <Link to="/cart">BAG</Link>
      </div>

      <div className="brutalist-grid">
        {/* LEFT COLUMN: FORM */}
        <div>
          <form onSubmit={handlePlaceOrder}>
            
            <h2 className="brutalist-header">CONTACT INFORMATION</h2>
            <label className="brutalist-label">EMAIL ADDRESS</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="brutalist-input" required />
            
            <div className="brutalist-checkbox-wrapper">
              <input type="checkbox" name="subscribe" checked={formData.subscribe} onChange={handleChange} className="brutalist-checkbox" />
              <span>SUBSCRIBE TO UPDATES AND NOTIFICATIONS</span>
            </div>

            <h2 className="brutalist-header">BILLING ADDRESS</h2>
            <label className="brutalist-label">ADDRESS</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="START TYPING YOUR ADDRESS..." className="brutalist-input" required />
            
            <label className="brutalist-label">APARTMENT, SUITE, UNIT, ETC. (OPTIONAL)</label>
            <input type="text" name="apartment" value={formData.apartment} onChange={handleChange} placeholder="APARTMENT, SUITE, UNIT, FLOOR, ETC." className="brutalist-input" />
            
            <div className="brutalist-row">
              <div className="brutalist-col">
                <label className="brutalist-label">CITY</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="brutalist-input" required />
              </div>
              <div className="brutalist-col">
                <label className="brutalist-label">STATE / PROVINCE</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="brutalist-input" required />
              </div>
            </div>

            <div className="brutalist-row">
              <div className="brutalist-col">
                <label className="brutalist-label">ZIP / POSTAL CODE</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="brutalist-input" required />
              </div>
              <div className="brutalist-col">
                <label className="brutalist-label">COUNTRY</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="brutalist-input" readOnly />
              </div>
            </div>

            <h2 className="brutalist-header">PAYMENT DETAILS</h2>
            
            <div className="brutalist-card-selector">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '30px', height: '20px', background: '#000', borderRadius: '2px' }}></div>
                <div className="brutalist-card-info">
                  <h4>CREDIT / DEBIT CARD</h4>
                  <p>Visa, Mastercard, Amex, Discover</p>
                </div>
              </div>
              <div className="brutalist-checkbox" style={{ background: '#000' }}><span style={{ color: '#fff', position: 'absolute', left: '3px', top: '-1px', fontSize: '12px' }}>✓</span></div>
            </div>

            <label className="brutalist-label">CARDHOLDER NAME</label>
            <input type="text" name="cardName" value={formData.cardName} onChange={handleChange} placeholder="FULL NAME ON CARD" className="brutalist-input" required />

            <label className="brutalist-label">CARD NUMBER</label>
            <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" className="brutalist-input" required maxLength="19" />

            <div className="brutalist-row">
              <div className="brutalist-col">
                <label className="brutalist-label">EXP MONTH</label>
                <select name="expMonth" value={formData.expMonth} onChange={handleChange} className="brutalist-input brutalist-select" required>
                  <option value="" disabled>MM</option>
                  {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{String(i+1).padStart(2, '0')}</option>)}
                </select>
              </div>
              <div className="brutalist-col">
                <label className="brutalist-label">EXP YEAR</label>
                <select name="expYear" value={formData.expYear} onChange={handleChange} className="brutalist-input brutalist-select" required>
                  <option value="" disabled>YYYY</option>
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
              <div className="brutalist-col">
                <label className="brutalist-label">SECURITY CODE</label>
                <input type="text" name="cvc" value={formData.cvc} onChange={handleChange} placeholder="CVC" className="brutalist-input" required maxLength="4" />
              </div>
            </div>

            <div className="brutalist-secure-note">
              <span>🔒</span>
              <span>SECURE PAYMENT<br/><span style={{ color: '#aaa' }}>All transactions are encrypted and secure</span></span>
            </div>

            {submitError && <p style={{ color: 'red', fontSize: '12px' }}>{submitError}</p>}
            
            <button type="submit" className="brutalist-btn" disabled={submitting || items.length === 0}>
              {submitting ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div style={{ position: 'sticky', top: '40px' }}>
          <h2 className="brutalist-header">ORDER SUMMARY</h2>
          
          <div className="brutalist-summary-items">
            {items.length === 0 ? (
              <p>YOUR CART IS EMPTY</p>
            ) : (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {items.map((item) => (
                  <div key={item.product_id._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.quantity}x {item.product_id.name}</span>
                    <span>{formatRands(item.product_id.price_cents * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="brutalist-summary-line">
              <span>SUBTOTAL</span>
              <span>{formatRands(subtotalCents)}</span>
            </div>
            <div className="brutalist-summary-line">
              <span>TAXES</span>
              <span>{formatRands(shippingCents)}</span>
            </div>
            <div className="brutalist-summary-line" style={{ marginTop: '30px', fontWeight: 'bold' }}>
              <span>TOTAL</span>
              <span>{formatRands(totalCents)}</span>
            </div>
            
            <span className="brutalist-link">YZY CODE</span>
          </div>
        </div>

      </div>
    </main>
  );
}