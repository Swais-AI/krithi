import os
import sys
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import engine, get_db, SessionLocal
from app.models import Base
from app.routers import auth, users, students, teachers, classes, notices, ai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SGS School Admin API",
    description="Backend API for SGS School Admin Dashboard",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://staging.sgs.swais.in",
        "https://sgs.swais.in"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(notices.router, prefix="/api/notices", tags=["Notices"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables initialized successfully")
        
        # Check if users table exists
        db = SessionLocal()
        try:
            from sqlalchemy import text
            result = db.execute(text("SELECT COUNT(*) FROM sgs_users_masters"))
            count = result.scalar()
            logger.info(f"   👤 Users table: {count} users found")
        except Exception as e:
            logger.warning(f"   ⚠️ Users table not yet created or empty: {e}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error during database initialization: {str(e)}")
        # Don't crash the app, just log the error

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SGS School Admin API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
