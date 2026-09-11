import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { request } from '../api';
import { useStore } from '../context/useStore';
import { AlertIcon, ArrowRight } from '../components/Icons';
import AuthLayout from './AuthLayout';

export default function Register() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const data = await request('/api/auth/register', null, { method: 'POST', body: JSON.stringify(form) });
      signIn(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heading="Join the club." blurb="Keep a wishlist, check out faster and track every order in one place.">
      <span className="eyebrow">Register</span>
      <h1>Create your account</h1>
      <p className="lead">It's free and takes less than a minute.</p>
      {error && <div className="alert alert-danger"><AlertIcon /> {error}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="first_name">First name</label>
            <input id="first_name" className="input" value={form.first_name} onChange={set('first_name')} required autoComplete="given-name" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last name</label>
            <input id="last_name" className="input" value={form.last_name} onChange={set('last_name')} required autoComplete="family-name" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={form.email} onChange={set('email')} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
          <span className="hint">At least 8 characters.</span>
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Creating account…' : <>Create account <ArrowRight /></>}
        </button>
      </form>
      <p className="auth-foot">Already have an account? <Link to="/login" state={{ from }} className="link">Sign in</Link></p>
    </AuthLayout>
  );
}
