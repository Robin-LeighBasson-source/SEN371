import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ setToken }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

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
      <h2 className="brutalist-header" style={{ textAlign: 'center', fontSize: '24px' }}>CREATE ACCOUNT</h2>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
        <div className="brutalist-row">
          <div className="brutalist-col">
            <label className="brutalist-label">FIRST NAME</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="brutalist-input" required />
          </div>
          <div className="brutalist-col">
            <label className="brutalist-label">LAST NAME</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="brutalist-input" required />
          </div>
        </div>

        <label className="brutalist-label">EMAIL ADDRESS</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="brutalist-input" required />

        <label className="brutalist-label">PASSWORD</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="brutalist-input" style={{ textTransform: 'none' }} required />

        {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

        <button type="submit" className="brutalist-btn" disabled={loading}>
          {loading ? 'PROCESSING...' : 'REGISTER'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/login" className="brutalist-link">ALREADY HAVE AN ACCOUNT?</Link>
      </div>
    </main>
  );
}