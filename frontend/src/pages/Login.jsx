import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to authenticate');
      }

      // Save token and update App state
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="brutalist-checkout" style={{ maxWidth: '500px', marginTop: '100px' }}>
      <h2 className="brutalist-header" style={{ textAlign: 'center', fontSize: '24px' }}>LOG IN</h2>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
        <label className="brutalist-label">EMAIL ADDRESS</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="brutalist-input" 
          required 
        />

        <label className="brutalist-label">PASSWORD</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="brutalist-input" 
          style={{ textTransform: 'none' }} 
          required 
        />

        {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

        <button type="submit" className="brutalist-btn" disabled={loading}>
          {loading ? 'AUTHENTICATING...' : 'ENTER'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/register" className="brutalist-link">CREATE AN ACCOUNT</Link>
      </div>
    </main>
  );
}