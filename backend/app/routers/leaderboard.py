from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.database import get_session
from app.models import User, Decision, Vote

router = APIRouter()

@router.get("/leaderboard/")
async def get_leaderboard(session: Session = Depends(get_session)):
    # Get users ranked by number of decisions posted
    leaderboard = session.exec(
        select(
            User.id,
            User.username,
            func.count(Decision.id).label("decisions_count")
        )
        .join(Decision, User.id == Decision.user_id)
        .group_by(User.id, User.username)
        .order_by(func.count(Decision.id).desc())
        .limit(10)
    ).all()

    return [
        {
            "rank": i + 1,
            "user_id": item.id,
            "username": item.username,
            "decisions_count": item.decisions_count
        }
        for i, item in enumerate(leaderboard)
    ]
