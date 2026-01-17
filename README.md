# Parallel - Decision Making Social Platform

A modern, responsive PWA where users post binary choices, vote on others' decisions, and compete on AI-powered leaderboards.

## Features

- **Decision Posting**: Users can post their dilemmas and get AI predictions
- **Social Voting**: Community votes on decisions (Do It vs Don't Do It)
- **AI Predictions**: Gemini AI provides good, bad, and weird outcomes for each decision
- **Personality Analysis**: AI analyzes user patterns to provide personality insights
- **Leaderboard**: Compete based on decision activity
- **PWA**: Installable progressive web app with offline capabilities

## Tech Stack

- **Backend**: FastAPI, SQLModel, SQLite, Google Gemini AI
- **Frontend**: React, Vite, PWA
- **Deployment**: Railway.app

## Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Copy env.example to .env and add your GEMINI_API_KEY
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (Railway.app)
1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `DATABASE_URL=sqlite:///./doomscroll.db`
   - `GEMINI_API_KEY=your_key_here`
3. Deploy - Railway will use `railway.json` config

### Frontend
The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.)

## API Endpoints

- `POST /api/users/` - Create user
- `POST /api/decisions/` - Create decision
- `GET /api/decisions/` - Get decisions feed
- `POST /api/votes/` - Vote on decision
- `GET /api/votes/{decision_id}` - Get vote counts
- `GET /api/leaderboard/` - Get leaderboard
- `GET /api/users/{user_id}/personality` - Get personality analysis

## Design System

- **Primary**: Coral gradient (#FF6B6B to #FF8E72)
- **Background**: Pure black (#000000)
- **Typography**: Clean, modern sans-serif

## PWA Features

- Installable on mobile and desktop
- Offline caching
- Native app-like experience
- Push notifications ready
