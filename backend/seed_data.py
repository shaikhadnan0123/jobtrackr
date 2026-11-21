from datetime import date, timedelta
from app.database import SessionLocal, Base, engine
from app import models

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.Application).count() > 0:
        print("Database already contains applications. Skipping seed.")
        db.close()
        return

    today = date.today()

    sample_apps = [
        {
            "company": "Swiggy",
            "role": "Machine Learning Engineer Intern",
            "location": "Bengaluru",
            "job_type": "ML",
            "employment_type": "Intern",
            "portal_name": "LinkedIn",
            "portal_link": "https://linkedin.com/jobs/view/swiggy-ml-intern",
            "apply_link": "https://careers.swiggy.com/jobs/ml-intern",
            "salary_text": "₹45,000 / month",
            "date_applied": today - timedelta(days=5),
            "deadline": today + timedelta(days=2),
            "follow_up_date": today,  # Due today!
            "status": "Applied",
            "response_status": "No Response",
            "is_active": True,
            "resume_version": "ML_Intern_CV_v2.pdf",
            "referral": "Rohan (Senior MLE @ Swiggy)",
            "notes": "Applied with recommendation. Mentioned LLM fine-tuning project and RAG pipeline in cover letter."
        },
        {
            "company": "PhonePe",
            "role": "GenAI Engineer Intern",
            "location": "Hyderabad",
            "job_type": "GenAI",
            "employment_type": "Intern",
            "portal_name": "Cutshort",
            "portal_link": "https://cutshort.io/job/phonepe-genai",
            "apply_link": "https://phonepe.com/careers",
            "salary_text": "₹50,000 / month",
            "date_applied": today - timedelta(days=16),
            "deadline": today - timedelta(days=1),
            "follow_up_date": today - timedelta(days=2), # Overdue!
            "status": "OA/Test",
            "response_status": "Replied",
            "is_active": True,
            "resume_version": "GenAI_Specialist_CV.pdf",
            "referral": "",
            "notes": "Completed HackerEarth assessment: 3 coding problems solved (Graphs, Dynamic Programming, NLP scoring)."
        },
        {
            "company": "Zepto",
            "role": "Data Scientist - Demand Forecasting",
            "location": "Bengaluru",
            "job_type": "Data",
            "employment_type": "Full-time",
            "portal_name": "LinkedIn",
            "portal_link": "https://linkedin.com/jobs/view/zepto-ds",
            "apply_link": "https://zepto.freshteam.com",
            "salary_text": "14-16 LPA",
            "date_applied": today - timedelta(days=20),
            "deadline": today + timedelta(days=10),
            "follow_up_date": today + timedelta(days=3),
            "status": "Interview",
            "response_status": "Shortlisted",
            "is_active": True,
            "resume_version": "Data_Science_General.pdf",
            "referral": "Priya Sharma (HR)",
            "notes": "Technical round 1 cleared. System design & ML deployment round scheduled for Thursday."
        },
        {
            "company": "Razorpay",
            "role": "SDE Intern (Python/Go)",
            "location": "Bengaluru",
            "job_type": "SDE",
            "employment_type": "Intern",
            "portal_name": "Company Career Page",
            "portal_link": "https://razorpay.com/jobs/sde-intern",
            "apply_link": "https://razorpay.com/jobs/sde-intern/apply",
            "salary_text": "₹40,000 / month",
            "date_applied": today - timedelta(days=18),
            "deadline": today - timedelta(days=5),
            "follow_up_date": None,
            "status": "Applied",  # Stale! (applied 18 days ago, no update)
            "response_status": "No Response",
            "is_active": True,
            "resume_version": "Backend_SDE_CV.pdf",
            "referral": "",
            "notes": "Applied directly through careers portal. Need to find alumnus on LinkedIn for follow-up."
        },
        {
            "company": "Zomato",
            "role": "Machine Learning Intern",
            "location": "Gurgaon",
            "job_type": "ML",
            "employment_type": "Intern",
            "portal_name": "Naukri",
            "portal_link": "https://naukri.com/job/zomato-ml",
            "apply_link": "https://zomato.com/careers",
            "salary_text": "₹35,000 / month",
            "date_applied": today - timedelta(days=3),
            "deadline": today + timedelta(days=5),
            "follow_up_date": today + timedelta(days=4),
            "status": "Wishlist",
            "response_status": "No Response",
            "is_active": True,
            "resume_version": "ML_Intern_CV_v2.pdf",
            "referral": "",
            "notes": "Prepping custom resume matching the Recommendation Systems requirements."
        }
    ]

    for item in sample_apps:
        app = models.Application(**item)
        db.add(app)
        db.flush()

        timeline = models.Timeline(
            application_id=app.id,
            note=f"Submitted application to {app.company} via {app.portal_name}.",
            status_changed_to=app.status
        )
        db.add(timeline)

        if app.status in ["OA/Test", "Interview"]:
            followup_tl = models.Timeline(
                application_id=app.id,
                note=f"Recruiter contacted: Moved to {app.status}.",
                status_changed_to=app.status
            )
            db.add(followup_tl)

    db.commit()
    print("✅ Seeded 5 realistic applications with timelines, follow-up flags, and statuses!")
    db.close()

if __name__ == "__main__":
    seed()
