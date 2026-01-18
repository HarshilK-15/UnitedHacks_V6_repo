from sqlmodel import SQLModel, create_engine, Session, text
import os
from dotenv import load_dotenv
from app.models import User, Decision, Vote, Follow, Comment

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./doomscroll.db")

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # check_same_thread=False is needed only for SQLite
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # For PostgreSQL and other databases
    engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Migration: Add new columns to user table if they don't exist
    with Session(engine) as session:
        try:
            # Check if email column exists
            result = session.exec(text("PRAGMA table_info(user)"))
            columns = [row[1] for row in result]
            
            # Add missing columns
            if "email" not in columns:
                session.exec(text("ALTER TABLE user ADD COLUMN email VARCHAR"))
            if "bio" not in columns:
                session.exec(text("ALTER TABLE user ADD COLUMN bio VARCHAR"))
            if "avatar_url" not in columns:
                session.exec(text("ALTER TABLE user ADD COLUMN avatar_url VARCHAR"))
            
            session.commit()
        except Exception as e:
            # If table doesn't exist yet, that's fine - it will be created by create_all
            print(f"Migration check: {e}")
            session.rollback()

def get_session():
    with Session(engine) as session:
        yield session
