import React from 'react';

// Basic placeholder for the Manager Dashboard
const ManagerDashboard = ({ user }) => {
  return (
    <div>
      <h2>Project Manager Dashboard</h2>
      <p>Welcome, {user.name} (Manager)!</p>
      {/* TODO: Add features for managing assigned projects, teams, and tasks */}
      <p>Your assigned projects will appear here.</p>
    </div>
  );
};

export default ManagerDashboard;
