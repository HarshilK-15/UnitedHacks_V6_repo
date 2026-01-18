import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import './Create.css'

function Create({ currentUser }) {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [gettingRecommendation, setGettingRecommendation] = useState(false)

  const getRecommendation = async () => {
    if (!content.trim()) {
      setError('Please enter a decision first')
      return
    }

    setGettingRecommendation(true)
    setError('')
    setRecommendation(null)

    try {
      const response = await api.getConsensusRecommendation(content.trim())
      setRecommendation(response.data)
    } catch (err) {
      console.error('Failed to get recommendation:', err)
      setError('Failed to get AI recommendation. Please try again.')
    } finally {
      setGettingRecommendation(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Please enter a decision')
      return
    }
    if (!optionA.trim() || !optionB.trim()) {
      setError('Please enter both options')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.createDecision({
        user_id: currentUser.id,
        content: content.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim()
      })
      // Navigate to FYP to see the new decision
      navigate('/')
    } catch (err) {
      console.error('Failed to create decision:', err)
      setError('Failed to create decision. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="page-header">
        <h1>Create Decision</h1>
        <p className="page-subtitle">Share your dilemma with the community</p>
      </div>

      <div className="create-card">
        <form onSubmit={handleSubmit} className="create-form">
          <label className="form-label">What's your decision?</label>
          <textarea
            className="input-field textarea-large"
            placeholder="e.g., Should I quit my job and start a business?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={6}
          />
          <p className="form-hint">
            Describe your decision dilemma.
          </p>

          <div className="options-section">
            <label className="form-label">Option A</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Quit my job"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              disabled={loading}
              maxLength={100}
            />

            <label className="form-label">Option B</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Keep my job"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div className="ai-recommendation-section">
            <button
              type="button"
              className="btn-secondary"
              onClick={getRecommendation}
              disabled={gettingRecommendation || !content.trim()}
            >
              {gettingRecommendation ? (
                <>
                  <div className="spinner-small"></div>
                  Getting AI Recommendation...
                </>
              ) : (
                '🤖 Get AI Consensus Recommendation'
              )}
            </button>
            <p className="form-hint small">
              Get AI-powered recommendations based on how similar decisions were voted on by the community
            </p>
          </div>

          {recommendation && (
            <div className="recommendation-display">
              <h3>🤖 AI Consensus Recommendation</h3>
              <p className="recommendation-text">{recommendation.recommendation}</p>
              {recommendation.similar_decisions_count > 0 && (
                <p className="recommendation-meta">
                  Based on {recommendation.similar_decisions_count} similar decision{recommendation.similar_decisions_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !content.trim() || !optionA.trim() || !optionB.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Creating...
                </>
              ) : (
                'Post Decision'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Create
