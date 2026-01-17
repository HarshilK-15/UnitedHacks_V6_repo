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
    # Get counts for do_it and dont_do_it
    do_it_count = session.exec(
        select(func.count(Vote.id)).where(Vote.decision_id == decision_id, Vote.choice == "do_it")
    ).first()

    dont_do_it_count = session.exec(
        select(func.count(Vote.id)).where(Vote.decision_id == decision_id, Vote.choice == "dont_do_it")
    ).first()

    return {
        "decision_id": decision_id,
        "do_it": do_it_count or 0,
        "dont_do_it": dont_do_it_count or 0
    }
