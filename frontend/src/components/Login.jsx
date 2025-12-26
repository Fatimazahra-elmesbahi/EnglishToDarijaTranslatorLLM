import { useState } from 'react';
import { login } from '../services/api';
import './Login.css';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(username, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLoginSuccess(response.user);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-icon">🇲🇦</div>
          <h1 className="hero-title">Darija Translator</h1>
          <p className="hero-description">
            Your intelligent companion for translating English to Moroccan Arabic (Darija). 
            Experience seamless communication with advanced voice recognition and natural translations.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <span>Voice-to-text input</span>
            </div>
            <div className="hero-feature">
              <span>Text-to-speech output</span>
            </div>
            <div className="hero-feature">
              <span>Real-time translation</span>
            </div>
            <div className="hero-feature">
              <span>Natural Darija expressions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Login to access your translator</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="demo-info">
              <p className="demo-title">Demo Account</p>
              <div className="demo-credential">
                <span>Username:</span>
                <strong>admin</strong>
              </div>
              <div className="demo-credential">
                <span>Password:</span>
                <strong>admin123</strong>
              </div>
            </div>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              Don't have an account?{' '}
              <button
                type="button"
                className="footer-link"
                onClick={onSwitchToRegister}
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}