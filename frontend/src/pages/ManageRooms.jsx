import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import CustomSelect from '../components/CustomSelect';
import api from '../api';

const FLOORS = ['Ground', '1st Floor', '2nd Floor', '3rd Floor'];
const emptyForm = { roomName: '', capacity: '', location: '', description: '' };
const TEXT_ONLY = /^$|^(?=.*[A-Za-z])[A-Za-z .,'-]+$/;

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setForm(emptyForm);
      setEditId(null);
      setError('');
      setShowModal(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchRooms = () => {
    api.get('/rooms').then((res) => setRooms(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (room) => {
    setForm({ roomName: room.roomName, capacity: room.capacity, location: room.location, description: room.description || '' });
    setEditId(room.id);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!FLOORS.includes(form.location)) {
      setError('Select a location: Ground, 1st Floor, 2nd Floor or 3rd Floor.');
      return;
    }
    if (!TEXT_ONLY.test(form.description.trim())) {
      setError('Description must be text only, with no numbers.');
      return;
    }
    const payload = { ...form, description: form.description.trim() };
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/rooms/${editId}`, payload);
        setSuccessMsg('Room updated successfully!');
      } else {
        await api.post('/rooms', payload);
        setSuccessMsg('Room added successfully!');
      }
      setShowModal(false);
      fetchRooms();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (room) => {
    setDeleteError('');
    setDeleteTarget(room);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/rooms/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchRooms();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete room.');
    } finally {
      setDeleting(false);
    }
  };

  const occupancy = (room) => {
    if (room.currentlyBooked) return { text: 'Booked', className: 'badge badge-booked' };
    return { text: 'Available', className: 'badge badge-available' };
  };

  return (
    <Layout title="Manage Rooms">
      <div className="card">
        <div className="card-header">
          <h2>All Rooms ({rooms.length})</h2>
        </div>
        {successMsg && <div className="alert alert-success" style={{ margin: '16px' }}>{successMsg}</div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div> Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p>No rooms added yet. Click "Add Room" to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, i) => (
                <tr key={room.id}>
                  <td>{i + 1}</td>
                  <td><strong>{room.roomName}</strong></td>
                  <td>{room.capacity} people</td>
                  <td>{room.location}</td>
                  <td>{room.description || '—'}</td>
                  <td>
                    {(() => {
                      const label = occupancy(room);
                      return (
                        <>
                          <span className={label.className}>{label.text}</span>
                          {label.text === 'Booked' && room.bookedUntil && (
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>until {room.bookedUntil}</span>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(room)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(room)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Room</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              {deleteError && <div className="alert alert-error">{deleteError}</div>}
              <p style={{ marginBottom: '12px' }}>This room will be removed from the list.</p>
              <div className="alert alert-info">
                <strong>Room:</strong> {deleteTarget.roomName}<br />
                <strong>Location:</strong> {deleteTarget.location}<br />
                <strong>Capacity:</strong> {deleteTarget.capacity} people
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Back</button>
              <button type="button" className="btn btn-danger" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Room' : 'Add New Room'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <CustomSelect
                    required
                    placeholder="Select location"
                    value={form.location}
                    onChange={(location) => setForm({ ...form, location })}
                    options={[
                      ...FLOORS.map((floor) => ({ value: floor, label: floor })),
                      ...(form.location && !FLOORS.includes(form.location)
                        ? [{ value: form.location, label: form.location }]
                        : []),
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Name *</label>
                  <input className="form-control" value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })} required placeholder="e.g. Conference Room A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required min="1" placeholder="Number of people" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Text only, no numbers..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
