import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageRooms from './pages/ManageRooms';
import AdminBookings from './pages/AdminBookings';
import Holidays from './pages/Holidays';
import AvailableRooms from './pages/AvailableRooms';
import MyBookings from './pages/MyBookings';
import './index.css';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/rooms'} />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/rooms'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/rooms'} /> : <Register />} />

      {/* Admin routes */}
      <Route path="/dashboard" element={<PrivateRoute role="ADMIN"><Dashboard /></PrivateRoute>} />
      <Route path="/admin/rooms" element={<PrivateRoute role="ADMIN"><ManageRooms /></PrivateRoute>} />
      <Route path="/admin/bookings" element={<PrivateRoute role="ADMIN"><AdminBookings /></PrivateRoute>} />
      <Route path="/admin/holidays" element={<PrivateRoute role="ADMIN"><Holidays /></PrivateRoute>} />

      {/* User routes */}
      <Route path="/rooms" element={<PrivateRoute><AvailableRooms /></PrivateRoute>} />
      <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/dashboard' : '/rooms') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
