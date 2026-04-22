/**
 * LoginPage Component
 * 
 * User login form with email and password.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import { useAuth } from '../context/AuthContext.jsx';
import '../Styles/AuthPages.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (loginError) {
      setError(loginError.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                
                <span className="logo-text">Pixel Pit Stop</span>
              </Link>
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Sign in to your account</p>
            </div>

            {error && (
                <div className="auth-error">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{error}</span>
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                />
              </div>

              <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Do not have an account?{' '}
                <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </div>
          </div>

          <div className="auth-info">
            <h2>Join the Gaming Community</h2>
            <ul className="auth-features">
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Access thousands of games</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Exclusive member discounts</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Build your game library</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Create wishlists for later</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
}

export default LoginPage;
