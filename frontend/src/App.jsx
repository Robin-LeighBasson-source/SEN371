import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';

export default function App() {
  // We will pass a temporary mock token just to render the UI. 
  // You will replace this later with the actual token from your group's login module.
 const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTlmMWEzNzZkMDRhNjg3NWY1OTc3NzkiLCJpZCI6IjZhOWYxYTM3NmQwNGE2ODc1ZjU5Nzc3OSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4ODgxMTgzMSwiZXhwIjoxNzg5NDE2NjMxfQ.hctUksgB44CYxdn1XGMZzdvSThU7zGuSCeAACzV1ASA";;

  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        {/* Temporary Navigation Bar to help you click between pages */}
        <nav style={{ marginBottom: '20px', padding: '10px', background: '#eee', borderRadius: '5px' }}>
          <Link to="/cart" style={{ marginRight: '15px', fontWeight: 'bold' }}>My Cart</Link>
          <Link to="/wishlist" style={{ marginRight: '15px', fontWeight: 'bold' }}>My Wishlist</Link>
          <Link to="/checkout" style={{ marginRight: '15px', fontWeight: 'bold' }}>Go to Checkout</Link>
          <Link to="/orders" style={{ fontWeight: 'bold' }}>View Order History</Link>
        </nav>

        <Routes>
          <Route path="/cart" element={<Cart token={mockToken} />} />
          <Route path="/wishlist" element={<Wishlist token={mockToken} />} />
          <Route path="/checkout" element={<Checkout token={mockToken} />} />
          <Route path="/orders" element={<OrderHistory token={mockToken} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}