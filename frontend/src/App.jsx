import { useState, useEffect } from 'react'
import { api } from './api.js'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('feed')
  const [decisions, setDecisions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDecisions()
    loadLeaderboard()
  }, [])

  const loadDecisions = async () => {
    try {
      const response = await api.getDecisions()
      setDecisions(response.data)
    } catch (error) {
      console.error('Failed to load decisions:', error)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard()
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    }
  }

  const handleCreateUser = async (username) => {
    setLoading(true)
    try {
      const response = await api.createUser({ username })
      setCurrentUser(response.data)
      localStorage.setItem('currentUser', JSON.stringify(response.data))
    } catch (error) {
      alert('Username already taken or error occurred')
    }
    setLoading(false)
  }

  const handleCreateDecision = async (content) => {
    if (!currentUser) return
    setLoading(true)
    try {
      const response = await api.createDecision({
        user_id: currentUser.id,
        content
      })
      setDecisions([response.data, ...decisions])
      setActiveTab('feed')
    } catch (error) {
      alert('Failed to create decision')
    }
    setLoading(false)
  }

  const handleVote = async (decisionId, choice) => {
    if (!currentUser) return
    setLoading(true)
    try {
      await api.createVote({
        user_id: currentUser.id,
        decision_id: decisionId,
        choice
      })
      // Refresh decisions to update vote counts
      loadDecisions()
    } catch (error) {
      alert('Failed to vote or already voted')
    }
    setLoading(false)
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  if (!currentUser) {
    return <UserSetup onCreateUser={handleCreateUser} loading={loading} />
  }

  return (
    <div className="container">
      <nav className="flex flex-between mb-16">
        <h1 style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E72)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Parallel
        </h1>
        <div className="flex gap-8">
          <button
            className={`btn-secondary ${activeTab === 'feed' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </button>
          <button
            className={`btn-secondary ${activeTab === 'post' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            Post
          </button>
          <button
            className={`btn-secondary ${activeTab === 'leaderboard' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Rank
          </button>
        </div>
      </nav>

      {activeTab === 'feed' && (
        <DecisionFeed
          decisions={decisions}
          currentUserId={currentUser.id}
          onVote={handleVote}
          loading={loading}
        />
      )}

      {activeTab === 'post' && (
        <DecisionForm onSubmit={handleCreateDecision} loading={loading} />
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard leaderboard={leaderboard} />
      )}
    </div>
  )
}

function UserSetup({ onCreateUser, loading }) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      onCreateUser(username.trim())
    }
  }

  return (
    <div className="container flex-center" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-16">Welcome to Parallel</h2>
        <p className="text-center mb-16" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Choose a username to start making decisions
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input mb-16"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading || !username.trim()}
          >
            {loading ? <div className="spinner" /> : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}

function DecisionForm({ onSubmit, loading }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  return (
    <div className="card">
      <h3 className="mb-16">Post a Decision</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className="input mb-16"
          placeholder="What's your decision dilemma?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={loading}
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !content.trim()}
        >
          {loading ? <div className="spinner" /> : 'Post Decision'}
        </button>
      </form>
    </div>
  )
}

function DecisionFeed({ decisions, currentUserId, onVote, loading }) {
  return (
    <div>
      {decisions.map(decision => (
        <DecisionCard
          key={decision.id}
          decision={decision}
          currentUserId={currentUserId}
          onVote={onVote}
          loading={loading}
        />
      ))}
      {decisions.length === 0 && (
        <div className="card text-center">
          <p>No decisions yet. Be the first to post one!</p>
        </div>
      )}
    </div>
  )
}

function DecisionCard({ decision, currentUserId, onVote, loading }) {
  const [voteCounts, setVoteCounts] = useState({ do_it: 0, dont_do_it: 0 })

  useEffect(() => {
    loadVoteCounts()
  }, [decision.id])

  const loadVoteCounts = async () => {
    try {
      const response = await api.getVoteCounts(decision.id)
      setVoteCounts(response.data)
    } catch (error) {
      console.error('Failed to load vote counts:', error)
    }
  }

  return (
    <div className="decision-card">
      <div className="decision-text">{decision.content}</div>

      {decision.ai_consequence_good && (
        <div className="ai-predictions">
          <div className="prediction">
            <div className="prediction-label">AI Good Outcome</div>
            <div className="prediction-text">{decision.ai_consequence_good}</div>
          </div>
          <div className="prediction">
            <div className="prediction-label">AI Bad Outcome</div>
            <div className="prediction-text">{decision.ai_consequence_bad}</div>
          </div>
          <div className="prediction">
            <div className="prediction-label">AI Weird Outcome</div>
            <div className="prediction-text">{decision.ai_consequence_weird}</div>
          </div>
        </div>
      )}

      <div className="flex gap-8" style={{ marginTop: '16px' }}>
        <button
          className="vote-btn vote-do"
          onClick={() => onVote(decision.id, 'do_it')}
          disabled={loading}
        >
          Do It ({voteCounts.do_it})
        </button>
        <button
          className="vote-btn vote-dont"
          onClick={() => onVote(decision.id, 'dont_do_it')}
          disabled={loading}
        >
          Don't ({voteCounts.dont_do_it})
        </button>
      </div>
    </div>
  )
}

function Leaderboard({ leaderboard }) {
  return (
    <div className="card">
      <h3 className="mb-16">Leaderboard</h3>
      {leaderboard.map(item => (
        <div key={item.user_id} className="flex flex-between mb-8" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <span style={{ fontWeight: 'bold', color: '#FF6B6B' }}>#{item.rank}</span> {item.username}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>
            {item.decisions_count} decisions
          </div>
        </div>
      ))}
      {leaderboard.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>No rankings yet</p>
      )}
    </div>
  )
}

export default App
