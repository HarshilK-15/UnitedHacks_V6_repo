from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from app.database import get_session
from app.models import Comment, Decision, User
from app.auth import get_current_user
from typing import Optional, List

router = APIRouter()

@router.post("/comments/")
async def create_comment(
    comment: Comment,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if decision exists
    decision = session.get(Decision, comment.decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    # Set the user_id to the current user
    comment.user_id = current_user.id

    session.add(comment)
    session.commit()
    session.refresh(comment)

    # Return comment with user info
    user = session.get(User, comment.user_id)
    return {
        **comment.dict(),
        "user": user.dict() if user else None
    }

@router.get("/comments/{decision_id}")
async def get_comments(
    decision_id: int,
    offset: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session)
):
    # Check if decision exists
    decision = session.get(Decision, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    comments = session.exec(
        select(Comment)
        .where(Comment.decision_id == decision_id)
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    # Enrich with user info
    result = []
    for comment in comments:
        user = session.get(User, comment.user_id)
        result.append({
            **comment.dict(),
            "user": user.dict() if user else None
        })

    return result

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if user owns the comment
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    session.delete(comment)
    session.commit()
    return {"message": "Comment deleted successfully"}
