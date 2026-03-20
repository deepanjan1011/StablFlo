import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# We will expect a DATABASE_URL in the .env file.
# Since we use Postgres, it should be something like postgresql://user:pass@localhost:5432/stablflo
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./stablflo.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # connect_args={"check_same_thread": False} is only for sqlite
    **({"connect_args": {"check_same_thread": False}} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {})
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
