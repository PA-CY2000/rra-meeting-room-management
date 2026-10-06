import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import RraLogo from '../rra-logo.png';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { path: '/dashboard', icon: '▪', label: 'Dashboard' },
    { path: '/admin/rooms?add=1', icon: '▪', label: 'Add New Room' },
    { path: '/admin/rooms', icon: '▪', label: 'Manage Rooms' },
    { path: '/admin/bookings', icon: '▪', label: 'Booking Requests' },
    { path: '/admin/holidays', icon: '▪', label: 'Public Holidays' },
  ];

  const userNav = [
    { path: '/rooms', icon: '▪', label: 'Available Rooms' },
    { path: '/my-bookings', icon: '▪', label: 'My Bookings' },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : userNav;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={RraLogo} alt="RRA Logo" />
          <div className="sidebar-brand">Room Management</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path.split('?')[0] && (item.path.includes('?add=1') ? false : true) || location.pathname + location.search === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <h1>{title}</h1>
          <div className="topbar-right">
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
