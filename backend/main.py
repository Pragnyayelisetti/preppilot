from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import process

app = FastAPI(
    title="PrepPilot API",
    description="Backend API for PrepPilot student career copilot and opportunity intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router)


@app.get("/")
def root():
    return {
        "status": "PrepPilot API is running",
        "version": "1.0.0",
        "endpoints": [
            "/api/profile",
            "/api/opportunities",
            "/api/process-email",
            "/api/sync-inbox",
            "/api/preview-whatsapp",
            "/docs",
        ]
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "PrepPilot API"}
