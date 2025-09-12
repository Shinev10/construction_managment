import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // This assumes your backend token payload has a 'user' object with a 'role'
        setUser(decodedToken.user); 
      } catch (error) {
        // If token is invalid, log out the user
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      <h1>Construction Management Dashboard</h1>
      <hr />
      
      {/* This is where the magic happens: render a different component based on the user's role */}
      {user.role === 'admin' ? <AdminDashboard user={user} /> : <ClientDashboard user={user} />}
    </div>
  );
}

export default Dashboard;

