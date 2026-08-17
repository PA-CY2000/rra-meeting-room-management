import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

const emptyForm = { roomName: '', capacity: '', location: '', description: '', status: 'AVAILABLE' };

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRooms = () => {
    api.get('/rooms').then((res) => setRooms(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (room) => {
    setForm({ roomName: room.roomName, capacity: room.capacity, location: room.location, description: room.description || '', status: room.status });
    setEditId(room.id);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/rooms/${editId}`, form);
      } else {
        await api.post('/rooms', form);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete room "${name}"?`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  return (
    <Layout title="Manage Rooms">
      <div className="card">
        <div className="card-header">
          <h2>All Rooms ({rooms.length})</h2>
          <button className="btn btn-gold" onClick={openAdd}>+ Add Room</button>
        </div>

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
                    <span className={`badge badge-${room.status.toLowerCase()}`}>{room.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(room)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(room.id, room.roomName)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  <label className="form-label">Room Name *</label>
                  <input className="form-control" value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })} required placeholder="e.g. Conference Room A" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required min="1" placeholder="Number of people" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="AVAILABLE">Available</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="e.g. 2nd Floor, Block A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
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
