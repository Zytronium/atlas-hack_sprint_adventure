from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400

        # Optional additional data
        additional_data = {k: v for k, v in data.items() if k not in ['email', 'password']}
        
        user_id = auth_service.register_user(
            data['email'], 
            data['password'], 
            additional_data
        )

        return jsonify({
            'message': 'User created successfully', 
            'user_id': user_id
        }), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400

        token, user_id = auth_service.login_user(
            data['email'], 
            data['password']
        )

        return jsonify({
            'token': token,
            'user_id': user_id
        }), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500