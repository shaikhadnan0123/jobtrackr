import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.PROJECT_NAME} on http://localhost:{settings.PORT}")
    print(f"📖 Swagger Docs available at http://localhost:{settings.PORT}/docs")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
