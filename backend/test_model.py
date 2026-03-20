# backend/test_model.py
print("Testing model imports...")

try:
    from sqlalchemy import Column, Integer, String, DateTime
    print("✓ SQLAlchemy imports successful")
except Exception as e:
    print(f"✗ SQLAlchemy import error: {e}")

try:
    from database import Base
    print("✓ Database Base import successful")
except Exception as e:
    print(f"✗ Database Base import error: {e}")

try:
    from datetime import datetime
    print("✓ Datetime import successful")
except Exception as e:
    print(f"✗ Datetime import error: {e}")

print("\nNow testing full model import...")

try:
    from models import User
    print("✓ User model imported successfully")
except Exception as e:
    print(f"✗ User model import error: {e}")
    import traceback
    traceback.print_exc()