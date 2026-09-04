from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import process

app = FastAPI(title="PrepPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before any real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router)


@app.get("/")
def root():
    return {"status": "PrepPilot API is running"}
