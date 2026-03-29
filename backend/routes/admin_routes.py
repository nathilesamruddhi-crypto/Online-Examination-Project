from fastapi import APIRouter
from database import SessionLocal
from models import Exam
from pydantic import BaseModel

class ExamCreate(BaseModel):
    title: str
    duration: int
    description: str | None = None

router = APIRouter(prefix="/admin")

@router.post("/create-exam")
def create_exam(exam: ExamCreate):

    db = SessionLocal()

    new_exam = Exam(
        title=exam.title,
        duration=exam.duration,
        description=exam.description
    )

    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    db.close()

    return {
        "message": "Exam created",
        "exam_id": new_exam.id,
        "duration": new_exam.duration
    }

@router.post("/add-question")

def add_question(
    exam_id: int,
    question_text: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
    correct_answer: str
):

    db = SessionLocal()

    question = Question(
        exam_id=exam_id,
        question_text=question_text,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer
    )

    db.add(question)
    db.commit()

    return {"message": "Question added"}