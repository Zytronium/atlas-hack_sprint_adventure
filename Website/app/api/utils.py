import jwt
from functools import wraps
from flask import request, jsonify
from app.config import Config
from app.services.firebase import FirebaseService

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if token is in request headers
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Authentication Token is missing'}), 401
        
        try:
            # Decode the token
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            
            # Verify user exists (optional additional check)
            db = FirebaseService.get_db(Config.FIREBASE_CREDENTIALS)
            current_user = db.collection('users').document(data['user_id']).get()
            
            if not current_user.exists:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated