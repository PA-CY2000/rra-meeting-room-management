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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [booking, setBooking] = useState(false);

  const [detailRoom, setDetailRoom] = useState(null);

  const [outsideHoursWarning, setOutsideHoursWarning] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchRooms = () => {
    setLoading(true);
    api.get('/rooms')
      .then((res) => setRooms(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load rooms.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const roomLabel = (room) => {
    if (room.currentlyBooked) return { text: 'Booked', className: 'badge badge-booked' };
    return { text: 'Available', className: 'badge badge-available' };
  };

  const openBooking = (room) => {
    setSelectedRoom(room);
    setStartDate(''); setEndDate(''); setStartTime(''); setEndTime('');
    setPurpose(''); setBookingError(''); setBookingSuccess('');
    setOutsideHoursWarning(false);
    setShowModal(true);
  };

  const isOutsideWorkingHours = (time) => {
    if (!time) return false;
    const [h] = time.split(':').map(Number);
    return h < 8 || h >= 17;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError(''); setBookingSuccess('');
    const purposeText = purpose.trim();
    if (purposeText.length < 3 || !/[A-Za-z]/.test(purposeText)) {
      setBookingError('Purpose must be text, at least 3 characters.');
      return;
    }
    const wordCount = purposeText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 10) {
      setBookingError('Purpose must be 10 words or less.');
      return;
    }
    if (startDate === endDate && startTime && endTime && startTime >= endTime) {
      setBookingError('End time must be after start time.');
      return;
    }
    if (isOutsideWorkingHours(startTime) || isOutsideWorkingHours(endTime)) {
      setOutsideHoursWarning(true);
      setBooking(false);
      return;
    }
    setOutsideHoursWarning(false);
    setBooking(true);
    try {
      await api.post('/bookings', { roomId: selectedRoom.id, purpose: purposeText, startDate, endDate, startTime, endTime });
      setBookingSuccess('Booking submitted! Waiting for admin approval.');
      setTimeout(() => { setShowModal(false); fetchRooms(); }, 2000);
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
          <h2>Available Rooms ({rooms.length})</h2>
        </div>

        {error && <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state"><p>No rooms are available to book.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Availability</th>
                <th>Action</th>
                <th>Details</th>
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
                      <span className={availability.className}>{availability.text}</span>
                      {room.currentlyBooked && room.bookedUntil && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>until {room.bookedUntil}</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-gold btn-sm" onClick={() => openBooking(room)}>Book</button>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setDetailRoom(room)}>View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Room Details Modal */}
      {detailRoom && (
        <div className="modal-overlay" onClick={() => setDetailRoom(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Room Details</h2>
              <button className="modal-close" onClick={() => setDetailRoom(null)}>×</button>
            </div>
            <div className="modal-body">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Room Name', detailRoom.roomName],
                    ['Location', detailRoom.location],
                    ['Capacity', `${detailRoom.capacity} people`],
                    ['Description', detailRoom.description || '—'],
                    ['Status', detailRoom.currentlyBooked ? 'Currently Booked' : 'Available'],
                    ...(detailRoom.currentlyBooked && detailRoom.bookedUntil ? [
                      ['Booked From', detailRoom.bookedFrom ? `${detailRoom.bookedFrom}${detailRoom.bookedFromTime ? ' at ' + detailRoom.bookedFromTime : ''}` : '—'],
                      ['Booked Until', detailRoom.bookedUntil ? `${detailRoom.bookedUntil}${detailRoom.bookedUntilTime ? ' at ' + detailRoom.bookedUntilTime : ''}` : '—'],
                    ] : []),
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#374151', width: '40%' }}>{label}</td>
                      <td style={{ padding: '10px 8px', color: '#6b7280' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDetailRoom(null)}>Close</button>
              <button className="btn btn-gold" onClick={() => { setDetailRoom(null); openBooking(detailRoom); }}>Book This Room</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
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
                {outsideHoursWarning && (
                  <div className="alert alert-error" style={{ marginBottom: '12px' }}>
                    ⚠️ You are booking outside working hours (before 8:00 AM or after 5:00 PM). Bookings are recommended between 08:00 – 17:00.
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          setOutsideHoursWarning(false);
                          setBooking(true);
                          try {
                            await api.post('/bookings', { roomId: selectedRoom.id, purpose: purpose.trim(), startDate, endDate, startTime, endTime });
                            setBookingSuccess('Booking submitted! Waiting for admin approval.');
                            setTimeout(() => { setShowModal(false); fetchRooms(); }, 2000);
                          } catch (err) {
                            setBookingError(err.response?.data?.message || 'Booking failed.');
                          } finally {
                            setBooking(false);
                          }
                        }}
                      >
                        Proceed Anyway
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: '8px' }} onClick={() => setOutsideHoursWarning(false)}>Change Time</button>
                    </div>
                  </div>
                )}
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Booking *</label>
                  <textarea className="form-control" rows="3" value={purpose} onChange={(e) => setPurpose(e.target.value)} required minLength={3} placeholder="e.g. Team meeting, Training session..." />
                  <span style={{ fontSize: '12px', color: purpose.trim().split(/\s+/).filter(Boolean).length > 10 ? '#ef4444' : '#6b7280' }}>
                    {purpose.trim().split(/\s+/).filter(Boolean).length}/10 words
                  </span>
                </div>
                <div className="alert alert-info" style={{ fontSize: '12px' }}>
                  Weekends and public holidays are not allowed.
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
