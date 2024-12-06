import os
from flask import Flask
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__, 
                static_folder='static', 
                template_folder='templates')
    
    # Configure secret key
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

    # Initialize Firebase
    try:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": os.getenv('text-adventure-55f7e'),
            "private_key_id": os.getenv('5854172ebdfec209f06e7509824233e6dbf3c1ba'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('firebase-adminsdk-tyi4b@text-adventure-55f7e.iam.gserviceaccount.com'),
            "client_id": os.getenv('118190399587024702849')
        })
        initialize_app(cred, {
            'databaseURL': os.getenv('https://text-adventure-55f7e-default-rtdb.firebaseio.com/')
        })
    except Exception as e:
        print(f"Firebase initialization error: {e}")

    # Initialize Firestore
    firestore_db = firestore.client()
    app.config['FIRESTORE'] = firestore_db

    # Import and register blueprints
    from .routes import main_routes
    from .auth import auth_routes
    app.register_blueprint(main_routes)
    app.register_blueprint(auth_routes)

    return app

# Entry point for running the application
def run():
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    run()