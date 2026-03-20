# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import user_routes, exam_routes, result_routes, dashboard_routes
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)
logger.info("✅ Database tables created/verified")

app = FastAPI(
    title="Online Examination API",
    description="Complete API for Online Examination System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_routes.router)
app.include_router(exam_routes.router)
app.include_router(result_routes.router)
app.include_router(dashboard_routes.router)

@app.get("/")
def root():
    return {
        "message": "Online Examination API",
        "version": "1.0.0",
        "endpoints": {
            "users": {
                "register": "POST /users/register",
                "login": "POST /users/login",
                "profile": "GET /users/profile/{user_id}",
                "update_profile": "PUT /users/profile/{user_id}",
                "all_users": "GET /users/users"
            },
            "exams": {
                "all_exams": "GET /exams/",
                "get_exam": "GET /exams/{exam_id}",
                "create_exam": "POST /exams/",
                "update_exam": "PUT /exams/{exam_id}",
                "delete_exam": "DELETE /exams/{exam_id}"
            },
            "questions": {
                "get_questions": "GET /exams/{exam_id}/questions",
                "add_question": "POST /exams/questions",
                "update_question": "PUT /exams/questions/{question_id}",
                "delete_question": "DELETE /exams/questions/{question_id}",
                "bulk_add": "POST /exams/questions/bulk"
            },
            "results": {
                "submit": "POST /results/submit",
                "user_results": "GET /results/user/{user_id}",
                "exam_results": "GET /results/exam/{exam_id}",
                "result_detail": "GET /results/{result_id}"
            },
            "dashboard": {
                "admin": "GET /dashboard/admin",
                "student": "GET /dashboard/student/{user_id}"
            }
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}