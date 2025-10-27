import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar.jsx';

const styles = {
  pageContainer: {
    backgroundColor: '#f7fafc',
    minHeight: '100vh',
    width: '100vw',          // ✅ Full width of the viewport
    overflowX: 'hidden',     // ✅ No side scrolling
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  contentWrapper: {
    flex: 1,                 // ✅ Take full remaining height
    width: '100%',
    padding: '2rem 5%',
    boxSizing: 'border-box',
  },
};

const ProtectedLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.pageContainer}>
      <DashboardNavbar handleLogout={handleLogout} />
      <div style={styles.contentWrapper}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
