import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, Date, DateTime, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Application(Base):
    __tablename__ = "applications"

    id = Column(Uuid(as_uuid=False), primary_key=True, default=generate_uuid)
    company = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    location = Column(String(100), nullable=False, default="Hyderabad")
    job_type = Column(String(50), nullable=False, default="ML")
    employment_type = Column(String(50), nullable=False, default="Intern")
    portal_name = Column(String(100), nullable=False, default="LinkedIn")
    portal_link = Column(String(1024), default="")
    apply_link = Column(String(1024), default="")
    salary_text = Column(String(100), default="")
    date_applied = Column(Date, default=date.today)
    deadline = Column(Date, nullable=True)
    follow_up_date = Column(Date, nullable=True, index=True)
    status = Column(String(50), nullable=False, default="Applied", index=True)
    response_status = Column(String(50), nullable=False, default="No Response")
    is_active = Column(Boolean, default=True, index=True)
    screenshot_jd_url = Column(String(1024), default="")
    screenshot_applied_url = Column(String(1024), default="")
    resume_version = Column(String(100), default="")
    referral = Column(String(255), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    timeline = relationship("Timeline", back_populates="application", cascade="all, delete-orphan", order_by="desc(Timeline.created_at)")

class Timeline(Base):
    __tablename__ = "timeline"

    id = Column(Uuid(as_uuid=False), primary_key=True, default=generate_uuid)
    application_id = Column(Uuid(as_uuid=False), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    status_changed_to = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="timeline")
