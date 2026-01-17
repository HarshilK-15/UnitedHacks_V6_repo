from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Decision(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # AI Fields (filled later)
    ai_consequence_good: Optional[str] = None
    ai_consequence_bad: Optional[str] = None
    ai_consequence_weird: Optional[str] = None

class Vote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    decision_id: int = Field(foreign_key="decision.id")
    choice: str  # "do_it" or "dont_do_it"
    created_at: datetime = Field(default_factory=datetime.utcnow)
