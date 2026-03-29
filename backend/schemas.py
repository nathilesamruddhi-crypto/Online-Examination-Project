# backend/schemas.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# AI generation schemas
class AIQuestionGenerateRequest(BaseModel):
    subject: str = Field(..., min_length=2)
    difficulty: Optional[str] = Field(default="medium")
    count: int = Field(default=5, ge=1, le=20)
    context: Optional[str] = None
    exam_id: Optional[int] = None  # if provided, save to this exam

class GeneratedQuestion(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "student"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginSchema(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    first_name: Optional[str]
    last_name: Optional[str]
    message: str

# Exam Schemas
class ExamBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    duration: int = Field(..., ge=5, le=180)
    total_marks: Optional[int] = None
    passing_marks: Optional[int] = None

class ExamCreate(ExamBase):
    pass

class ExamUpdate(ExamBase):
    title: Optional[str] = None
    duration: Optional[int] = None
    is_active: Optional[bool] = None

class ExamResponse(ExamBase):
    id: int
    is_active: bool
    question_count: int
    created_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Question Schemas - ONLY ONE DEFINITION
class QuestionBase(BaseModel):
    exam_id: int
    question_text: str = Field(..., min_length=5)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answer: str = Field(..., pattern="^[A-D]$")  # Using pattern (correct for Pydantic v2)
    marks: int = 1

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None
    marks: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Result Schemas
class AnswerSubmit(BaseModel):
    user_id: int
    exam_id: int
    answers: Dict[str, str]  # question_id: answer
    time_taken: Optional[int] = None  # in seconds

class ResultCreate(BaseModel):
    user_id: int
    exam_id: int
    score: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    percentage: float
    answers: Optional[str] = None

class ResultResponse(BaseModel):
    id: int
    user_id: int
    exam_id: int
    exam_title: Optional[str]
    score: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    percentage: float
    completed_at: datetime
    
    class Config:
        from_attributes = True

class ResultDetailResponse(ResultResponse):
    answers: Optional[str] = None
    user_name: Optional[str] = None

# Activity Schemas
class ActivityCreate(BaseModel):
    user_id: int
    activity_type: str
    details: Optional[str] = None

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    details: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_users: int
    total_exams: int
    total_questions: int
    total_results: int
    active_exams: int
    average_score: Optional[float]

class UserDashboardStats(BaseModel):
    total_exams_taken: int
    average_score: float
    best_score: float
    total_time_spent: int
    exams_passed: int
    exams_failed: int
