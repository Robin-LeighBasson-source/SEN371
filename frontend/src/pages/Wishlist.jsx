import { useState, useEffect, useCallback } from 'react';
import { request, formatRands } from '../api';

export default function Wishlist({ token }) {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [productId, setProductId] = useState('');

  // Same pattern as the cart page: the backend returns the updated wishlist and
  // that answer becomes the new screen state.
  const runRequest = useCallback(async (path, options) => {
    try {
      const data = await request(path, token, options);
      setWishlist(data.wishlist);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Wrapped in its own async function, the same way OrderHistory loads its
    // data, so the effect itself stays synchronous.
    const loadWishlist = async () => {
      await runRequest('/api/wishlist');
    };

    loadWishlist();
  }, [runRequest]);

  const handleAdd = (event) => {
    event.preventDefault();
    setMessage(null);
    runRequest('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId.trim() }),
    });
    setProductId('');
  };

  const handleRemove = (product) => {
    setMessage(null);
    runRequest(`/api/wishlist/items/${product._id}`, { method: 'DELETE' });
  };

  const handleMoveToCart = async (product) => {
    setMessage(null);
    const data = await runRequest(
      `/api/wishlist/items/${product._id}/move-to-cart`,
      { method: 'POST' },
    );

    if (data) {
      setMessage(`"${product.name}" was moved to your cart.`);
    }
  };

  if (loading) return <div style={styles.pageContainer}><h2>Loading your wishlist...</h2></div>;

  const products = wishlist?.products ?? [];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <h2 style={styles.headerTitle}>My Wishlist</h2>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        {/* Temporary, same as on the cart page: until products can be browsed,
            a product is saved by pasting its id. */}
        <form onSubmit={handleAdd} style={styles.addForm}>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Paste a product ID to save it"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.primaryButton}>Save for later</button>
        </form>

        {products.length === 0 ? (
          <p style={styles.empty}>You have not saved any products yet.</p>
        ) : (
          <div style={styles.itemList}>
            {products.map((product) => (
              <div key={product._id} style={styles.itemCard}>
                <div>
                  <p style={styles.itemName}>{product.name}</p>
                  <p style={styles.itemPrice}>{formatRands(product.price_cents)}</p>
                  {product.stock_quantity === 0 && (
                    <p style={styles.outOfStock}>Out of stock</p>
                  )}
                </div>

                <div style={styles.itemControls}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    Move to cart
                  </button>
                  <button
                    type="button"
                    style={styles.linkButton}
                    onClick={() => handleRemove(product)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  success: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem' },
  addForm: { display: 'flex', gap: '10px', marginBottom: '25px' },
  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' },
  primaryButton: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  empty: { color: '#666' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  itemCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #eaeaea', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
  itemName: { fontWeight: 'bold', fontSize: '1.05rem', margin: '0 0 5px 0', color: '#111' },
  itemPrice: { fontSize: '0.9rem', color: '#666', margin: 0 },
  outOfStock: { fontSize: '0.8rem', color: '#b91c1c', margin: '5px 0 0 0' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '15px' },
  linkButton: { border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', padding: 0 },
};
