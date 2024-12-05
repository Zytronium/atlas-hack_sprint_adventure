import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask
from flask_cors import CORS

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
    cred = credentials.Certificate('config/firebase_credentials.json')
    firebase_admin.initialize_app(cred)
    
    # Initialize Firestore
    db = firestore.client()
    app.config['FIRESTORE'] = db
    
    return app