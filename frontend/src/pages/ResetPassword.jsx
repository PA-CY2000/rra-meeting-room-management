import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import RraLogo from '../rra-logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess('Password reset successfully! You can now sign in with your new password.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '400px', padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src={RraLogo} alt="RRA Logo" style={{ height: '80px', objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="auth-title" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Reset Password</h1>
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
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">NEW PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CONFIRM PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', justifyContent: 'center', marginTop: '8px' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            {!token && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>Invalid reset link.</p>}
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          <Link to="/login" style={{ color: 'var(--rra-blue)', fontWeight: 700 }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
