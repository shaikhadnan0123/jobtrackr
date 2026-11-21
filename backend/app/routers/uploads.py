import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
import requests
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".png", ".jpg", ".jpeg", ".webp", ".pdf"]
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{file_ext}'. Allowed: {', '.join(allowed_exts)}"
        )

    unique_filename = f"{uuid.uuid4().hex}{file_ext}"

    # If Supabase URL and Service Key are configured, attempt upload to Supabase Storage bucket
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            content = await file.read()
            bucket = settings.SUPABASE_BUCKET
            supabase_upload_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{unique_filename}"
            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "apikey": settings.SUPABASE_KEY,
                "Content-Type": file.content_type or "application/octet-stream"
            }
            res = requests.post(supabase_upload_url, headers=headers, data=content, timeout=10)
            if res.status_code in [200, 201]:
                public_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/{unique_filename}"
                return {
                    "url": public_url,
                    "filename": unique_filename,
                    "storage": "supabase"
                }
        except Exception as e:
            # Fallback to local storage if network or Supabase fails
            print(f"[Supabase Upload Warning] Fallback to local storage: {e}")

    # Fallback / Local Storage
    local_file_path = os.path.join(UPLOAD_DIR, unique_filename)
    try:
        await file.seek(0)
        with open(local_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Local URL served via FastAPI static files mount
        return {
            "url": f"/uploads/{unique_filename}",
            "filename": unique_filename,
            "storage": "local"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store file: {str(e)}")
