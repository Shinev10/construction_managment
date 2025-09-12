import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      if (response.data.token) {
        // Save the token to localStorage
        localStorage.setItem('token', response.data.token);
        // Redirect to the dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Login
        </button>
      </form>
      {message && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;

