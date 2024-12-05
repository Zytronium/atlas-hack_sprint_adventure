import jwt
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from app.config import Config
from app.services.firebase import FirebaseService
from firebase_admin import firestore

class AuthService:
    def __init__(self):
        self.db = FirebaseService.get_db(Config.FIREBASE_CREDENTIALS)

    def register_user(self, email, password, additional_data=None):
        # Check if user exists
        existing_users = self.db.collection('users').where('email', '==', email).stream()
        if list(existing_users):
            raise ValueError('User already exists')

        # Prepare user data
        user_data = {
            'email': email,
            'password': generate_password_hash(password),
            'created_at': firestore.SERVER_TIMESTAMP
        }

        # Add additional data if provided
        if additional_data:
            user_data.update(additional_data)

        # Add to Firestore
        user_ref = self.db.collection('users').document()
        user_ref.set(user_data)

        return user_ref.id

    def login_user(self, email, password):
        # Find user
        users = list(self.db.collection('users').where('email', '==', email).stream())
        
        if not users:
            raise ValueError('User not found')

        user = users[0]
        user_dict = user.to_dict()

        # Verify password
        if not check_password_hash(user_dict['password'], password):
            raise ValueError('Invalid credentials')

        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_DELTA)
        }, Config.SECRET_KEY, algorithm='HS256')

        return token, user.id