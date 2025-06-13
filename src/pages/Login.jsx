import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLogin(true);
    try {
      await login(email, password);
      // Redirection will happen in useEffect below
    } catch (err) {
     if (err.response?.status === 403) {
      setError(err.response.data.message); // "Your account has been banned"
     } else {
      setError('Invalid email or password');
    }
   } 
  };

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/recipes');
      }
    }
  }, [user, navigate]);

  if (user) {
    return null; // Already handled in useEffect
  }

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          required
        />

        <button type="submit" disabled={loadingLogin}>
          {loadingLogin ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
