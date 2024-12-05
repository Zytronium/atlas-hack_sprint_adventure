from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.auth.routes import auth_bp
from app.api.routes import api_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configure app
    app.config['SECRET_KEY'] = Config.SECRET_KEY

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

# For running directly
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)