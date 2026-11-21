import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.routers import applications, stats, uploads

# Auto-create tables on launch (for SQLite and Postgres)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for JobTrackr - Track job applications, proof screenshots, timeline, and follow-ups."
)

# Setup CORS for React frontend (Vite dev server, localhost, and deployed frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount for static file serving
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(applications.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "database": settings.DATABASE_URL.split("://")[0]
    }
