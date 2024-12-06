from flask import Flask
from flask_cors import CORS
from app.config import Config
import os

def create_app():
    app = Flask(__name__)
    
    # Strict CORS configuration
    CORS(app, resources={
        r"/*": {
            "origins": [Config.ALLOWED_WEBSITE],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": [
                "Content-Type", 
                "Authorization", 
                "Access-Control-Allow-Credentials"
            ]
        }
    })

    # Configure app
    app.config['SECRET_KEY'] = Config.SECRET_KEY

    # Import and register blueprints
    from app.auth.routes import auth_bp
    from app.api.routes import api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0', 
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_DEBUG', 'False') == 'True'
    )