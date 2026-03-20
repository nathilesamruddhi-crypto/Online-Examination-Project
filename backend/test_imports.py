# backend/test_imports.py
print("Testing imports...")

try:
    from database import Base, engine, SessionLocal
    print("✅ database.py imported successfully")
except Exception as e:
    print(f"❌ Error importing database: {e}")

try:
    from models import User, Exam, Question, Result
    print("✅ models.py imported successfully")
except Exception as e:
    print(f"❌ Error importing models: {e}")

try:
    from schemas import UserCreate, LoginSchema, QuestionCreate, AnswerSubmit
    print("✅ schemas.py imported successfully")
except Exception as e:
    print(f"❌ Error importing schemas: {e}")

try:
    from auth import hash_password, verify_password
    print("✅ auth.py imported successfully")
except Exception as e:
    print(f"❌ Error importing auth: {e}")

try:
    from routes import user_routes, exam_routes, result_routes
    print("✅ routes imported successfully")
except Exception as e:
    print(f"❌ Error importing routes: {e}")

print("\nTest completed!")