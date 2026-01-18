import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import './Leaderboard.css'

function Leaderboard({ currentUser }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await api.getLeaderboard()
      setLeaderboard(response.data)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p className="page-subtitle">Top decision makers</p>
      </div>

      <div className="leaderboard-card">
        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>No rankings yet. Be the first to post a decision!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <Link
                key={entry.user_id}
                to={`/profile/${entry.user_id}`}
                className={`leaderboard-item ${entry.user_id === currentUser.id ? 'current-user' : ''}`}
              >
                <div className="rank-badge">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="user-info">
                  <div className="user-username">
                    {entry.username}
                    {entry.user_id === currentUser.id && (
                      <span className="you-badge"> (You)</span>
                    )}
                  </div>
                  <div className="user-stats">
                    {entry.decisions_count} decision{entry.decisions_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="rank-number">#{entry.rank}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
