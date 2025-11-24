from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from vaccine_manager.config import settings

# Get database URL from settings
DATABASE_URL = settings.database_url

# Convert Fly.io PostgreSQL URL format if needed
# Fly.io provides: postgres://user:pass@host:port/dbname
# SQLAlchemy needs: postgresql://user:pass@host:port/dbname
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine with appropriate connect args
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL doesn't need check_same_thread
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
