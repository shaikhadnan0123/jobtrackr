from datetime import date, datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app import models, schemas

def annotate_application(app: models.Application) -> schemas.ApplicationResponse:
    today = date.today()
    updated_date = app.updated_at.date() if isinstance(app.updated_at, datetime) else today
    
    # 1. Overdue: Active & follow_up_date has arrived or passed
    is_overdue = bool(app.is_active and app.follow_up_date and app.follow_up_date <= today)
    
    # 2. Stale: Active, status is 'Applied' (no response yet) and no update for >= 14 days
    is_stale = bool(app.is_active and app.status == "Applied" and (today - updated_date).days >= 14)
    
    # 3. Deadline passed: Active and deadline < today
    is_deadline_passed = bool(app.deadline and app.deadline < today)

    # Convert to response schema
    resp = schemas.ApplicationResponse.model_validate(app)
    resp.is_overdue = is_overdue
    resp.is_stale = is_stale
    resp.is_deadline_passed = is_deadline_passed
    return resp

def get_applications(
    db: Session,
    skip: int = 0,
    limit: int = 200,
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    portal_name: Optional[str] = None,
    location: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
) -> List[schemas.ApplicationResponse]:
    query = db.query(models.Application)

    if status and status != "All":
        query = query.filter(models.Application.status == status)
    if job_type and job_type != "All":
        query = query.filter(models.Application.job_type == job_type)
    if portal_name and portal_name != "All":
        query = query.filter(models.Application.portal_name == portal_name)
    if location and location != "All":
        query = query.filter(models.Application.location == location)
    if is_active is not None:
        query = query.filter(models.Application.is_active == is_active)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Application.company.ilike(search_filter),
                models.Application.role.ilike(search_filter),
                models.Application.notes.ilike(search_filter),
                models.Application.referral.ilike(search_filter)
            )
        )

    # Sort primarily by date_applied descending, then updated_at descending
    apps = query.order_by(desc(models.Application.date_applied), desc(models.Application.updated_at)).offset(skip).limit(limit).all()
    return [annotate_application(a) for a in apps]

def get_application_by_id(db: Session, application_id: str) -> Optional[schemas.ApplicationResponse]:
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return None
    return annotate_application(app)

def create_application(db: Session, app_in: schemas.ApplicationCreate) -> schemas.ApplicationResponse:
    app_data = app_in.model_dump()
    if not app_data.get("date_applied"):
        app_data["date_applied"] = date.today()
        
    db_app = models.Application(**app_data)
    db.add(db_app)
    db.flush()

    # Automatically add initial timeline entry
    initial_timeline = models.Timeline(
        application_id=db_app.id,
        note=f"Application submitted to {db_app.company} for {db_app.role} via {db_app.portal_name}.",
        status_changed_to=db_app.status
    )
    db.add(initial_timeline)
    db.commit()
    db.refresh(db_app)

    return annotate_application(db_app)

def update_application(db: Session, application_id: str, app_update: schemas.ApplicationUpdate) -> Optional[schemas.ApplicationResponse]:
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        return None

    update_data = app_update.model_dump(exclude_unset=True)
    timeline_note = update_data.pop("timeline_note", None)
    old_status = db_app.status
    new_status = update_data.get("status")

    for field, val in update_data.items():
        setattr(db_app, field, val)

    db_app.updated_at = datetime.utcnow()

    # Check if status changed or a manual timeline note was provided
    if (new_status and new_status != old_status) or timeline_note:
        note_text = timeline_note or f"Status changed from '{old_status}' to '{new_status}'."
        timeline_entry = models.Timeline(
            application_id=db_app.id,
            note=note_text,
            status_changed_to=new_status if new_status != old_status else None
        )
        db.add(timeline_entry)

    db.commit()
    db.refresh(db_app)
    return annotate_application(db_app)

def delete_application(db: Session, application_id: str) -> bool:
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        return False
    db.delete(db_app)
    db.commit()
    return True

def add_timeline_entry(db: Session, application_id: str, timeline_in: schemas.TimelineCreate) -> Optional[schemas.TimelineResponse]:
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        return None

    timeline_entry = models.Timeline(
        application_id=application_id,
        note=timeline_in.note,
        status_changed_to=timeline_in.status_changed_to
    )
    if timeline_in.status_changed_to and timeline_in.status_changed_to != db_app.status:
        db_app.status = timeline_in.status_changed_to
        db_app.updated_at = datetime.utcnow()

    db.add(timeline_entry)
    db.commit()
    db.refresh(timeline_entry)
    return schemas.TimelineResponse.model_validate(timeline_entry)

def get_stats(db: Session) -> schemas.StatsResponse:
    today = date.today()
    all_apps = db.query(models.Application).all()

    total_applied = len(all_apps)
    active_count = sum(1 for a in all_apps if a.is_active)
    interviews_count = sum(1 for a in all_apps if a.status == "Interview")
    offers_count = sum(1 for a in all_apps if a.status == "Offer")
    oa_test_count = sum(1 for a in all_apps if a.status == "OA/Test")
    rejected_count = sum(1 for a in all_apps if a.status == "Rejected")

    # Response rate: applications where response_status is NOT 'No Response'
    responded_count = sum(1 for a in all_apps if a.response_status in ["Replied", "Shortlisted", "Rejected"] or a.status in ["OA/Test", "Interview", "Offer", "Rejected"])
    response_rate = round((responded_count / total_applied * 100), 1) if total_applied > 0 else 0.0

    # Overdue followups
    overdue_count = sum(1 for a in all_apps if a.is_active and a.follow_up_date and a.follow_up_date <= today)

    # Stale applications (status == Applied, active, no update for >= 14 days)
    stale_count = 0
    for a in all_apps:
        if a.is_active and a.status == "Applied":
            updated_d = a.updated_at.date() if isinstance(a.updated_at, datetime) else today
            if (today - updated_d).days >= 14:
                stale_count += 1

    # Deadlines soon: deadline is within next 7 days and >= today
    seven_days = today + timedelta(days=7)
    deadlines_soon_count = sum(1 for a in all_apps if a.is_active and a.deadline and today <= a.deadline <= seven_days)

    return schemas.StatsResponse(
        total_applied=total_applied,
        active_count=active_count,
        interviews_count=interviews_count,
        offers_count=offers_count,
        oa_test_count=oa_test_count,
        rejected_count=rejected_count,
        response_rate_pct=response_rate,
        stale_count=stale_count,
        overdue_followups_count=overdue_count,
        deadlines_soon_count=deadlines_soon_count
    )

def get_reminder_digest(db: Session) -> schemas.ReminderDigestResponse:
    today = date.today()
    three_days = today + timedelta(days=3)
    all_apps = db.query(models.Application).filter(models.Application.is_active == True).all()

    due_today_apps = []
    stale_apps = []
    upcoming_deadlines_apps = []

    for a in all_apps:
        # Due today or overdue
        if a.follow_up_date and a.follow_up_date <= today:
            due_today_apps.append(annotate_application(a))

        # Stale
        updated_d = a.updated_at.date() if isinstance(a.updated_at, datetime) else today
        if a.status == "Applied" and (today - updated_d).days >= 14:
            stale_apps.append(annotate_application(a))

        # Upcoming deadlines
        if a.deadline and today <= a.deadline <= three_days:
            upcoming_deadlines_apps.append(annotate_application(a))

    message = f"{len(due_today_apps)} follow-ups due, {len(stale_apps)} applications stale (14+ days), {len(upcoming_deadlines_apps)} deadlines approaching soon."

    return schemas.ReminderDigestResponse(
        message=message,
        today_date=today.strftime("%Y-%m-%d"),
        due_today=due_today_apps,
        stale_applications=stale_apps,
        upcoming_deadlines=upcoming_deadlines_apps
    )
