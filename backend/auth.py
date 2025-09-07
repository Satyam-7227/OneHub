from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from functools import wraps
from database import User, bcrypt
from datetime import datetime, timedelta

def create_user_token(user):
    """Create JWT token for user"""
    additional_claims = {
        "user_id": user.get_id(),
        "email": user.email,
        "name": user.name
    }
    
    # Create token with 7 days expiry
    access_token = create_access_token(
        identity=user.get_id(),
        additional_claims=additional_claims,
        expires_delta=timedelta(days=7)
    )
    
    return access_token

def register_user(email, password, name):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return None, "User with this email already exists"
        
        # Create new user
        user = User(email=email, name=name)
        user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        if user.save():
            return user, None
        else:
            return None, "Failed to save user"
        
    except Exception as e:
        return None, str(e)

def authenticate_user(email, password):
    """Authenticate user with email and password"""
    try:
        user = User.find_by_email(email)
        
        if user and user.is_active and bcrypt.check_password_hash(user.password_hash, password):
            return user, None
        else:
            return None, "Invalid email or password"
    except Exception as e:
        return None, str(e)

def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        return user
    except:
        return None
