import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'demo@demo.com', password: 'Demo1234!' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  usePageTitle(mode === 'login' ? 'Sign in' : 'Create account');

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else { if (!form.name.trim()) throw new Error('Name is required'); await signup(form.name, form.email, form.password); }
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || err.message || 'Something went wrong'); }
    finally { setBusy(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="46" height="46">
          <rect width="32" height="32" rx="8" fill="#c0532b" />
          <rect x="7" y="8" width="5.4" height="16" rx="1.6" fill="#f4f1ea" />
          <rect x="13.3" y="8" width="5.4" height="11" rx="1.6" fill="#f4f1ea" opacity="0.75" />
          <rect x="19.6" y="8" width="5.4" height="6.5" rx="1.6" fill="#f4f1ea" opacity="0.5" />
        </svg>
      </div>
      <h1 className="login-title">{mode === 'login' ? 'Sign in to Boards' : 'Create your account'}</h1>
      <p className="muted login-sub">
        {mode === 'login' ? 'Pick up where your team left off.' : 'Free for you and everyone you invite.'}
      </p>
      <div className="card login-card">
        <p className="demo-hint" style={{ marginBottom: 16 }}>Demo account is filled in. Just press “Sign in” — email <strong>demo@demo.com</strong>, password <strong>Demo1234!</strong>.</p>
        <form className="stack" onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field"><label htmlFor="name">Name</label><input id="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></div>
          )}
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" /></div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="pass-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
      </div>
      <button className="btn linklike" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
