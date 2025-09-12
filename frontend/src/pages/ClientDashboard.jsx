import React from 'react';

const ClientDashboard = ({ user }) => {
  return (
    <div>
      <h2>Client Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      {/* A list of this client's projects will go here. */}
    </div>
  );
};

export default ClientDashboard;
