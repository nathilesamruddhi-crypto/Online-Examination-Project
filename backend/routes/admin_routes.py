from fastapi import APIRouter
from database import SessionLocal
from models import Exam

router = APIRouter(prefix="/admin")

@router.post("/create-exam")
def create_exam(title: str, duration: int):

    db = SessionLocal()

    exam = Exam(
        title=title,
        duration=duration
    )

    db.add(exam)
    db.commit()

    return {"message": "Exam created"}

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