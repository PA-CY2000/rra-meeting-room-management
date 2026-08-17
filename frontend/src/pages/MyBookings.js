import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings').then((res) => setBookings(res.data.data)).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );

  const statusMessage = (status) => {
    if (status === 'PENDING') return 'Waiting for admin approval';
    if (status === 'APPROVED') return 'Booking confirmed';
    if (status === 'REJECTED') return 'Booking was rejected';
    return '';
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
                <th>Start Date</th>
                <th>End Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td><strong>{b.roomName}</strong></td>
                  <td>{b.purpose}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td style={{ fontSize: '12px', color: '#6b7280' }}>{statusMessage(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
