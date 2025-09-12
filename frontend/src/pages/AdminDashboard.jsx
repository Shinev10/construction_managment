import React from 'react';

const AdminDashboard = ({ user }) => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.name} (Admin)!</p>
      {/* Admin-specific content, like a button to create projects, will go here. */}
    </div>
  );
};

export default AdminDashboard;
