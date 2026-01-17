import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Users
  createUser: (userData) => axios.post(`${API_BASE}/users/`, userData),
  getUser: (userId) => axios.get(`${API_BASE}/users/${userId}`),
  getUserPersonality: (userId) => axios.get(`${API_BASE}/users/${userId}/personality`),

  // Decisions
  createDecision: (decisionData) => axios.post(`${API_BASE}/decisions/`, decisionData),
  getDecisions: (params) => axios.get(`${API_BASE}/decisions/`, { params }),
  getDecision: (id) => axios.get(`${API_BASE}/decisions/${id}`),

  // Votes
  createVote: (voteData) => axios.post(`${API_BASE}/votes/`, voteData),
  getVoteCounts: (decisionId) => axios.get(`${API_BASE}/votes/${decisionId}`),

  // Leaderboard
  getLeaderboard: () => axios.get(`${API_BASE}/leaderboard/`)
};
