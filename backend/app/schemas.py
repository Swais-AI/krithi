from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AIUsageLog(BaseModel):
    id: Optional[int] = None
    user_id: int
    operation_type: str
    model_name: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None

class AIUsageStats(BaseModel):
    total_usage: int
    usage_by_type: List[dict] = []
    top_users: List[dict] = []
