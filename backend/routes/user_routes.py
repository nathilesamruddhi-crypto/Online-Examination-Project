# backend/routes/user_routes.py
from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal
from models import User, UserActivity
from schemas import (
    UserCreate, UserUpdate, UserResponse, 
    LoginSchema, LoginResponse, ActivityCreate
)
from auth import hash_password, verify_password, create_access_token
from sqlalchemy.exc import IntegrityError
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=dict)
def register(user: UserCreate):

    db = SessionLocal()

    try:

        logger.info(f"Registering user: {user.username}")

        if db.query(User).filter(User.username == user.username).first():
            db.close()
            return {"error": "Username already exists"}

        if db.query(User).filter(User.email == user.email).first():
            db.close()
            return {"error": "Email already exists"}

        new_user = User(
            username=user.username,
            email=user.email,
            password=hash_password(user.password),
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        user_id = new_user.id
        username = new_user.username
        role = new_user.role

        db.close()

        return {
            "message": "User created successfully",
            "user_id": user_id,
            "username": username,
            "role": role
        }

    except Exception as e:
        db.rollback()
        db.close()
        logger.error(f"Registration error: {e}")
        return {"error": str(e)}

@router.post("/login", response_model=dict)
def login(data: LoginSchema):
    """Login user."""
    db = SessionLocal()
    try:
        logger.info(f"Login attempt: {data.username}")
        
        user = db.query(User).filter(User.username == data.username).first()
        
        if not user:
            db.close()
            return {"error": "User not found"}
        
        if not user.is_active:
            db.close()
            return {"error": "Account is disabled"}
        
        if not verify_password(data.password, user.password):
            db.close()
            return {"error": "Wrong password"}
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id, "role": user.role}
        )
        
        # Log activity
        activity = UserActivity(
            user_id=user.id,
            activity_type="login",
            details="User logged in"
        )
        db.add(activity)
        db.commit()
        
        logger.info(f"✅ Login successful: {user.username} (role: {user.role})")
        db.close()
        
        return {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Login successful"
        }
        
    except Exception as e:
        db.close()
        logger.error(f"Login error: {e}")
        return {"error": str(e)}

@router.get("/profile/{user_id}", response_model=dict)
def get_profile(user_id: int):
    """Get user profile."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            db.close()
            return {"error": "User not found"}
        
        db.close()
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at,
            "is_active": user.is_active
        }
        
    except Exception as e:
        db.close()
        return {"error": str(e)}

@router.put("/profile/{user_id}", response_model=dict)
def update_profile(user_id: int, data: UserUpdate):
    """Update user profile."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            db.close()
            return {"error": "User not found"}
        
        # Update fields
        if data.email:
            # Check if email exists for other users
            existing = db.query(User).filter(
                User.email == data.email, 
                User.id != user_id
            ).first()
            if existing:
                db.close()
                return {"error": "Email already in use"}
            user.email = data.email
        
        if data.first_name:
            user.first_name = data.first_name
        if data.last_name:
            user.last_name = data.last_name
        if data.phone:
            user.phone = data.phone
        if data.password:
            user.password = hash_password(data.password)
        
        db.commit()
        db.refresh(user)
        
        # Log activity
        activity = UserActivity(
            user_id=user_id,
            activity_type="profile_update",
            details="Profile updated"
        )
        db.add(activity)
        db.commit()
        
        db.close()
        
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        db.rollback()
        db.close()
        return {"error": str(e)}

@router.get("/users", response_model=List[dict])
def get_all_users():
    """Get all users (admin only)."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        result = []
        
        for user in users:
            result.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at
            })
        
        db.close()
        return result
        
    except Exception as e:
        db.close()
        return {"error": str(e)}

@router.delete("/users/{user_id}", response_model=dict)
def delete_user(user_id: int):
    """Delete user (admin only)."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            db.close()
            return {"error": "User not found"}
        
        db.delete(user)
        db.commit()
        db.close()
        
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        db.rollback()
        db.close()
        return {"error": str(e)}