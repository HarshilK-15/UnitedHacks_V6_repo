from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.database import get_session
from app.models import Vote, Decision

router = APIRouter()

@router.post("/votes/")
async def create_vote(vote: Vote, session: Session = Depends(get_session)):
    # Check if user already voted on this decision
    existing_vote = session.exec(
        select(Vote).where(Vote.user_id == vote.user_id, Vote.decision_id == vote.decision_id)
    ).first()

    if existing_vote:
        raise HTTPException(status_code=400, detail="User already voted on this decision")

    session.add(vote)
    session.commit()
    session.refresh(vote)
    return vote

@router.get("/votes/{decision_id}")
async def get_vote_counts(decision_id: int, session: Session = Depends(get_session)):
    # Get counts for option_a and option_b
    option_a_count = session.exec(
        select(func.count(Vote.id)).where(Vote.decision_id == decision_id, Vote.choice == "option_a")
    ).first()

    option_b_count = session.exec(
        select(func.count(Vote.id)).where(Vote.decision_id == decision_id, Vote.choice == "option_b")
    ).first()

    return {
        "decision_id": decision_id,
        "option_a": option_a_count or 0,
        "option_b": option_b_count or 0
    }
