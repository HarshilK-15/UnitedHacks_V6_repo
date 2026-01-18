import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import './Settings.css'

function Settings({ currentUser, onUpdateUser }) {
  const [username, setUsername] = useState(currentUser.username || '')
  const [bio, setBio] = useState(currentUser.bio || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Note: This assumes you have an update user endpoint
    // For now, we'll just update localStorage
    const updatedUser = {
      ...currentUser,
      username: username.trim(),
      bio: bio.trim()
    }
    onUpdateUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setSuccess('Profile updated successfully!')
    setLoading(false)
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Manage your profile and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Profile Settings</h2>
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="input-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !username.trim()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="settings-card">
          <h2>Navigation</h2>
          <div className="settings-links">
            <Link to="/leaderboard" className="settings-link">
              View Leaderboard
            </Link>
            <Link to={`/profile/${currentUser.id}`} className="settings-link">
              View Profile
            </Link>
            <Link to="/about" className="settings-link">
              About Parallel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
