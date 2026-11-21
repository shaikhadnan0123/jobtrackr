import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

def normalize_database_url(url: str) -> str:
    if not url:
        return "sqlite:///./trackeasy.db"
    
    url = url.strip().strip("'\"")

    # Normalize scheme
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # If it's a postgres url, safely handle special characters like '@' in password
    if url.startswith("postgresql://"):
        try:
            scheme, rest = url.split("://", 1)
            if "@" in rest:
                # The last '@' separates user:password from host:port/db
                userinfo, host_part = rest.rsplit("@", 1)
                if ":" in userinfo:
                    username, password = userinfo.split(":", 1)
                    # Unquote first to avoid double-encoding, then safely quote
                    decoded_password = urllib.parse.unquote(password)
                    encoded_password = urllib.parse.quote(decoded_password, safe="")
                    url = f"{scheme}://{username}:{encoded_password}@{host_part}"
        except Exception as e:
            print(f"[Warning] Failed to auto-encode DB URL: {e}")

    return url

database_url = normalize_database_url(settings.DATABASE_URL)

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
