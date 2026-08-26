import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchBookings = () => {
    api.get('/bookings').then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    setActionError('');
    try {
      await api.put(`/bookings/${id}/${action}`);
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} booking.`);
    } finally {
      setActionLoading(null);
    }
  };

  const cancelRequestList = bookings.filter((b) => b.status === 'CANCEL_REQUESTED');
  const cancelRequests = cancelRequestList.length;

  const setStatusFilter = (next) => {
    setFilter(next);
    if (next === 'ALL') setSearchParams({});
    else setSearchParams({ filter: next });
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);
    if (q) {
      list = list.filter((b) =>
        [b.userFullName, b.roomName, b.purpose, b.status, b.startDate, b.endDate]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (filter === 'ALL') {
        if (a.status === 'CANCEL_REQUESTED' && b.status !== 'CANCEL_REQUESTED') return -1;
        if (b.status === 'CANCEL_REQUESTED' && a.status !== 'CANCEL_REQUESTED') return 1;
      }
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === 'newest' ? db - da : da - db;
    });
  }, [bookings, filter, search, sort]);

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
  );

  const formatWhen = (b) => {
    const time = b.startTime && b.endTime ? ` ${b.startTime}–${b.endTime}` : '';
    return `${b.startDate} to ${b.endDate}${time}`;
  };

  return (
    <Layout title="Booking Requests">
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {cancelRequests > 0 && (
        <div className="card" style={{ marginBottom: '16px', borderColor: '#f59e0b' }}>
          <div className="card-header">
            <h2>Cancellation Requests ({cancelRequests})</h2>
            <span className="badge badge-cancel_requested">Needs admin action</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelRequestList.map((b) => (
                <tr key={b.id} style={{ background: '#fffbeb' }}>
                  <td>{b.userFullName}</td>
                  <td>{b.roomName}</td>
                  <td>{b.purpose}</td>
                  <td>{formatWhen(b)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={actionLoading === b.id + 'approve-cancel'}
                        onClick={() => handleAction(b.id, 'approve-cancel')}
                      >
                        {actionLoading === b.id + 'approve-cancel' ? '...' : 'Approve Cancel'}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={actionLoading === b.id + 'reject-cancel'}
                        onClick={() => handleAction(b.id, 'reject-cancel')}
                      >
                        {actionLoading === b.id + 'reject-cancel' ? '...' : 'Keep Booking'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <h2>All Booking Requests ({visible.length})</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCEL_REQUESTED', 'CANCELLED'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', flexWrap: 'wrap' }}>
          <input
            className="form-control"
            style={{ flex: 1, minWidth: '220px' }}
            placeholder="Search user, room, purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-control" style={{ width: '180px' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading...</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b, i) => (
                <tr key={b.id} style={b.status === 'CANCEL_REQUESTED' ? { background: '#fffbeb' } : undefined}>
                  <td>{i + 1}</td>
                  <td>{b.userFullName}</td>
                  <td>{b.roomName}</td>
                  <td>{b.purpose}</td>
                  <td>{formatWhen(b)}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
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
                    {b.status === 'CANCEL_REQUESTED' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={actionLoading === b.id + 'approve-cancel'}
                          onClick={() => handleAction(b.id, 'approve-cancel')}
                        >
                          {actionLoading === b.id + 'approve-cancel' ? '...' : 'Approve Cancel'}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={actionLoading === b.id + 'reject-cancel'}
                          onClick={() => handleAction(b.id, 'reject-cancel')}
                        >
                          {actionLoading === b.id + 'reject-cancel' ? '...' : 'Keep Booking'}
                        </button>
                      </div>
                    )}
                    {b.status !== 'PENDING' && b.status !== 'CANCEL_REQUESTED' && (
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
