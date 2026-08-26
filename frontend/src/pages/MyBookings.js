import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const fetchBookings = () => {
    api.get('/bookings').then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
  );

  const statusMessage = (status) => {
    if (status === 'PENDING') return 'Waiting for admin approval';
    if (status === 'APPROVED') return 'Booking confirmed';
    if (status === 'REJECTED') return 'Booking was rejected';
    if (status === 'CANCELLED') return 'Booking cancelled';
    if (status === 'CANCEL_REQUESTED') return 'Waiting for admin to approve cancel';
    return '';
  };

  const canCancel = (status) => status === 'PENDING' || status === 'APPROVED';

  const openCancel = (booking) => {
    setCancelError('');
    setCancelTarget(booking);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget.id);
    setCancelError('');
    try {
      await api.put(`/bookings/${cancelTarget.id}/cancel`);
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatWhen = (b) => {
    const time = b.startTime && b.endTime ? ` ${b.startTime}–${b.endTime}` : '';
    return `${b.startDate} to ${b.endDate}${time}`;
  };

  return (
    <Layout title="My Bookings">
      <div className="card">
        <div className="card-header">
          <h2>My Booking History ({bookings.length})</h2>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p>You have not made any bookings yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Info</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td><strong>{b.roomName}</strong></td>
                  <td>{b.purpose}</td>
                  <td>{formatWhen(b)}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td style={{ fontSize: '12px', color: '#6b7280' }}>{statusMessage(b.status)}</td>
                  <td>
                    {canCancel(b.status) ? (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionLoading === b.id}
                        onClick={() => openCancel(b)}
                      >
                        {b.status === 'PENDING' ? 'Cancel' : 'Request Cancel'}
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{cancelTarget.status === 'PENDING' ? 'Cancel Booking' : 'Request Cancellation'}</h2>
              <button className="modal-close" onClick={() => setCancelTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              {cancelError && <div className="alert alert-error">{cancelError}</div>}
              <p style={{ marginBottom: '12px' }}>
                {cancelTarget.status === 'PENDING'
                  ? 'This pending booking will be cancelled immediately.'
                  : 'This booking is already approved. An admin must approve the cancellation.'}
              </p>
              <div className="alert alert-info">
                <strong>Room:</strong> {cancelTarget.roomName}<br />
                <strong>Purpose:</strong> {cancelTarget.purpose}<br />
                <strong>When:</strong> {formatWhen(cancelTarget)}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setCancelTarget(null)}>Back</button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={actionLoading === cancelTarget.id}
                onClick={confirmCancel}
              >
                {actionLoading === cancelTarget.id
                  ? 'Please wait...'
                  : cancelTarget.status === 'PENDING' ? 'Cancel Booking' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
