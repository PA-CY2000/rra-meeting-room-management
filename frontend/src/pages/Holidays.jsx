import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({ date: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchHolidays = () => {
    api.get('/holidays').then((res) => setHolidays(res.data.data || []));
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.post('/holidays', form);
      setSuccess('Holiday added successfully.');
      setForm({ date: '', name: '' });
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (holiday) => {
    if (!window.confirm(`Remove holiday "${holiday.name}"?`)) return;
    try {
      await api.delete(`/holidays/${holiday.id}`);
      fetchHolidays();
    } catch {
      alert('Failed to delete holiday.');
    }
  };

  const getDay = () => form.date ? form.date.split('-')[2] : '';
  const getMonth = () => form.date ? form.date.split('-')[1] : '';
  const getYear = () => form.date ? form.date.split('-')[0] : String(new Date().getFullYear());

  const updateDate = (part, value) => {
    const y = part === 'year' ? value : getYear();
    const m = part === 'month' ? value : (getMonth() || '01');
    const d = part === 'day' ? value.padStart(2, '0') : (getDay() || '01');
    setForm({ ...form, date: `${y}-${m}-${d}` });
  };

  return (
    <Layout title="Public Holidays">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Add Holiday Form */}
        <div className="card">
          <div className="card-header"><h2>Add Holiday</h2></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Day *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1" max="31"
                    placeholder="DD"
                    value={getDay()}
                    onChange={(e) => updateDate('day', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Month *</label>
                  <select
                    className="form-control"
                    value={getMonth()}
                    onChange={(e) => updateDate('month', e.target.value)}
                    required
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select
                    className="form-control"
                    value={getYear()}
                    onChange={(e) => updateDate('year', e.target.value)}
                    required
                  >
                    {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Holiday Name *</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Independence Day"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                {saving ? 'Adding...' : '+ Add Holiday'}
              </button>
            </form>
          </div>
        </div>

        {/* Holidays List */}
        <div className="card">
          <div className="card-header"><h2>All Holidays ({holidays.length})</h2></div>
          {holidays.length === 0 ? (
            <div className="empty-state"><p>No holidays added yet.</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Date</th><th>Holiday Name</th><th>Action</th></tr>
              </thead>
              <tbody>
                {holidays.map((h, i) => (
                  <tr key={h.id}>
                    <td>{i + 1}</td>
                    <td>{h.date}</td>
                    <td>{h.name}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}
