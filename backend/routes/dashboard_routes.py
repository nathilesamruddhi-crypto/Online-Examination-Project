# backend/routes/dashboard_routes.py
from fastapi import APIRouter
from database import SessionLocal
from models import User, Exam, Question, Result
from sqlalchemy import func
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/admin", response_model=dict)
def get_admin_dashboard():
    """Get admin dashboard statistics."""
    db = SessionLocal()
    try:
        # Basic counts
        total_users = db.query(User).count()
        total_exams = db.query(Exam).count()
        total_questions = db.query(Question).count()
        total_results = db.query(Result).count()
        
        # Active exams
        active_exams = db.query(Exam).filter(Exam.is_active == True).count()
        
        # User roles distribution
        students = db.query(User).filter(User.role == "student").count()
        admins = db.query(User).filter(User.role == "admin").count()
        
        # Recent exams
        recent_exams = db.query(Exam).order_by(Exam.created_at.desc()).limit(5).all()
        exams_list = [{"id": e.id, "title": e.title, "created_at": e.created_at} for e in recent_exams]
        
        # Recent users
        recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
        users_list = [{"id": u.id, "username": u.username, "role": u.role} for u in recent_users]
        
        # Average scores
        avg_score = db.query(func.avg(Result.percentage)).scalar() or 0
        
        # Results per day (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        daily_results = db.query(
            func.date(Result.completed_at).label('date'),
            func.count(Result.id).label('count')
        ).filter(Result.completed_at >= seven_days_ago).group_by(func.date(Result.completed_at)).all()
        
        activity = [{"date": str(d.date), "count": d.count} for d in daily_results]
        
        db.close()
        
        return {
            "total_users": total_users,
            "total_exams": total_exams,
            "total_questions": total_questions,
            "total_results": total_results,
            "active_exams": active_exams,
            "students_count": students,
            "admins_count": admins,
            "average_score": round(avg_score, 2) if avg_score else 0,
            "recent_exams": exams_list,
            "recent_users": users_list,
            "activity": activity
        }
        
    except Exception as e:
        db.close()
        logger.error(f"Error fetching admin dashboard: {e}")
        return {"error": str(e)}

@router.get("/student/{user_id}", response_model=dict)
def get_student_dashboard(user_id: int):
    """Get student dashboard statistics."""
    db = SessionLocal()
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            db.close()
            return {"error": "User not found"}
        
        # Results
        results = db.query(Result).filter(Result.user_id == user_id).all()
        total_exams_taken = len(results)
        
        if total_exams_taken > 0:
            avg_score = sum(r.percentage for r in results) / total_exams_taken
            best_score = max(r.percentage for r in results)
            passed = sum(1 for r in results if r.percentage >= 40)  # Assuming 40% passing
            failed = total_exams_taken - passed
        else:
            avg_score = 0
            best_score = 0
            passed = 0
            failed = 0
        
        # Available exams
        available_exams = db.query(Exam).filter(Exam.is_active == True).all()
        exams_list = []
        
        for exam in available_exams:
            # Check if already taken
            taken = any(r.exam_id == exam.id for r in results)
            question_count = db.query(Question).filter(Question.exam_id == exam.id).count()
            
            exams_list.append({
                "id": exam.id,
                "title": exam.title,
                "description": exam.description,
                "duration": exam.duration,
                "question_count": question_count,
                "is_taken": taken
            })
        
        # Recent results
        recent_results = []
        for r in sorted(results, key=lambda x: x.completed_at, reverse=True)[:5]:
            exam = db.query(Exam).filter(Exam.id == r.exam_id).first()
            recent_results.append({
                "id": r.id,
                "exam_title": exam.title if exam else "Unknown",
                "score": r.score,
                "total": r.total_questions,
                "percentage": r.percentage,
                "completed_at": r.completed_at
            })
        
        db.close()
        
        return {
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name
        },
        "stats": {
            "total_exams_taken": total_exams_taken,
            "average_score": round(avg_score, 2),
            "best_score": round(best_score, 2),
            "passed": passed,
            "failed": failed
        },
        "exams": exams_list,   # 🔥 THIS IS THE FIX
        "recent_results": recent_results
    }
        
    except Exception as e:
        db.close()
        logger.error(f"Error fetching student dashboard: {e}")
        return {"error": str(e)}