import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(name, email, password);
      setMessage(response.data.message);
      // Redirect to the login page after a successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Display error message from the backend if it exists
      setMessage(error.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Register
        </button>
      </form>
      {message && <p style={{ color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default Register;

