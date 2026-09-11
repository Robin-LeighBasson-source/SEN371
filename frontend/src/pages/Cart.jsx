import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request, formatRands } from '../api';

export default function Cart({ token }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState('');
  const navigate = useNavigate();

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
    const loadCart = async () => await runRequest('/api/cart');
    loadCart();
  }, [runRequest]);

  const handleAdd = (e) => {
    e.preventDefault();
    runRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId.trim(), quantity: 1 }),
    });
    setProductId('');
  };

  const handleQuantityChange = (item, quantity) => {
    if (quantity < 1) return;
    runRequest(`/api/cart/items/${item.product_id._id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  };

  const handleRemove = (item) => runRequest(`/api/cart/items/${item.product_id._id}`, { method: 'DELETE' });
  const handleClear = () => runRequest('/api/cart', { method: 'DELETE' });

  if (loading) return <main className="brutalist-checkout"><p>LOADING BAG...</p></main>;

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.product_id.price_cents * item.quantity, 0);

  return (
    <main className="brutalist-checkout">
      <div className="brutalist-top-bar">
        <Link to="/products">{'<'}</Link>
        <span>BAG</span>
      </div>

      <h2 className="brutalist-header" style={{ fontSize: '24px', marginBottom: '40px' }}>YOUR BAG</h2>

      {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}

      <form onSubmit={handleAdd} className="brutalist-row" style={{ marginBottom: '60px', alignItems: 'flex-start' }}>
        <input 
          type="text" 
          value={productId} 
          onChange={(e) => setProductId(e.target.value)} 
          placeholder="PASTE A PRODUCT ID TO ADD" 
          className="brutalist-input" 
          style={{ marginBottom: 0 }}
          required 
        />
        <button type="submit" className="brutalist-btn" style={{ marginTop: 0, width: 'auto', padding: '14px 40px' }}>
          ADD
        </button>
      </form>

      {items.length === 0 ? (
        <p>YOUR BAG IS CURRENTLY EMPTY.</p>
      ) : (
        <div>
          <div style={{ borderTop: '2px solid #000' }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 0', borderBottom: '1px solid #000' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{item.product_id.name}</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#666' }}>{formatRands(item.product_id.price_cents)} EACH</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #000', padding: '5px 10px' }}>
                      <button type="button" onClick={() => handleQuantityChange(item, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>-</button>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button type="button" onClick={() => handleQuantityChange(item, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>+</button>
                    </div>
                    <button type="button" className="brutalist-link" style={{ margin: 0 }} onClick={() => handleRemove(item)}>REMOVE</button>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                    {formatRands(item.product_id.price_cents * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <button type="button" className="brutalist-link" onClick={handleClear}>CLEAR ENTIRE BAG</button>
            <div style={{ textAlign: 'right', minWidth: '300px' }}>
              <div className="brutalist-summary-line" style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
                <span>TOTAL</span>
                <span>{formatRands(total)}</span>
              </div>
              <button className="brutalist-btn" onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}