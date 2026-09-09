# AI Backend Models
# Updated to use sgs_ai_usage_logs and sgs_ai_chat_messages

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class AIUsageLog(Base):
    __tablename__ = 'sgs_ai_usage_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('sgs_users_masters.user_id'), nullable=False)
    operation_type = Column(String(100), nullable=False)
    model_name = Column(String(100))
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class AIChatMessage(Base):
    __tablename__ = 'sgs_ai_chat_messages'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('sgs_users_masters.user_id'), nullable=False)
    conversation_id = Column(String(100))
    role = Column(String(50))  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    model_name = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationship
    user = relationship("User", backref="chat_messages")
