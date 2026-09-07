import React, { useState } from 'react';

export default function Checkout() {
  // Hardcoded dummy data so you can see a live UI immediately
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Wireless Mechanical Keyboard', price: 1299.99, quantity: 1 },
    { id: 2, name: 'Ergonomic Gaming Mouse', price: 649.50, quantity: 2 },
  ]);

  const [formData, setFormData] = useState({
    fullName: 'Robin-Leigh Basson',
    email: 'robin@example.com',
    address: '123 Tech Street',
    city: 'Cape Town',
    postalCode: '8001',
    cardNumber: '4242 •••• •••• 4242',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate total dynamically from dummy data
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 100.00;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>Secure Checkout</h2>

        {isSubmitted ? (
          <div style={styles.successBox}>
            <h3>🎉 Order Placed Successfully!</h3>
            <p>Thank you for your purchase, {formData.fullName}. Your order is being processed.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Left Column: Form Inputs */}
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
                Pay R {total.toFixed(2)}
              </button>
            </form>

            {/* Right Column: Order Summary */}
            <div style={styles.summarySection}>
              <h3 style={styles.sectionTitle}>Order Summary</h3>
              <div style={styles.itemList}>
                {cartItems.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <div>
                      <p style={styles.itemName}>{item.name}</p>
                      <p style={styles.itemQty}>Qty: {item.quantity}</p>
                    </div>
                    <p style={styles.itemPrice}>R {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <hr style={styles.divider} />

              <div style={styles.summaryLine}>
                <span>Subtotal</span>
                <span>R {subtotal.toFixed(2)}</span>
              </div>
              <div style={styles.summaryLine}>
                <span>Shipping</span>
                <span>R {shipping.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.summaryLine, fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}>
                <span>Total</span>
                <span>R {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Clean inline styles to keep everything self-contained and neat
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