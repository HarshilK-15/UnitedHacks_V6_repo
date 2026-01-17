from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Decision, User
from app.services.gemini import predict_consequences

router = APIRouter()

@router.post("/decisions/", response_model=Decision)
async def create_decision(decision: Decision, session: Session = Depends(get_session)):
    # Check if user exists
    user = session.get(User, decision.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Generate AI predictions *before* saving (or do it in background)
    print("Asking Gemini...")
    try:
        predictions = await predict_consequences(decision.content)

        # 2. Update model with AI results
        decision.ai_consequence_good = predictions.get("good")
        decision.ai_consequence_bad = predictions.get("bad")
        decision.ai_consequence_weird = predictions.get("weird")
    except Exception as e:
        print(f"AI Error: {e}")
        # Continue without AI predictions

    # 3. Save to DB
    session.add(decision)
    session.commit()
    session.refresh(decision)
    return decision

@router.get("/decisions/")
def read_decisions(offset: int = 0, limit: int = 10, session: Session = Depends(get_session)):
    decisions = session.exec(
        select(Decision).offset(offset).limit(limit).order_by(Decision.created_at.desc())
    ).all()
    return decisions

@router.get("/decisions/{decision_id}")
def get_decision(decision_id: int, session: Session = Depends(get_session)):
    decision = session.get(Decision, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision
