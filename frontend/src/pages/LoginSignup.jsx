import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import './LoginSignup.css'

function LoginSignup({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = location.pathname === '/signup'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.username.trim()) {
      setError('Please enter a username')
      return
    }

    if (isSignup) {
      if (!formData.email.trim()) {
        setError('Please enter an email')
        return
      }
      if (!formData.password) {
        setError('Please enter a password')
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    } else {
      if (!formData.password) {
        setError('Please enter a password')
        return
      }
    }

    setLoading(true)

    try {
      if (isSignup) {
        // Register new user
        const response = await api.register({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
        // After registration, automatically log in
        const loginResponse = await api.login({
          username: formData.username.trim(),
          password: formData.password
        })
        localStorage.setItem('authToken', loginResponse.data.access_token)
        onLogin(response.data)
      } else {
        // Login existing user
        const response = await api.login({
          username: formData.username.trim() || formData.email.trim().toLowerCase(),
          password: formData.password
        })
        localStorage.setItem('authToken', response.data.access_token)
        // Get user info
        const userResponse = await api.getCurrentUser()
        onLogin(userResponse.data)
      }
      navigate('/')
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid credentials')
      } else if (err.response?.status === 401) {
        setError('Invalid username/email or password')
      } else {
        setError(isSignup ? 'Failed to create account. Please try again.' : 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-signup-page">
      <div className="login-card">
        <div className="logo-large">
          <span className="logo-gradient">Parallel</span>
        </div>
        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="subtitle">
          {isSignup
            ? 'Join Parallel to start making and voting on decisions'
            : 'Enter your username to continue'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={loading}
            autoFocus
          />

          {isSignup && (
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          )}

          {!isSignup && (
            <input
              type="text"
              name="email"
              className="input-field"
              placeholder="Username or email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          )}

          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
          />

          {isSignup && (
            <input
              type="password"
              name="confirmPassword"
              className="input-field"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
            />
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading || !formData.username.trim() || !formData.password}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                {isSignup ? 'Creating Account...' : 'Logging in...'}
              </>
            ) : (
              isSignup ? 'Create Account' : 'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          {isSignup ? (
            <p>
              Already have an account?{' '}
              <a href="/login" className="link">Login</a>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <a href="/signup" className="link">Sign up</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
