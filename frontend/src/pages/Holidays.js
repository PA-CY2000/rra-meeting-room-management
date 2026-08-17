import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCells(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    const day = daysInPrev - startOffset + 1 + i;
    const prev = month === 0 ? new Date(year - 1, 11, day) : new Date(year, month - 1, day);
    cells.push({
      day,
      other: true,
      key: toKey(prev.getFullYear(), prev.getMonth(), day),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, other: false, key: toKey(year, month, day) });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - startOffset - daysInMonth + 1;
    const next = month === 11 ? new Date(year + 1, 0, day) : new Date(year, month + 1, day);
    cells.push({
      day,
      other: true,
      key: toKey(next.getFullYear(), next.getMonth(), day),
    });
  }

  return cells;
}

export default function Holidays() {
  const today = new Date();
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState({ date: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchHolidays = () => {
    api.get('/holidays').then((res) => setHolidays(res.data.data || []));
  };

  useEffect(() => { fetchHolidays(); }, []);

  const holidayMap = useMemo(() => {
    const map = {};
    holidays.forEach((h) => { map[h.date] = h; });
    return map;
  }, [holidays]);

  const cells = useMemo(() => buildCells(year, month), [year, month]);
  const selectedHoliday = selectedKey ? holidayMap[selectedKey] : null;
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const changeMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedKey(null);
  };

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
      setSelectedKey(null);
      fetchHolidays();
    } catch {
      alert('Failed to delete holiday.');
    }
  };

  return (
    <Layout title="Public Holidays">
      <div className="holiday-layout">
        <div className="card">
          <div className="card-header calendar-toolbar">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => changeMonth(-1)}>‹ Prev</button>
            <h2>{MONTHS[month]} {year}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="form-control"
                style={{ width: '110px', padding: '6px 10px' }}
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setSelectedKey(null); }}
              >
                {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => changeMonth(1)}>Next ›</button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-grid">
            {cells.map((cell) => {
              const holiday = holidayMap[cell.key];
              const classes = [
                'calendar-day',
                cell.other ? 'other-month' : '',
                holiday ? 'is-holiday' : '',
                cell.key === todayKey ? 'is-today' : '',
                cell.key === selectedKey ? 'is-selected' : '',
              ].filter(Boolean).join(' ');
              return (
                <button
                  type="button"
                  key={cell.key}
                  className={classes}
                  title={holiday ? holiday.name : undefined}
                  onClick={() => setSelectedKey(cell.key)}
                >
                  <span className="calendar-date">{cell.day}</span>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span><i className="legend-dot holiday" /> Rwanda public holiday</span>
            <span><i className="legend-dot today" /> Today</span>
          </div>
        </div>

        <div className="holiday-side">
          <div className="card">
            <div className="card-header"><h2>Selected Date</h2></div>
            <div className="card-body">
              {!selectedKey && <p className="muted-text">Click a date on the calendar.</p>}
              {selectedKey && !selectedHoliday && (
                <p className="muted-text"><strong>{selectedKey}</strong> is not a public holiday.</p>
              )}
              {selectedHoliday && (
                <>
                  <p style={{ marginBottom: '8px' }}><strong>{selectedHoliday.date}</strong></p>
                  <p style={{ marginBottom: '16px' }}>{selectedHoliday.name}</p>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedHoliday)}>
                    Remove Holiday
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Add Holiday</h2></div>
            <div className="card-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleAdd}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Holiday Name *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Independence Day" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                  {saving ? 'Adding...' : '+ Add Holiday'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
