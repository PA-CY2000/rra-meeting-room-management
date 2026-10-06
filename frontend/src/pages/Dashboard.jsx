import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/statistics'),
      api.get('/bookings'),
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data.data);
      setBookings(
        [...bookingsRes.data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="loading"><div className="spinner"></div> Loading...</div>
    </Layout>
  );

  const statCards = [
    { label: 'Total Rooms', value: stats?.totalRooms, color: 'blue' },
    { label: 'Available Rooms', value: stats?.availableRooms, color: 'green' },
    { label: 'Pending Bookings', value: stats?.pendingBookings, color: 'purple' },
    { label: 'Approved Bookings', value: stats?.approvedBookings, color: 'green' },
    { label: 'Rejected Bookings', value: stats?.rejectedBookings, color: 'red' },
    { label: 'Cancel Requests', value: stats?.cancelRequestedBookings, color: 'orange' },
    { label: "Today's Bookings", value: stats?.todayBookings, color: 'gold' },
    { label: 'Upcoming Bookings', value: stats?.upcomingBookings, color: 'blue' },
  ];

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
  );

  const recent = bookings
    .filter((b) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [b.userFullName, b.roomName, b.purpose, b.status].filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (a.status === 'CANCEL_REQUESTED' && b.status !== 'CANCEL_REQUESTED') return -1;
      if (b.status === 'CANCEL_REQUESTED' && a.status !== 'CANCEL_REQUESTED') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 5);

  return (
    <Layout title="Dashboard">
      <div className="stats-grid">
        {statCards.map((card) => (
          <div
            className="stat-card"
            key={card.label}
            style={card.label === 'Cancel Requests' ? { cursor: 'pointer', borderColor: (card.value ?? 0) > 0 ? '#f59e0b' : undefined } : undefined}
            onClick={card.label === 'Cancel Requests' ? () => navigate('/admin/bookings?filter=CANCEL_REQUESTED') : undefined}
            role={card.label === 'Cancel Requests' ? 'button' : undefined}
          >
            <div className={`stat-icon ${card.color}`}>
              <div className="stat-icon-bar"></div>
            </div>
            <div className="stat-info">
              <div className="stat-value">{card.value ?? 0}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Booking Requests</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              className="form-control"
              style={{ width: '220px' }}
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/bookings')}>
              View All
            </button>
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <p>No bookings yet</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Room</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id} style={b.status === 'CANCEL_REQUESTED' ? { background: '#fffbeb' } : undefined}>
                  <td>{b.userFullName}</td>
                  <td>{b.roomName}</td>
                  <td>{b.purpose}</td>
                  <td>
                    {b.startDate} to {b.endDate}
                    {b.startTime && b.endTime ? ` ${b.startTime}–${b.endTime}` : ''}
                  </td>
                  <td>{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
