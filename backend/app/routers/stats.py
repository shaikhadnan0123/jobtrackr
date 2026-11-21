from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="", tags=["Stats & Digest"])

@router.get("/stats", response_model=schemas.StatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

@router.get("/reminders/digest", response_model=schemas.ReminderDigestResponse)
def get_daily_reminder_digest(db: Session = Depends(get_db)):
    return crud.get_reminder_digest(db)
