import jwt
from functools import wraps
from flask import request, jsonify, current_app
from app.services.firebase_service import FirebaseService
from app.config import Config

def web_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Check Origin
        origin = request.headers.get('Origin')
        if origin != Config.ALLOWED_WEBSITE:
            return jsonify({'error': 'Unauthorized website origin'}), 403

        # Check for Authorization token
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Authentication Token is missing'}), 401
        
        try:
            # Decode the token
            data = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=[Config.JWT_ALGORITHM]
            )
            
            # Optional: Additional verification with Firebase
            db = FirebaseService.get_db()
            current_user = db.collection('users').document(data['user_id']).get()
            
            if not current_user.exists:
                return jsonify({'error': 'User not found'}), 401
            
            # Attach user information to the request if needed
            request.user_id = data['user_id']
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated