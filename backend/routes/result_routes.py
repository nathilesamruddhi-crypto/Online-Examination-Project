# # backend/routes/exam_routes.py
# from fastapi import APIRouter, HTTPException
# from database import SessionLocal
# from models import Exam, Question, User, Result
# from schemas import (
#     ExamCreate, ExamUpdate, ExamResponse,
#     QuestionCreate, QuestionUpdate, QuestionResponse
# )
# from typing import List
# import logging

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(prefix="/exams", tags=["exams"])
# router = APIRouter(prefix="/results", tags=["results"])

# # ============= Exam Endpoints =============

# @router.get("/", response_model=List[ExamResponse])
# def get_all_exams():
#     """Get all exams."""
#     db = SessionLocal()
#     try:
#         exams = db.query(Exam).filter(Exam.is_active == True).all()
#         result = []
        
#         for exam in exams:
#             question_count = db.query(Question).filter(Question.exam_id == exam.id).count()
#             exam_dict = {
#                 "id": exam.id,
#                 "title": exam.title,
#                 "description": exam.description,
#                 "duration": exam.duration,
#                 "total_marks": exam.total_marks,
#                 "passing_marks": exam.passing_marks,
#                 "is_active": exam.is_active,
#                 "question_count": question_count,
#                 "created_by": exam.created_by,
#                 "created_at": exam.created_at
#             }
#             result.append(exam_dict)
        
#         db.close()
#         return result
        
#     except Exception as e:
#         db.close()
#         logger.error(f"Error fetching exams: {e}")
#         return []

# @router.get("/user/{user_id}")
# def get_user_results(user_id: int):
#     """Get all results for a specific user."""
#     db = SessionLocal()
#     try:
#         logger.info(f"Fetching results for user: {user_id}")
        
#         results = db.query(Result).filter(Result.user_id == user_id).order_by(Result.completed_at.desc()).all()
#         result_list = []
        
#         for r in results:
#             exam = db.query(Exam).filter(Exam.id == r.exam_id).first()
#             result_list.append({
#                 "id": r.id,
#                 "user_id": r.user_id,
#                 "exam_id": r.exam_id,
#                 "exam_title": exam.title if exam else "Unknown",
#                 "score": r.score,
#                 "total_questions": r.total_questions,
#                 "correct_answers": r.correct_answers if r.correct_answers else 0,
#                 "wrong_answers": r.wrong_answers if r.wrong_answers else 0,
#                 "percentage": r.percentage if r.percentage else 0,
#                 "completed_at": r.completed_at
#             })
        
#         db.close()
#         logger.info(f"Found {len(result_list)} results for user {user_id}")
#         return result_list
        
#     except Exception as e:
#         db.close()
#         logger.error(f"Error fetching user results: {e}")
#         return {"error": str(e)}
    
# @router.get("/{exam_id}", response_model=dict)
# def get_exam(exam_id: int):
#     """Get exam by ID."""
#     db = SessionLocal()
#     try:
#         exam = db.query(Exam).filter(Exam.id == exam_id).first()
        
#         if not exam:
#             db.close()
#             return {"error": "Exam not found"}
        
#         question_count = db.query(Question).filter(Question.exam_id == exam_id).count()
        
#         db.close()
        
#         return {
#             "id": exam.id,
#             "title": exam.title,
#             "description": exam.description,
#             "duration": exam.duration,
#             "total_marks": exam.total_marks,
#             "passing_marks": exam.passing_marks,
#             "is_active": exam.is_active,
#             "question_count": question_count,
#             "created_by": exam.created_by,
#             "created_at": exam.created_at
#         }
        
#     except Exception as e:
#         db.close()
#         return {"error": str(e)}

# @router.post("/", response_model=dict)
# def create_exam(exam: ExamCreate):
#     """Create a new exam."""
#     db = SessionLocal()
#     try:
#         new_exam = Exam(
#             title=exam.title,
#             description=exam.description,
#             duration=exam.duration,
#             total_marks=exam.total_marks,
#             passing_marks=exam.passing_marks
#         )
        
#         db.add(new_exam)
#         db.commit()
#         db.refresh(new_exam)
        
#         logger.info(f"✅ Exam created: {exam.title}")
#         db.close()
        
#         return {
#             "message": "Exam created successfully",
#             "exam_id": new_exam.id
#         }
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         logger.error(f"Error creating exam: {e}")
#         return {"error": str(e)}

# @router.put("/{exam_id}", response_model=dict)
# def update_exam(exam_id: int, exam: ExamUpdate):
#     """Update an exam."""
#     db = SessionLocal()
#     try:
#         db_exam = db.query(Exam).filter(Exam.id == exam_id).first()
        
#         if not db_exam:
#             db.close()
#             return {"error": "Exam not found"}
        
#         # Update fields
#         if exam.title:
#             db_exam.title = exam.title
#         if exam.description is not None:
#             db_exam.description = exam.description
#         if exam.duration:
#             db_exam.duration = exam.duration
#         if exam.total_marks:
#             db_exam.total_marks = exam.total_marks
#         if exam.passing_marks:
#             db_exam.passing_marks = exam.passing_marks
#         if exam.is_active is not None:
#             db_exam.is_active = exam.is_active
        
#         db.commit()
#         db.refresh(db_exam)
#         db.close()
        
#         return {"message": "Exam updated successfully"}
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         return {"error": str(e)}

# @router.delete("/{exam_id}", response_model=dict)
# def delete_exam(exam_id: int):
#     """Delete an exam."""
#     db = SessionLocal()
#     try:
#         exam = db.query(Exam).filter(Exam.id == exam_id).first()
        
#         if not exam:
#             db.close()
#             return {"error": "Exam not found"}
        
#         db.delete(exam)
#         db.commit()
#         db.close()
        
#         return {"message": "Exam deleted successfully"}
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         return {"error": str(e)}

# # ============= Question Endpoints =============

# @router.get("/{exam_id}/questions", response_model=List[QuestionResponse])
# def get_exam_questions(exam_id: int):
#     """Get all questions for an exam."""
#     db = SessionLocal()
#     try:
#         questions = db.query(Question).filter(Question.exam_id == exam_id).all()
#         db.close()
#         return questions
#     except Exception as e:
#         db.close()
#         return []

# @router.get("/questions/{question_id}", response_model=dict)
# def get_question(question_id: int):
#     """Get question by ID."""
#     db = SessionLocal()
#     try:
#         question = db.query(Question).filter(Question.id == question_id).first()
        
#         if not question:
#             db.close()
#             return {"error": "Question not found"}
        
#         db.close()
#         return {
#             "id": question.id,
#             "exam_id": question.exam_id,
#             "question_text": question.question_text,
#             "option_a": question.option_a,
#             "option_b": question.option_b,
#             "option_c": question.option_c,
#             "option_d": question.option_d,
#             "correct_answer": question.correct_answer,
#             "marks": question.marks
#         }
        
#     except Exception as e:
#         db.close()
#         return {"error": str(e)}

# @router.post("/questions", response_model=dict)
# def add_question(question: QuestionCreate):
#     """Add a question to an exam."""
#     db = SessionLocal()
#     try:
#         # Verify exam exists
#         exam = db.query(Exam).filter(Exam.id == question.exam_id).first()
#         if not exam:
#             db.close()
#             return {"error": "Exam not found"}
        
#         new_question = Question(
#             exam_id=question.exam_id,
#             question_text=question.question_text,
#             option_a=question.option_a,
#             option_b=question.option_b,
#             option_c=question.option_c,
#             option_d=question.option_d,
#             correct_answer=question.correct_answer,
#             marks=question.marks
#         )
        
#         db.add(new_question)
#         db.commit()
#         db.refresh(new_question)
        
#         logger.info(f"✅ Question added to exam {question.exam_id}")
#         db.close()
        
#         return {
#             "message": "Question added successfully",
#             "question_id": new_question.id
#         }
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         logger.error(f"Error adding question: {e}")
#         return {"error": str(e)}

# @router.put("/questions/{question_id}", response_model=dict)
# def update_question(question_id: int, question: QuestionUpdate):
#     """Update a question."""
#     db = SessionLocal()
#     try:
#         db_question = db.query(Question).filter(Question.id == question_id).first()
        
#         if not db_question:
#             db.close()
#             return {"error": "Question not found"}
        
#         # Update fields
#         if question.question_text:
#             db_question.question_text = question.question_text
#         if question.option_a:
#             db_question.option_a = question.option_a
#         if question.option_b:
#             db_question.option_b = question.option_b
#         if question.option_c:
#             db_question.option_c = question.option_c
#         if question.option_d:
#             db_question.option_d = question.option_d
#         if question.correct_answer:
#             db_question.correct_answer = question.correct_answer
#         if question.marks:
#             db_question.marks = question.marks
        
#         db.commit()
#         db.refresh(db_question)
#         db.close()
        
#         return {"message": "Question updated successfully"}
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         return {"error": str(e)}

# @router.delete("/questions/{question_id}", response_model=dict)
# def delete_question(question_id: int):
#     """Delete a question."""
#     db = SessionLocal()
#     try:
#         question = db.query(Question).filter(Question.id == question_id).first()
        
#         if not question:
#             db.close()
#             return {"error": "Question not found"}
        
#         db.delete(question)
#         db.commit()
#         db.close()
        
#         return {"message": "Question deleted successfully"}
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         return {"error": str(e)}

# @router.post("/questions/bulk", response_model=dict)
# def bulk_add_questions(questions: List[QuestionCreate]):
#     """Add multiple questions at once."""
#     db = SessionLocal()
#     try:
#         if not questions:
#             db.close()
#             return {"error": "No questions provided"}
        
#         # Verify exam exists
#         exam_id = questions[0].exam_id
#         exam = db.query(Exam).filter(Exam.id == exam_id).first()
#         if not exam:
#             db.close()
#             return {"error": "Exam not found"}
        
#         added_count = 0
#         for q in questions:
#             if q.exam_id != exam_id:
#                 continue  # Skip questions for different exams
            
#             new_question = Question(
#                 exam_id=q.exam_id,
#                 question_text=q.question_text,
#                 option_a=q.option_a,
#                 option_b=q.option_b,
#                 option_c=q.option_c,
#                 option_d=q.option_d,
#                 correct_answer=q.correct_answer,
#                 marks=q.marks
#             )
#             db.add(new_question)
#             added_count += 1
        
#         db.commit()
#         db.close()
        
#         logger.info(f"✅ {added_count} questions added to exam {exam_id}")
        
#         return {
#             "message": f"{added_count} questions added successfully",
#             "count": added_count
#         }
        
#     except Exception as e:
#         db.rollback()
#         db.close()
#         return {"error": str(e)}


# @router.post("/submit")
# def submit_exam(data: dict):
#     db = SessionLocal()

#     user_id = data.get("user_id")
#     exam_id = data.get("exam_id")
#     answers = data.get("answers")

#     questions = db.query(Question).filter(
#         Question.exam_id == exam_id
#     ).all()

#     score = 0
#     correct = 0
#     wrong = 0

#     for q in questions:
#         if str(q.id) in answers:
#             if answers[str(q.id)] == q.correct_answer:
#                 score += 1
#                 correct += 1
#             else:
#                 wrong += 1

#     result = Result(
#         user_id=user_id,
#         exam_id=exam_id,
#         score=score,
#         total_questions=len(questions),
#         correct_answers=correct,
#         wrong_answers=wrong,
#         percentage=(score / len(questions)) * 100,
#         completed_at=datetime.utcnow()
#     )

#     db.add(result)
#     db.commit()
#     db.refresh(result)
#     db.close()

#     return {
#         "message": "Exam submitted",
#         "score": score,
#         "percentage": result.percentage
#     }


from fastapi import APIRouter
from database import SessionLocal
from models import Question, Result, Exam
from datetime import datetime

router = APIRouter(prefix="/results", tags=["results"])

@router.get("/user/{user_id}")
def get_user_results(user_id: int):
    db = SessionLocal()
    try:
        results = db.query(Result).filter(Result.user_id == user_id).all()
        return results
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

# (Optional AI)
# from sentence_transformers import SentenceTransformer, util
# model = SentenceTransformer('all-MiniLM-L6-v2')

@router.post("/submit")
def submit_exam(data: dict):
    db = SessionLocal()

    try:
        user_id = data.get("user_id")
        exam_id = data.get("exam_id")
        answers = data.get("answers")

        if not user_id or not exam_id or not answers:
            return {"error": "Missing data"}

        questions = db.query(Question).filter(
            Question.exam_id == exam_id
        ).all()

        exam = db.query(Exam).filter(Exam.id == exam_id).first()

        if not exam or not questions:
            return {"error": "Invalid exam"}

        score = 0
        correct = 0
        wrong = 0

        for q in questions:
            if str(q.id) in answers:
                student_ans = answers[str(q.id)]

                # ✅ BASIC MATCH
                if student_ans == q.correct_answer:
                    score += q.marks if q.marks else 1
                    correct += 1
                else:
                    wrong += 1

                # 🔥 AI MATCH (optional)
                """
                if is_correct(student_ans, q.correct_answer):
                    score += q.marks
                    correct += 1
                else:
                    wrong += 1
                """

        # ✅ percentage
        total_marks = exam.total_marks if exam.total_marks else len(questions)
        percentage = (score / total_marks) * 100

        # ✅ PASS / FAIL
        status = "PASS" if percentage >= exam.passing_marks else "FAIL"

        # ✅ SAVE RESULT
        result = Result(
            user_id=user_id,
            exam_id=exam_id,
            score=score,
            total_questions=len(questions),
            correct_answers=correct,
            wrong_answers=wrong,
            percentage=percentage,
            completed_at=datetime.utcnow(),
            status=status
        )

        db.add(result)
        db.commit()

        return {
            "message": "Exam submitted",
            "score": score,
            "total_questions": len(questions),
            "correct_answers": correct,
            "wrong_answers": wrong,
            "percentage": percentage,
            "passing_marks": exam.passing_marks,
            "status": status
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e)}

    finally:
        db.close()        