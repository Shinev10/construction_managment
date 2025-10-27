import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await authService.login(email, password);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed! Please check your credentials.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    formContainer: {
      width: '100%',
      maxWidth: '420px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    headerIconWrapper: {
      width: '64px',
      height: '64px',
      backgroundColor: '#f0b900',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem',
    },
    headerIcon: {
      width: '32px',
      height: '32px',
      color: '#1a202c',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1a202c',
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      color: '#718096',
      margin: 0,
    },
    loginCard: {
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      padding: '2.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      width: '20px',
      height: '20px',
      color: '#9ca3af',
    },
    input: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    passwordInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '3rem', // space for eye toggle
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    toggleButton: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      color: '#9ca3af',
    },
    submitButton: {
      width: '100%',
      backgroundColor: isLoading ? '#e2e8f0' : '#f0b900',
      color: isLoading ? '#9ca3af' : '#1a202c',
      padding: '0.85rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '1.125rem',
      border: 'none',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid #1a202c',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem',
    },
    messageDisplay: {
      marginTop: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    successMessage: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
    },
    messageIcon: {
      width: '20px',
      height: '20px',
      marginRight: '0.5rem',
    },
    registerLinkContainer: {
      textAlign: 'center',
      marginTop: '2rem',
    },
    registerLinkText: {
      color: '#4a5568',
      margin: 0,
    },
    registerLink: {
      color: '#1a202c',
      fontWeight: '600',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIconWrapper}>
            <svg style={styles.headerIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your Construction Management System</p>
        </div>

        {/* Login Card */}
        <div style={styles.loginCard}>
          <form onSubmit={handleLogin} style={styles.form}>
            <div>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.passwordInput}
                  disabled={isLoading}
                />
                <button type="button" onClick={togglePasswordVisibility} style={styles.toggleButton}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? (
                <>
                  <div style={styles.spinner}></div>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {message && (
            <div style={{
              ...styles.messageDisplay,
              ...(messageType === 'success' ? styles.successMessage : styles.errorMessage),
            }}>
              {messageType === 'success' ? (
                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div style={styles.registerLinkContainer}>
          <p style={styles.registerLinkText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.registerLink}>Create one here</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
