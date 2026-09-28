"""Pydantic response models for the admin AI-usage endpoints.

AIUsageLog mirrors the SQLAlchemy model of the same name in app/models.py —
from_attributes lets FastAPI serialise the ORM rows directly. AIUsageStats
matches the dictionary get_usage_stats() builds; the nested shapes are the
list comprehensions in that function.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class AIUsageLog(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    operation_type: str
    model_name: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    cost: Optional[float] = None
    success: Optional[bool] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None


class UsageByType(BaseModel):
    operation: Optional[str] = None
    count: int


class TopUser(BaseModel):
    user_id: Optional[int] = None
    usage_count: int


class AIUsageStats(BaseModel):
    total_usage: int
    usage_by_type: List[UsageByType]
    top_users: List[TopUser]