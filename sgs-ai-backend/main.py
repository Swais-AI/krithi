from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from app.routes.admin_routes import router as admin_router

app = FastAPI(title="SGS AI Backend", version="1.0.0")

# CORS middleware - allow frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "SGS AI Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_enabled": True}
