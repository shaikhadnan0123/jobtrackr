from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Timeline Schemas
class TimelineBase(BaseModel):
    note: str
    status_changed_to: Optional[str] = None

class TimelineCreate(TimelineBase):
    pass

class TimelineResponse(TimelineBase):
    id: str
    application_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationBase(BaseModel):
    company: str
    role: str
    location: str = "Hyderabad"
    job_type: str = "ML"
    employment_type: str = "Intern"
    portal_name: str = "LinkedIn"
    portal_link: Optional[str] = ""
    apply_link: Optional[str] = ""
    salary_text: Optional[str] = ""
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    follow_up_date: Optional[date] = None
    status: str = "Applied"
    response_status: str = "No Response"
    is_active: bool = True
    screenshot_jd_url: Optional[str] = ""
    screenshot_applied_url: Optional[str] = ""
    resume_version: Optional[str] = ""
    referral: Optional[str] = ""
    notes: Optional[str] = ""

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    employment_type: Optional[str] = None
    portal_name: Optional[str] = None
    portal_link: Optional[str] = None
    apply_link: Optional[str] = None
    salary_text: Optional[str] = None
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    follow_up_date: Optional[date] = None
    status: Optional[str] = None
    response_status: Optional[str] = None
    is_active: Optional[bool] = None
    screenshot_jd_url: Optional[str] = None
    screenshot_applied_url: Optional[str] = None
    resume_version: Optional[str] = None
    referral: Optional[str] = None
    notes: Optional[str] = None
    # Optional update note to append automatically to timeline
    timeline_note: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    timeline: List[TimelineResponse] = []
    # Computed helper flags for client
    is_stale: bool = False
    is_overdue: bool = False
    is_deadline_passed: bool = False

    class Config:
        from_attributes = True

# Stats Schemas
class StatsResponse(BaseModel):
    total_applied: int
    active_count: int
    interviews_count: int
    offers_count: int
    oa_test_count: int
    rejected_count: int
    response_rate_pct: float
    stale_count: int
    overdue_followups_count: int
    deadlines_soon_count: int

class ReminderDigestResponse(BaseModel):
    message: str
    today_date: str
    due_today: List[ApplicationResponse]
    stale_applications: List[ApplicationResponse]
    upcoming_deadlines: List[ApplicationResponse]
