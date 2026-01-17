from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Decision
from app.services.gemini import predict_personality

router = APIRouter()

@router.post("/users/")
async def create_user(user: User, session: Session = Depends(get_session)):
    # Check if username already exists
    existing_user = session.exec(select(User).where(User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get("/users/{user_id}")
async def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/{user_id}/personality")
async def get_user_personality(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all decisions by this user
    decisions = session.exec(select(Decision).where(Decision.user_id == user_id)).all()

    if not decisions:
        return {"personality_report": "Not enough data - post some decisions first!"}

    # Compile decision texts
    decision_texts = [d.content for d in decisions]

    # Get AI personality analysis
    try:
        personality_report = await predict_personality(decision_texts)
        return {"personality_report": personality_report}
    except Exception as e:
        print(f"Personality AI Error: {e}")
        return {"personality_report": "AI analysis unavailable"}
