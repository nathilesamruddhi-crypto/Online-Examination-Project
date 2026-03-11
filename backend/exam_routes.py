from fastapi import APIRouter
from database import SessionLocal
from models import Question, Result

router = APIRouter()

@router.get("/questions")
def get_questions():
    db = SessionLocal()
    return db.query(Question).all()

@router.post("/submit")
def submit_exam(data: dict):

    db = SessionLocal()

    answers = data["answers"]

    questions = db.query(Question).all()

    score = 0

    for q in questions:
        if answers[str(q.id)] == q.answer:
            score += 1

    result = Result(user_id=data["user"], score=score)

    db.add(result)
    db.commit()

    return {"score": score}