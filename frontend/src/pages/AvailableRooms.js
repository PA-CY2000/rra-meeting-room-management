import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

export default function AvailableRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [booking, setBooking] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchRooms = () => {
    setLoading(true);
    api.get('/rooms')
      .then((res) => setRooms(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load rooms.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const roomLabel = (room) => {
    if (room.status === 'MAINTENANCE') return { text: 'Maintenance', className: 'badge badge-maintenance' };
    if (room.currentlyBooked) return { text: 'Booked', className: 'badge badge-booked' };
    return { text: 'Available', className: 'badge badge-available' };
  };

  const canBook = (room) => room.status !== 'MAINTENANCE' && !room.currentlyBooked;

  const openBooking = (room) => {
    setSelectedRoom(room);
    setStartDate('');
    setEndDate('');
    setPurpose('');
    setBookingError('');
    setBookingSuccess('');
    setShowModal(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBooking(true);
    try {
      await api.post('/bookings', { roomId: selectedRoom.id, purpose, startDate, endDate });
      setBookingSuccess('Booking submitted! Waiting for admin approval.');
      setTimeout(() => {
        setShowModal(false);
        fetchRooms();
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout title="Available Rooms">
      <div className="card">
        <div className="card-header">
          <h2>All Rooms ({rooms.length})</h2>
        </div>

        {error && <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p>No rooms have been added yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, i) => {
                const availability = roomLabel(room);
                return (
                  <tr key={room.id}>
                    <td>{i + 1}</td>
                    <td><strong>{room.roomName}</strong></td>
                    <td>{room.capacity} people</td>
                    <td>
                      <span className={`badge badge-${room.status.toLowerCase()}`}>{room.status}</span>
                    </td>
                    <td>
                      <span className={availability.className}>{availability.text}</span>
                      {room.currentlyBooked && room.bookedUntil && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>until {room.bookedUntil}</span>
                      )}
                    </td>
                    <td>
                      {canBook(room) ? (
                        <button className="btn btn-gold btn-sm" onClick={() => openBooking(room)}>
                          Book
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" disabled>
                          {room.status === 'MAINTENANCE' ? 'Maintenance' : 'Booked'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Room</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleBook}>
              <div className="modal-body">
                {bookingError && <div className="alert alert-error">{bookingError}</div>}
                {bookingSuccess && <div className="alert alert-success">{bookingSuccess}</div>}
                <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                  <strong>Room:</strong> {selectedRoom.roomName}<br />
                  <strong>Location:</strong> {selectedRoom.location}<br />
                  <strong>Capacity:</strong> {selectedRoom.capacity} people
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input type="date" className="form-control" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input type="date" className="form-control" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Booking *</label>
                  <textarea className="form-control" rows="3" value={purpose} onChange={(e) => setPurpose(e.target.value)} required placeholder="e.g. Team meeting, Training session, Client presentation..." />
                </div>
                <div className="alert alert-info" style={{ fontSize: '12px' }}>
                  Weekends and public holidays are not allowed. Your booking will be submitted as <strong>PENDING</strong> and requires admin approval.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={booking || !!bookingSuccess}>
                  {booking ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
