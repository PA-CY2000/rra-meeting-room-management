import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import RraLogo from '../rra-logo.png';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.data);
      navigate(res.data.data.role === 'ADMIN' ? '/dashboard' : '/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '420px', padding: '40px 36px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src={RraLogo} alt="RRA Logo" style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="auth-title" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>Sign Up</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Rwanda Revenue Authority</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label">FULL NAME</label>
            <input type="text" name="signup-name" className="form-control" placeholder="Enter your full name" autoComplete="off" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input type="email" name="signup-email" className="form-control" placeholder="Enter your email" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input type="password" name="signup-password" className="form-control" placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">ACCOUNT TYPE</label>
            <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="USER">User (Book Rooms)</option>
              <option value="ADMIN">Administrator</option>
            </select>
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

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--rra-blue)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
