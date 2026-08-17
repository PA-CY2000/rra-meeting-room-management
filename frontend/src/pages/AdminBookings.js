import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = () => {
    api.get('/bookings').then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.put(`/bookings/${id}/${action}`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );

  return (
    <Layout title="Booking Requests">
      <div className="card">
        <div className="card-header">
          <h2>All Booking Requests ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>{b.userFullName}</td>
                  <td>{b.roomName}</td>
                  <td>{b.purpose}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td>
                    {b.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={actionLoading === b.id + 'approve'}
                          onClick={() => handleAction(b.id, 'approve')}
                        >
                          {actionLoading === b.id + 'approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading === b.id + 'reject'}
                          onClick={() => handleAction(b.id, 'reject')}
                        >
                          {actionLoading === b.id + 'reject' ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {b.status !== 'PENDING' && (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        By {b.approvedByName || '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
