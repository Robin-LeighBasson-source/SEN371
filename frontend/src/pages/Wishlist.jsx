import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { request, formatRands } from '../api';

export default function Wishlist({ token }) {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [productId, setProductId] = useState('');

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
    const loadWishlist = async () => await runRequest('/api/wishlist');
    loadWishlist();
  }, [runRequest]);

  const handleAdd = (e) => {
    e.preventDefault();
    setMessage(null);
    runRequest('/api/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId.trim() }) });
    setProductId('');
  };

  const handleRemove = (product) => {
    setMessage(null);
    runRequest(`/api/wishlist/items/${product._id}`, { method: 'DELETE' });
  };

  const handleMoveToCart = async (product) => {
    setMessage(null);
    const data = await runRequest(`/api/wishlist/items/${product._id}/move-to-cart`, { method: 'POST' });
    if (data) setMessage(`"${product.name}" MOVED TO BAG.`);
  };

  if (loading) return <main className="brutalist-checkout"><p>LOADING SAVED ITEMS...</p></main>;

  const products = wishlist?.products ?? [];

  return (
    <main className="brutalist-checkout">
      <div className="brutalist-top-bar">
        <Link to="/products">{'<'}</Link>
        <span>SAVED</span>
      </div>

      <h2 className="brutalist-header" style={{ fontSize: '24px', marginBottom: '20px' }}>SAVED FOR LATER</h2>

      {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
      {message && <p style={{ color: '#000', fontWeight: 'bold', fontSize: '12px', marginBottom: '20px' }}>{message}</p>}

      <form onSubmit={handleAdd} className="brutalist-row" style={{ marginBottom: '60px', alignItems: 'flex-start' }}>
        <input 
          type="text" 
          value={productId} 
          onChange={(e) => setProductId(e.target.value)} 
          placeholder="PASTE A PRODUCT ID TO SAVE IT" 
          className="brutalist-input" 
          style={{ marginBottom: 0 }}
          required 
        />
        <button type="submit" className="brutalist-btn" style={{ marginTop: 0, width: 'auto', padding: '14px 40px' }}>
          SAVE
        </button>
      </form>

      {products.length === 0 ? (
        <p>YOU HAVE NOT SAVED ANY PRODUCTS YET.</p>
      ) : (
        <div style={{ borderTop: '2px solid #000' }}>
          {products.map((product) => (
            <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0', borderBottom: '1px solid #000' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{product.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>{formatRands(product.price_cents)}</p>
                {product.stock_quantity === 0 && <p style={{ color: 'red', fontSize: '11px', marginTop: '10px' }}>OUT OF STOCK</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <button type="button" className="brutalist-link" style={{ margin: 0 }} onClick={() => handleRemove(product)}>REMOVE</button>
                <button 
                  type="button" 
                  className="brutalist-btn" 
                  style={{ margin: 0, width: 'auto', padding: '10px 30px' }} 
                  onClick={() => handleMoveToCart(product)} 
                  disabled={product.stock_quantity === 0}
                >
                  MOVE TO BAG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}