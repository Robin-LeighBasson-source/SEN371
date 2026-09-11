import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './pages/ProductCatalog.css'; 

export default function App() {
  // Ensure we don't accidentally load the string "null" from local storage
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return (savedToken && savedToken !== 'null') ? savedToken : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <div>
        <nav className="global-nav">
          <div className="nav-left">
            <Link to="/" style={{ fontSize: '24px' }}>+</Link>
          </div>
          
          <div className="nav-center">
            <NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>CATALOG</NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>ORDERS</NavLink>
            <NavLink to="/wishlist" className={({ isActive }) => isActive ? "active" : ""}>SAVED</NavLink>
          </div>

          <div className="nav-right" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {token ? (
              <button 
                onClick={handleLogout} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', textTransform: 'uppercase', color: '#000' }}
              >
                LOGOUT
              </button>
            ) : (
              <Link to="/login" style={{ fontSize: '11px', textDecoration: 'none', color: '#000' }}>LOGIN</Link>
            )}
            <Link to="/cart" style={{ fontSize: '11px', textDecoration: 'none', color: '#000' }}>BAG</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:sku" element={<ProductDetail />} />
          
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />

          <Route path="/cart" element={<Cart token={token} />} />
          <Route path="/wishlist" element={<Wishlist token={token} />} />
          <Route path="/checkout" element={<Checkout token={token} />} />
          <Route path="/orders" element={<OrderHistory token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}