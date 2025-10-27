import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';
import ManagerDashboard from './ManagerDashboard';
// REMOVED: import DashboardNavbar from '../components/DashboardNavbar.jsx'; 
// Because ProtectedLayout handles the Navbar

const styles = {
  // Styles for pageContainer and contentWrapper are handled by ProtectedLayout
  // Keep styles specific to the content rendered *within* the layout if needed
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken && decodedToken.user && decodedToken.user.role) {
          setUser(decodedToken.user);
        } else {
          console.error("Token structure invalid or missing role:", decodedToken);
          handleLogout();
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        handleLogout();
      }
    } else {
      navigate('/login'); // Redirect if no token
    }
  }, [navigate]);

  // handleLogout is passed to DashboardNavbar within ProtectedLayout,
  // so it doesn't need to be defined here unless needed for other reasons.
  // We still need it if there's an error during token decoding in useEffect.
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  const renderDashboardByRole = () => {
    if (!user) return <div>Loading dashboard content...</div>; // More specific loading message

    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'client':
        return <ClientDashboard user={user} />;
      default:
        console.warn("Unknown user role:", user.role);
        return <div>Invalid user role detected. Please contact support.</div>;
    }
  };

  if (!user) {
    // This loading state might be briefly visible before role is determined
     // ProtectedLayout handles the main container, so just return the loading text
     return <div style={{ padding: '2rem' }}>Loading user profile...</div>;
  }

  // No outer div needed - ProtectedLayout provides the container and navbar
  return (
    <>
      {renderDashboardByRole()}
    </>
  );
}


export default Dashboard;

// --- REMOVED THE DUPLICATED CODE BLOCK FROM HERE DOWN --- 

