import firebase_admin
from firebase_admin import credentials, firestore, db
from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": [
                "https://zytronium.github.io",
                "http://localhost:5000",
                "http://127.0.0.1:5000"
            ]
        }
    })
    
    # Initialize Firebase
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": "text-adventure-55f7e",
        "private_key_id": "5854172ebdfec209f06e7509824233e6dbf3c1ba",
        "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": "firebase-adminsdk-tyi4b@text-adventure-55f7e.iam.gserviceaccount.com",
        "client_id": "118190399587024702849",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tyi4b%40text-adventure-55f7e.iam.gserviceaccount.com"
    })
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://text-adventure-55f7e-default-rtdb.firebaseio.com/'
    })
    
    # Initialize Firestore and Realtime Database
    firestore_db = firestore.client()
    realtime_db = db.reference('/')
    
    app.config['FIRESTORE'] = firestore_db
    app.config['REALTIME_DB'] = realtime_db
    
    return app