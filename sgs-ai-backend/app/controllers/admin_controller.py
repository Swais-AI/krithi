# AI Backend Admin Controller
# Updated to use sgs_ai_usage_logs table

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import AIUsageLog as AIUsageLogModel
from ..schemas import AIUsageLog, AIUsageStats

router = APIRouter()

@router.get("/usage-logs", response_model=List[AIUsageLog])
async def get_usage_logs(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get AI usage logs with optional filters"""
    
    query = db.query(AIUsageLogModel)
    
    if start_date:
        query = query.filter(AIUsageLogModel.created_at >= start_date)
    if end_date:
        query = query.filter(AIUsageLogModel.created_at <= end_date)
    if user_id:
        query = query.filter(AIUsageLogModel.user_id == user_id)
    
    logs = query.order_by(AIUsageLogModel.created_at.desc()).all()
    return logs

@router.get("/usage-stats", response_model=AIUsageStats)
async def get_usage_stats(
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get AI usage statistics for the last N days"""
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    total_usage = db.query(AIUsageLogModel).filter(
        AIUsageLogModel.created_at >= cutoff_date
    ).count()
    
    usage_by_type = db.query(
        AIUsageLogModel.operation_type,
        func.count(AIUsageLogModel.id).label('count')
    ).filter(
        AIUsageLogModel.created_at >= cutoff_date
    ).group_by(AIUsageLogModel.operation_type).all()
    
    usage_by_user = db.query(
        AIUsageLogModel.user_id,
        func.count(AIUsageLogModel.id).label('count')
    ).filter(
        AIUsageLogModel.created_at >= cutoff_date
    ).group_by(AIUsageLogModel.user_id).order_by(
        func.count(AIUsageLogModel.id).desc()
    ).limit(10).all()
    
    return {
        "total_usage": total_usage,
        "usage_by_type": [
            {"operation": item[0], "count": item[1]} 
            for item in usage_by_type
        ],
        "top_users": [
            {"user_id": item[0], "usage_count": item[1]} 
            for item in usage_by_user
        ]
    }

@router.get("/usage-logs/{log_id}", response_model=AIUsageLog)
async def get_usage_log(log_id: int, db: Session = Depends(get_db)):
    """Get a specific usage log by ID"""
    
    log = db.query(AIUsageLogModel).filter(AIUsageLogModel.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Usage log not found")
    return log

@router.delete("/usage-logs/{log_id}")
async def delete_usage_log(log_id: int, db: Session = Depends(get_db)):
    """Delete a usage log"""
    
    log = db.query(AIUsageLogModel).filter(AIUsageLogModel.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Usage log not found")
    
    db.delete(log)
    db.commit()
    
    return {"message": "Usage log deleted successfully"}
