from fastapi import APIRouter

router = APIRouter()

@router.get("/about/")
def get_about():
    """Get information about the Parallel platform"""
    return {
        "name": "Parallel",
        "description": "A decision-making social platform where users post binary choices, vote on others' decisions, and compete on AI-powered leaderboards.",
        "version": "1.0.0",
        "features": [
            "Post binary decision dilemmas",
            "Vote on community decisions",
            "AI-powered consequence predictions",
            "Personality analysis based on decisions",
            "Follow other users",
            "Competitive leaderboards"
        ]
    }
