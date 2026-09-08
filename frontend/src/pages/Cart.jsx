import { useState, useEffect, useCallback } from 'react';
import { request, formatRands } from '../api';

export default function Cart({ token }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState('');

  // Every change is sent to the backend, which answers with the whole updated
  // cart. Storing that answer keeps the screen and the database in step without
  // the page having to recalculate anything itself.
  const runRequest = useCallback(async (path, options) => {
    try {
      const data = await request(path, token, options);
      setCart(data.cart);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Wrapped in its own async function, the same way OrderHistory loads its
    // data, so the effect itself stays synchronous.
    const loadCart = async () => {
      await runRequest('/api/cart');
    };

    loadCart();
  }, [runRequest]);

  const handleAdd = (event) => {
    event.preventDefault();
    runRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId.trim(), quantity: 1 }),
    });
    setProductId('');
  };

  const handleQuantityChange = (item, quantity) => {
    // The remove button is the way to take a line out, so 1 is the floor here.
    if (quantity < 1) return;
    runRequest(`/api/cart/items/${item.product_id._id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  };

  const handleRemove = (item) =>
    runRequest(`/api/cart/items/${item.product_id._id}`, { method: 'DELETE' });

  const handleClear = () => runRequest('/api/cart', { method: 'DELETE' });

  if (loading) return <div style={styles.pageContainer}><h2>Loading your cart...</h2></div>;

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.product_id.price_cents * item.quantity,
    0,
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>My Cart</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* Temporary way to put something in the cart until the products module
            has a browsable product list to click from. */}
        <form onSubmit={handleAdd} style={styles.addForm}>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Paste a product ID to add it"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.primaryButton}>Add to cart</button>
        </form>

        {items.length === 0 ? (
          <p style={styles.empty}>Your cart is empty.</p>
        ) : (
          <>
            <div style={styles.itemList}>
              {items.map((item) => (
                <div key={item._id} style={styles.itemCard}>
                  <div>
                    <p style={styles.itemName}>{item.product_id.name}</p>
                    <p style={styles.itemPrice}>
                      {formatRands(item.product_id.price_cents)} each
                    </p>
                  </div>

                  <div style={styles.itemControls}>
                    <div style={styles.quantityBox}>
                      <button
                        type="button"
                        style={styles.stepButton}
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        type="button"
                        style={styles.stepButton}
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <p style={styles.lineTotal}>
                      {formatRands(item.product_id.price_cents * item.quantity)}
                    </p>

                    <button
                      type="button"
                      style={styles.linkButton}
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <button type="button" style={styles.linkButton} onClick={handleClear}>
                Clear cart
              </button>
              <p style={styles.total}>Total: {formatRands(total)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px', color: '#333' },
  wrapper: { maxWidth: '800px', margin: '0 auto' },
  headerTitle: { marginBottom: '25px', fontSize: '1.8rem', color: '#111' },
  error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem' },
  addForm: { display: 'flex', gap: '10px', marginBottom: '25px' },
  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' },
  primaryButton: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  empty: { color: '#666' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  itemCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #eaeaea', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
  itemName: { fontWeight: 'bold', fontSize: '1.05rem', margin: '0 0 5px 0', color: '#111' },
  itemPrice: { fontSize: '0.85rem', color: '#666', margin: 0 },
  itemControls: { display: 'flex', alignItems: 'center', gap: '20px' },
  quantityBox: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 8px' },
  stepButton: { border: 'none', background: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#444', lineHeight: 1 },
  quantity: { minWidth: '20px', textAlign: 'center', fontWeight: '600' },
  lineTotal: { fontWeight: 'bold', margin: 0, minWidth: '90px', textAlign: 'right' },
  linkButton: { border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', padding: 0 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #eee' },
  total: { fontWeight: 'bold', fontSize: '1.2rem', margin: 0, color: '#111' },
};
