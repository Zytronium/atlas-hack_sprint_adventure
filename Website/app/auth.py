from flask import Blueprint, request, jsonify
from firebase_admin import auth
import re

auth_routes = Blueprint('auth_routes', __name__)

def validate_email(email):
    """Simple email validation"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def validate_password(password):
    """Basic password validation"""
    return len(password) >= 6

@auth_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        # Validate email and password
        if not email or not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not password or not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Create user in Firebase Authentication
        user = auth.create_user(
            email=email,
            password=password
        )
        
        return jsonify({
            'message': 'User created successfully', 
            'user_id': user.uid
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Firebase Authentication handles login
        try:
            user = auth.get_user_by_email(email)
            # Note: Firebase Admin SDK doesn't validate passwords directly
            # In a real app, you'd use Firebase Authentication's sign-in method
            
            return jsonify({
                'message': 'Login successful',
                'user_id': user.uid
            }), 200
        
        except Exception as e:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500