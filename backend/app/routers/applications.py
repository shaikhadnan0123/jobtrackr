import io
import csv
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[schemas.ApplicationResponse])
def read_applications(
    status: Optional[str] = Query(None, description="Filter by status (e.g. Applied, Interview)"),
    job_type: Optional[str] = Query(None, description="Filter by job type (ML, GenAI, Data, SDE)"),
    portal_name: Optional[str] = Query(None, description="Filter by portal"),
    location: Optional[str] = Query(None, description="Filter by location"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search company, role, notes, referral"),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return crud.get_applications(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        job_type=job_type,
        portal_name=portal_name,
        location=location,
        is_active=is_active,
        search=search
    )

@router.get("/export/csv")
def export_applications_csv(
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    portal_name: Optional[str] = None,
    location: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    apps = crud.get_applications(
        db=db,
        skip=0,
        limit=1000,
        status=status,
        job_type=job_type,
        portal_name=portal_name,
        location=location,
        is_active=is_active,
        search=search
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Company", "Role", "Location", "Job Type", "Employment Type",
        "Portal", "Status", "Response Status", "Date Applied", "Deadline",
        "Follow-up Date", "Salary / Stipend", "Active", "Resume Version", "Referral", "Notes", "Portal Link"
    ])

    for a in apps:
        writer.writerow([
            a.id, a.company, a.role, a.location, a.job_type, a.employment_type,
            a.portal_name, a.status, a.response_status, str(a.date_applied or ""),
            str(a.deadline or ""), str(a.follow_up_date or ""), a.salary_text,
            "Yes" if a.is_active else "No", a.resume_version, a.referral, a.notes, a.portal_link
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=jobtrackr_applications.csv"}
    )

@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def read_application(application_id: str, db: Session = Depends(get_db)):
    app = crud.get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(app_in: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    return crud.create_application(db, app_in)

@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(application_id: str, app_update: schemas.ApplicationUpdate, db: Session = Depends(get_db)):
    updated = crud.update_application(db, application_id, app_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_application(db, application_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return None

@router.post("/{application_id}/timeline", response_model=schemas.TimelineResponse, status_code=status.HTTP_201_CREATED)
def add_timeline_event(application_id: str, timeline_in: schemas.TimelineCreate, db: Session = Depends(get_db)):
    entry = crud.add_timeline_entry(db, application_id, timeline_in)
    if not entry:
        raise HTTPException(status_code=404, detail="Application not found")
    return entry
