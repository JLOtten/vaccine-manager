from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from vaccine_manager.config import settings

# Get database URL from settings (always SQLite)
DATABASE_URL = settings.database_url

# Create SQLite engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
