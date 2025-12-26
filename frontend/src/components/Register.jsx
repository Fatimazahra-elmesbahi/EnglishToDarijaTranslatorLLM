import { useState } from 'react';
import { register } from '../services/api';
import './Register.css';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    if (pass.length < 4) return 'weak';
    if (pass.length < 8) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await register(username, email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onRegisterSuccess(response.user);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="register-page">
      <div className="register-form-container">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Create Account</h2>
            <p className="register-subtitle">Join us to start translating</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${strength}`}></div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: strength === 'weak' ? '#f44336' : 
                           strength === 'medium' ? '#ff9800' : '#4caf50'
                  }}>
                    {strength === 'weak' ? 'Weak' : 
                     strength === 'medium' ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className={`form-input ${confirmPassword && password !== confirmPassword ? 'error' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <button
                type="button"
                className="footer-link"
                onClick={onSwitchToLogin}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="register-hero">
        <div className="register-hero-content">
          <div className="register-hero-icon">🤖</div>
          <h1 className="register-hero-title">Start Your Journey</h1>
          <p className="register-hero-description">
            Join thousands of users who are bridging language barriers with our advanced 
            English to Darija translation platform.
          </p>
          <div className="register-benefits">
            <div className="benefit-card">
              <div className="benefit-text">Accurate translations with cultural context</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-text">Lightning-fast processing</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-text">Secure and private</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-text">Works on all devices</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}