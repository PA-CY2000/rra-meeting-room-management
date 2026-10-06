import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import RraLogo from '../rra-logo.png';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Your default password is RRA@2024 — go to Sign In and use it to log in. A password reset link will be sent to your email after your first login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '420px', padding: '40px 36px' }}>

        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src={RraLogo} alt="RRA Logo" style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="auth-title" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Sign Up</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Rwanda Revenue Authority</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            {success}
            <div style={{ marginTop: '12px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Go to Sign In</button>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                autoComplete="off"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="alert alert-info" style={{ fontSize: '12px', marginBottom: '16px' }}>
              Your default password is: <strong>RRA@2024</strong><br />
              After signing in, a password reset link will be sent to your email.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
              style={{ width: '100%', padding: '12px', fontSize: '15px', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase', justifyContent: 'center' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--rra-blue)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
