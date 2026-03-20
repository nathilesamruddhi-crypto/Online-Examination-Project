# backend/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)

    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)

    role = Column(String, default="student")

    is_active = Column(Boolean, default=True)  
    results = relationship("Result", back_populates="user", cascade="all, delete-orphan")
  
class Exam(Base):

    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=True)
    passing_marks = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="exam", cascade="all, delete-orphan")

    creator = relationship("User", foreign_keys=[created_by])


class Question(Base):

    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)

    question_text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)
    marks = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)

    # relationship
    exam = relationship("Exam", back_populates="questions")


class Result(Base):

    __tablename__ = "results"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))

    score = Column(Integer)
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    wrong_answers = Column(Integer)
    percentage = Column(Float)

    completed_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    user = relationship("User", back_populates="results")
    exam = relationship("Exam", back_populates="results")


class UserActivity(Base):

    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    activity_type = Column(String, nullable=False)
    details = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")