# Database models for SGS backend
# Updated to use sgs_users_masters table

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'sgs_users_masters'
    
    user_id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default='user')
    school_id = Column(Integer, ForeignKey('sgs_school_masters.school_id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class School(Base):
    __tablename__ = 'sgs_school_masters'
    
    school_id = Column(Integer, primary_key=True)
    school_name = Column(String(255), nullable=False)
    school_code = Column(String(50), unique=True)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Student(Base):
    __tablename__ = 'sgs_student_master'
    
    admission_no = Column(String(50), primary_key=True)
    full_name = Column(String(150), nullable=False)
    class_id = Column(Integer, ForeignKey('sgs_class_master.class_id'))
    section = Column(String(20))
    roll_no = Column(String(20))
    parent1_name = Column(String(150))
    parent1_phone = Column(String(20))
    parent1_email = Column(String(150))
    parent2_name = Column(String(150))
    parent2_phone = Column(String(20))
    parent2_email = Column(String(150))
    student_phone = Column(String(20))
    student_email = Column(String(150))
    guardian_name = Column(String(150))
    guardian_phone = Column(String(20))
    guardian_email = Column(String(150))
    record_status = Column(String(20), default='Active')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Teacher(Base):
    __tablename__ = 'sgs_teacher_master'
    
    teacher_id = Column(String(50), primary_key=True)
    full_name = Column(String(150), nullable=False)
    subject_name = Column(String(100))
    qualification = Column(String(100))
    class_id = Column(Integer, ForeignKey('sgs_class_master.class_id'))
    section_1 = Column(String(20))
    section_2 = Column(String(20))
    role = Column(String(50))
    is_class_teacher = Column(Boolean, default=False)
    subjects = Column(Text)  # Comma separated
    phone = Column(String(20))
    email_id = Column(String(150))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Class(Base):
    __tablename__ = 'sgs_class_master'
    
    class_id = Column(Integer, primary_key=True)
    class_name = Column(String(50))
    section_name = Column(String(20))
    record_status = Column(String(20), default='Active')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Notice(Base):
    __tablename__ = 'sgs_notice_board'
    
    notice_id = Column(Integer, primary_key=True)
    notice_title = Column(String(200), nullable=False)
    notice_text = Column(Text, nullable=False)
    notice_date = Column(DateTime, server_default=func.now())
    applicable_class = Column(String(50))
    record_status = Column(String(20), default='Active')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
