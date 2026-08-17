import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/statistics'),
      api.get('/bookings'),
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data.slice(0, 5));
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
    { label: 'Under Maintenance', value: stats?.maintenanceRooms, color: 'orange' },
    { label: 'Pending Bookings', value: stats?.pendingBookings, color: 'purple' },
    { label: 'Approved Bookings', value: stats?.approvedBookings, color: 'green' },
    { label: 'Rejected Bookings', value: stats?.rejectedBookings, color: 'red' },
    { label: "Today's Bookings", value: stats?.todayBookings, color: 'gold' },
    { label: 'Upcoming Bookings', value: stats?.upcomingBookings, color: 'blue' },
  ];

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );

  return (
    <Layout title="Dashboard">
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
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
          <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/admin/bookings'}>
            View All
          </button>
        </div>
        {bookings.length === 0 ? (
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
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.userFullName}</td>
                  <td>{b.roomName}</td>
                  <td>{b.purpose}</td>
                  <td>{b.startDate}</td>
                  <td>{b.endDate}</td>
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
