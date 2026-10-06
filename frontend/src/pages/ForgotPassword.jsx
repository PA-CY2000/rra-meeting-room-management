import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import RraLogo from '../rra-logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Password reset link sent! Check your email inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
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
          <h1 className="auth-title" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Forgot Password</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Rwanda Revenue Authority</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
              style={{ width: '100%', padding: '12px', fontSize: '15px', letterSpacing: '1px', marginTop: '8px', textTransform: 'uppercase', justifyContent: 'center' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          <Link to="/login" style={{ color: 'var(--rra-blue)', fontWeight: 700 }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
