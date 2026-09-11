import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { request } from '../api';
import { useStore } from '../context/useStore';
import { AlertIcon, ArrowRight } from '../components/Icons';
import AuthLayout from './AuthLayout';

export default function Login() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await request('/api/auth/login', null, { method: 'POST', body: JSON.stringify(form) });
      signIn(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heading="Welcome back." blurb="Sign in to see your bag, saved items and order history.">
      <span className="eyebrow">Sign in</span>
      <h1>Good to see you</h1>
      <p className="lead">Enter your details to continue.</p>
      {error && <div className="alert alert-danger"><AlertIcon /> {error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Signing in…' : <>Sign in <ArrowRight /></>}
        </button>
      </form>
      <p className="auth-foot">New here? <Link to="/register" state={{ from }} className="link">Create an account</Link></p>
    </AuthLayout>
  );
}
